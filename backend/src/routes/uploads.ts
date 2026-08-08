import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAdmin } from "../auth.js";
import { requireSupabaseConfig } from "../config.js";
import { getSupabase } from "../supabase.js";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm"] as const;
const extensionsByType: Record<(typeof allowedTypes)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const uploadSchema = z.object({
  contentType: z.enum(allowedTypes),
  folder: z.string().regex(/^[a-z0-9][a-z0-9/-]{0,60}$/).default("site"),
});

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/uploads/presign", { preHandler: requireAdmin }, async (request, reply) => {
    const body = uploadSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: "Formato ou pasta de upload inválidos." });
    }

    const config = requireSupabaseConfig();
    const extension = extensionsByType[body.data.contentType];
    const objectKey = `${body.data.folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;

    const { data, error } = await getSupabase().storage.from(config.bucket).createSignedUploadUrl(objectKey);
    if (error || !data) {
      return reply.code(502).send({ error: "Não foi possível gerar o link de upload." });
    }

    const { data: publicUrlData } = getSupabase().storage.from(config.bucket).getPublicUrl(objectKey);

    return reply.send({
      objectKey,
      publicUrl: publicUrlData.publicUrl,
      uploadUrl: data.signedUrl,
      requiredHeaders: {
        "Content-Type": body.data.contentType,
      },
    });
  });
}
