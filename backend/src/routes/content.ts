import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAdmin } from "../auth.js";
import { sql } from "../db.js";

const keySchema = z.string().min(1).max(120).regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/);
const paramsSchema = z.object({ key: keySchema });
const upsertSchema = z
  .object({
    value: z.unknown(),
    published: z.boolean().default(true),
  })
  .refine((body) => Object.prototype.hasOwnProperty.call(body, "value"), "O campo value é obrigatório.");

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
