import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAdmin } from "../auth.js";
import { requireR2Config } from "../config.js";
import { getR2 } from "../r2.js";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
const imageExtensions: Record<(typeof allowedImageTypes)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const uploadSchema = z.object({
  contentType: z.enum(allowedImageTypes),
  folder: z.string().regex(/^[a-z0-9][a-z0-9/-]{0,60}$/).default("site"),
});

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/uploads/presign", { preHandler: requireAdmin }, async (request, reply) => {
    const body = uploadSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: "Formato ou pasta de upload inválidos." });
    }

    const r2Config = requireR2Config();
    const extension = imageExtensions[body.data.contentType];
    const objectKey = `${body.data.folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey,
      ContentType: body.data.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });
    const uploadUrl = await getSignedUrl(getR2(), command, { expiresIn: 300 });
    const publicUrl = `${r2Config.publicBaseUrl.replace(/\/$/, "")}/${objectKey}`;

    return reply.send({
      objectKey,
      publicUrl,
      uploadUrl,
      expiresIn: 300,
      requiredHeaders: {
        "Content-Type": body.data.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  });
}
