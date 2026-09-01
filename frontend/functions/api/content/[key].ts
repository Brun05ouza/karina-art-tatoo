import { requireAdmin } from "../../_lib/auth";
import {
  error,
  handleError,
  hasSupabaseConfig,
  json,
  requireSupabaseConfig,
  type Env,
  type SupabaseConfig,
} from "../../_lib/config";
import { getSql, type Sql } from "../../_lib/db";
import { removeObjects } from "../../_lib/supabase";
import { isValidContentKey, OBJECT_KEY_PATTERN, readJson } from "../../_lib/validation";

const storageKeyFieldPattern = /(image|video|media|avatar|background|hero|poster|thumb|trailer|object)key$/i;

function objectKeyFromSupabaseUrl(value: string, config: SupabaseConfig): string | null {
  try {
    const url = new URL(value);
    if (url.origin !== new URL(config.url).origin) return null;

    const parts = url.pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
    const prefix = ["storage", "v1", "object"];
    if (!prefix.every((part, index) => parts[index] === part)) return null;
    if (!["public", "sign"].includes(parts[3] || "")) return null;
    if (parts[4] !== config.bucket) return null;

    const objectKey = parts.slice(5).join("/");
    return OBJECT_KEY_PATTERN.test(objectKey) ? objectKey : null;
  } catch {
    return null;
  }
}

function collectStorageObjectKeys(value: unknown, config: SupabaseConfig): Set<string> {
  const keys = new Set<string>();

  const visit = (entry: unknown, fieldKey = "") => {
    if (typeof entry === "string") {
      const fromUrl = objectKeyFromSupabaseUrl(entry, config);
      if (fromUrl) keys.add(fromUrl);
      if (storageKeyFieldPattern.test(fieldKey) && OBJECT_KEY_PATTERN.test(entry)) keys.add(entry);
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

/**
 * Remove do bucket as imagens que saíram do documento e não são referenciadas
 * por nenhum outro. Roda depois da resposta, via waitUntil.
 */
async function cleanupRemovedStorageObjects(
  sql: Sql,
  env: Env,
  previousValue: unknown,
  nextValue: unknown,
): Promise<void> {
  if (!previousValue || !hasSupabaseConfig(env)) return;

  const config = requireSupabaseConfig(env);
  const previousKeys = collectStorageObjectKeys(previousValue, config);
  if (previousKeys.size === 0) return;

  const nextKeys = collectStorageObjectKeys(nextValue, config);
  const removedKeys = [...previousKeys].filter((key) => !nextKeys.has(key));
  if (removedKeys.length === 0) return;

  const rows = (await sql`SELECT value FROM content_entries`) as Array<{ value: unknown }>;
  const stillReferenced = new Set<string>();
  rows.forEach((row) => {
    collectStorageObjectKeys(row.value, config).forEach((key) => stillReferenced.add(key));
  });

  const disposableKeys = removedKeys.filter((key) => !stillReferenced.has(key));
  if (disposableKeys.length === 0) return;

  await removeObjects(config, disposableKeys);
  for (const key of disposableKeys) {
    await sql`DELETE FROM media_assets WHERE object_key = ${key}`;
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  try {
    const key = params.key;
    if (!isValidContentKey(key)) return error(400, "Chave de conteúdo inválida.");

    const sql = getSql(env);
    const rows = await sql`
      SELECT key, value, updated_at AS "updatedAt"
      FROM content_entries
      WHERE key = ${key} AND published = true
      LIMIT 1
    `;

    // 200 com value null quando ausente — mesmo contrato do backend antigo,
    // do qual o content-loader do frontend depende para cair no fallback.
    return json(rows[0] ?? { key, value: null, updatedAt: null });
  } catch (cause) {
    return handleError(cause);
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params, waitUntil }) => {
  try {
    const key = params.key;
    if (!isValidContentKey(key)) return error(400, "Chave de conteúdo inválida.");

    const sql = getSql(env);
    if (!(await requireAdmin(request, env, sql))) return error(401, "Não autorizado.");

    const body = await readJson<{ value?: unknown; published?: unknown }>(request);
    if (!body || !Object.prototype.hasOwnProperty.call(body, "value")) {
      return error(400, "Dados de conteúdo inválidos.");
    }
    const published = typeof body.published === "boolean" ? body.published : true;

    const previousRows = (await sql`
      SELECT value FROM content_entries WHERE key = ${key} LIMIT 1
    `) as Array<{ value: unknown }>;
    const previousValue = previousRows[0]?.value;

    const serializedValue = JSON.stringify(body.value) ?? "null";
    const rows = await sql`
      INSERT INTO content_entries (key, value, published)
      VALUES (${key}, CAST(${serializedValue} AS jsonb), ${published})
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        published = EXCLUDED.published,
        updated_at = NOW()
      RETURNING key, value, published, updated_at AS "updatedAt"
    `;

    /**
     * waitUntil é obrigatório aqui. No Node o backend antigo disparava a
     * limpeza sem await e o processo continuava vivo; em Workers o isolate é
     * encerrado assim que a resposta sai, e a limpeza morreria no meio sem
     * nenhum erro visível — o bucket iria acumulando imagens órfãs.
     */
    waitUntil(
      cleanupRemovedStorageObjects(sql, env, previousValue, body.value).catch((cause) => {
        console.warn("Não foi possível limpar imagens removidas do Supabase Storage.", cause);
      }),
    );

    return json(rows[0], { status: 200 });
  } catch (cause) {
    return handleError(cause);
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  try {
    const key = params.key;
    if (!isValidContentKey(key)) return error(400, "Chave de conteúdo inválida.");

    const sql = getSql(env);
    if (!(await requireAdmin(request, env, sql))) return error(401, "Não autorizado.");

    const rows = await sql`DELETE FROM content_entries WHERE key = ${key} RETURNING id`;
    if (!rows[0]) return error(404, "Conteúdo não encontrado.");

    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  } catch (cause) {
    return handleError(cause);
  }
};
