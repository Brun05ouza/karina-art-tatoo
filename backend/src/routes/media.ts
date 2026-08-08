import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAdmin } from "../auth.js";
import { requireSupabaseConfig } from "../config.js";
import { sql } from "../db.js";
import { getSupabase } from "../supabase.js";

const mediaSchema = z.object({
  objectKey: z.string().min(1).max(500).regex(/^[a-z0-9][a-z0-9/._-]+$/),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm"]),
  altText: z.string().trim().max(300).optional(),
});

export async function mediaRoutes(app: FastifyInstance) {
  app.get("/media", async () => {
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

    return { items: rows };
  });

  app.post("/media", { preHandler: requireAdmin }, async (request, reply) => {
    const body = mediaSchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: "Metadados de imagem inválidos." });

    // Resolvido fora do try: um ConfigError (credenciais Supabase ausentes) cairia no
    // catch abaixo e viraria o 400 enganoso "a imagem ainda não existe".
    const config = requireSupabaseConfig();
    const supabase = getSupabase();

    const lastSlash = body.data.objectKey.lastIndexOf("/");
    const folder = lastSlash >= 0 ? body.data.objectKey.slice(0, lastSlash) : "";
    const filename = lastSlash >= 0 ? body.data.objectKey.slice(lastSlash + 1) : body.data.objectKey;

    const { data: listing, error: listError } = await supabase.storage.from(config.bucket).list(folder, { search: filename });
    if (listError || !listing?.some((entry) => entry.name === filename)) {
      return reply.code(400).send({ error: "A imagem ainda não existe no bucket." });
    }

    const { data: publicUrlData } = supabase.storage.from(config.bucket).getPublicUrl(body.data.objectKey);
    const publicUrl = publicUrlData.publicUrl;
    const rows = await sql`
      INSERT INTO media_assets (object_key, public_url, content_type, alt_text)
      VALUES (
        ${body.data.objectKey},
        ${publicUrl},
        ${body.data.contentType},
        ${body.data.altText ?? null}
      )
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

    return reply.code(201).send(rows[0]);
  });
}
