import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAdmin } from "../auth.js";
import { hasSupabaseConfig, requireSupabaseConfig, type SupabaseConfig } from "../config.js";
import { sql } from "../db.js";
import { getSupabase } from "../supabase.js";

const keySchema = z.string().min(1).max(120).regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/);
const paramsSchema = z.object({ key: keySchema });
const upsertSchema = z
  .object({
    value: z.unknown(),
    published: z.boolean().default(true),
  })
  .refine((body) => Object.prototype.hasOwnProperty.call(body, "value"), "O campo value é obrigatório.");

const objectKeyPattern = /^[a-z0-9][a-z0-9/._-]+$/i;
const storageKeyFieldPattern = /(image|video|media|avatar|background|hero|poster|thumb|trailer|object)key$/i;

function objectKeyFromSupabaseUrl(value: string, config: SupabaseConfig) {
  try {
    const url = new URL(value);
    const expectedOrigin = new URL(config.url).origin;
    if (url.origin !== expectedOrigin) return null;

    const parts = url.pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
    const prefix = ["storage", "v1", "object"];
    if (!prefix.every((part, index) => parts[index] === part)) return null;
    if (!["public", "sign"].includes(parts[3] || "")) return null;
    if (parts[4] !== config.bucket) return null;

    const objectKey = parts.slice(5).join("/");
    return objectKeyPattern.test(objectKey) ? objectKey : null;
  } catch {
    return null;
  }
}

function collectStorageObjectKeys(value: unknown, config: SupabaseConfig) {
  const keys = new Set<string>();

  const visit = (entry: unknown, fieldKey = "") => {
    if (typeof entry === "string") {
      const fromUrl = objectKeyFromSupabaseUrl(entry, config);
      if (fromUrl) keys.add(fromUrl);
      if (storageKeyFieldPattern.test(fieldKey) && objectKeyPattern.test(entry)) keys.add(entry);
      return;
    }

    if (Array.isArray(entry)) {
      entry.forEach((item) => visit(item, fieldKey));
      return;
    }

    if (entry && typeof entry === "object") {
      Object.entries(entry as Record<string, unknown>).forEach(([key, next]) => visit(next, key));
    }
  };

  visit(value);
  return keys;
}

async function cleanupRemovedStorageObjects(previousValue: unknown, nextValue: unknown) {
  if (!previousValue || !hasSupabaseConfig()) return;

  const config = requireSupabaseConfig();
  const previousKeys = collectStorageObjectKeys(previousValue, config);
  if (previousKeys.size === 0) return;

  const nextKeys = collectStorageObjectKeys(nextValue, config);
  const removedKeys = [...previousKeys].filter((key) => !nextKeys.has(key));
  if (removedKeys.length === 0) return;

  const rows = await sql`
    SELECT value
    FROM content_entries
  `;
  const stillReferenced = new Set<string>();
  rows.forEach((row) => {
    collectStorageObjectKeys(row.value, config).forEach((key) => stillReferenced.add(key));
  });

  const disposableKeys = removedKeys.filter((key) => !stillReferenced.has(key));
  if (disposableKeys.length === 0) return;

  const { error } = await getSupabase().storage.from(config.bucket).remove(disposableKeys);
  if (error) throw error;

  for (const key of disposableKeys) {
    await sql`DELETE FROM media_assets WHERE object_key = ${key}`;
  }
}

export async function contentRoutes(app: FastifyInstance) {
  app.get("/content", async () => {
    const rows = await sql`
      SELECT key, value, updated_at AS "updatedAt"
      FROM content_entries
      WHERE published = true
      ORDER BY key ASC
    `;

    return { items: rows };
  });

  app.get("/content/:key", async (request, reply) => {
    const params = paramsSchema.safeParse(request.params);
    if (!params.success) return reply.code(400).send({ error: "Chave de conteúdo inválida." });

    const rows = await sql`
      SELECT key, value, updated_at AS "updatedAt"
      FROM content_entries
      WHERE key = ${params.data.key} AND published = true
      LIMIT 1
    `;

    const entry = rows[0];
    if (!entry) return reply.code(404).send({ error: "Conteúdo não encontrado." });

    return entry;
  });

  app.put("/content/:key", { preHandler: requireAdmin }, async (request, reply) => {
    const params = paramsSchema.safeParse(request.params);
    const body = upsertSchema.safeParse(request.body);

    if (!params.success || !body.success) {
      return reply.code(400).send({ error: "Dados de conteúdo inválidos." });
    }

    const previousRows = await sql`
      SELECT value
      FROM content_entries
      WHERE key = ${params.data.key}
      LIMIT 1
    `;
    const previousValue = previousRows[0]?.value;

    const serializedValue = JSON.stringify(body.data.value) ?? "null";
    const rows = await sql`
      INSERT INTO content_entries (key, value, published)
      VALUES (${params.data.key}, CAST(${serializedValue} AS jsonb), ${body.data.published})
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        published = EXCLUDED.published,
        updated_at = NOW()
      RETURNING key, value, published, updated_at AS "updatedAt"
    `;

    cleanupRemovedStorageObjects(previousValue, body.data.value).catch((cause) => {
      request.log.warn({ err: cause }, "Nao foi possivel limpar imagens removidas do Supabase Storage.");
    });

    return reply.code(200).send(rows[0]);
  });

  app.delete("/content/:key", { preHandler: requireAdmin }, async (request, reply) => {
    const params = paramsSchema.safeParse(request.params);
    if (!params.success) return reply.code(400).send({ error: "Chave de conteúdo inválida." });

    const rows = await sql`
      DELETE FROM content_entries
      WHERE key = ${params.data.key}
      RETURNING id
    `;

    if (!rows[0]) return reply.code(404).send({ error: "Conteúdo não encontrado." });
    return reply.code(204).send();
  });
}
