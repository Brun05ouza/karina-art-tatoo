import { requireAdmin } from "../_lib/auth";
import { error, handleError, json, requireSupabaseConfig, type Env } from "../_lib/config";
import { getSql } from "../_lib/db";
import { getPublicUrl, objectExists } from "../_lib/supabase";
import { isMediaType, isValidObjectKey, readJson } from "../_lib/validation";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const sql = getSql(env);
    const rows = await sql`
      SELECT
        object_key AS "objectKey",
        public_url AS "publicUrl",
        content_type AS "contentType",
        alt_text AS "altText",
        created_at AS "createdAt"
      FROM media_assets
      ORDER BY created_at DESC
    `;

    return json({ items: rows });
  } catch (cause) {
    return handleError(cause);
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const sql = getSql(env);
    if (!(await requireAdmin(request, env, sql))) return error(401, "Não autorizado.");

    const body = await readJson<{ objectKey?: unknown; contentType?: unknown; altText?: unknown }>(request);
    if (!body || !isValidObjectKey(body.objectKey) || !isMediaType(body.contentType)) {
      return error(400, "Metadados de imagem inválidos.");
    }

    const altText =
      typeof body.altText === "string" && body.altText.trim().length <= 300 ? body.altText.trim() : null;

    // Resolvido fora do bloco de verificação: um ConfigError (credenciais
    // ausentes) não pode virar o 400 enganoso "a imagem ainda não existe".
    const config = requireSupabaseConfig(env);

    if (!(await objectExists(config, body.objectKey))) {
      return error(400, "A imagem ainda não existe no bucket.");
    }

    const publicUrl = getPublicUrl(config, body.objectKey);
    const rows = await sql`
      INSERT INTO media_assets (object_key, public_url, content_type, alt_text)
      VALUES (${body.objectKey}, ${publicUrl}, ${body.contentType}, ${altText})
      ON CONFLICT (object_key) DO UPDATE SET
        public_url = EXCLUDED.public_url,
        content_type = EXCLUDED.content_type,
        alt_text = EXCLUDED.alt_text
      RETURNING
        object_key AS "objectKey",
        public_url AS "publicUrl",
        content_type AS "contentType",
        alt_text AS "altText",
        created_at AS "createdAt"
    `;

    return json(rows[0], { status: 201 });
  } catch (cause) {
    return handleError(cause);
  }
};
