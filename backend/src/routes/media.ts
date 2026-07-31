import { HeadObjectCommand } from "@aws-sdk/client-s3";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAdmin } from "../auth.js";
import { requireR2Config } from "../config.js";
import { sql } from "../db.js";
import { getR2 } from "../r2.js";

const mediaSchema = z.object({
  objectKey: z.string().min(1).max(500).regex(/^[a-z0-9][a-z0-9/._-]+$/),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
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

    // Resolvidos fora do try: um ConfigError (credenciais R2 ausentes) cairia no
    // catch abaixo e viraria o 400 enganoso "a imagem ainda não existe".
    const r2 = getR2();
    const r2Config = requireR2Config();

    try {
      await r2.send(
        new HeadObjectCommand({
          Bucket: r2Config.bucketName,
          Key: body.data.objectKey,
        }),
      );
    } catch {
      return reply.code(400).send({ error: "A imagem ainda não existe no bucket." });
    }

    const publicUrl = `${r2Config.publicBaseUrl.replace(/\/$/, "")}/${body.data.objectKey}`;
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
