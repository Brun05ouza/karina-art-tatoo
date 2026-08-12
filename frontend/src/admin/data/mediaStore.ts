import { adminFetch } from "../auth/adminApi";

const acceptedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);
const acceptedVideoTypes = new Set(["video/mp4", "video/webm"]);
const imageTypesByExtension: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
};

type PresignResponse = { objectKey: string; publicUrl: string; uploadUrl: string; requiredHeaders: Record<string, string> };

function getExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function getImageContentType(file: File) {
  return file.type || imageTypesByExtension[getExtension(file)] || "";
}

/**
 * Sobe o arquivo pro Supabase Storage (via URL assinada) e registra no Neon.
 * `folder` organiza o bucket por seção — ex.: "home/hero", "sobre/bastidores".
 */
async function upload(file: File, folder: string, contentType = file.type): Promise<{ url: string; key: string }> {
  const presign = await adminFetch<PresignResponse>("/api/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ contentType, folder }),
  });

  const putResponse = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: presign.requiredHeaders,
    body: file,
  });
  if (!putResponse.ok) throw new Error("Falha ao enviar o arquivo.");

  // Cataloga no Neon; se isso falhar, o arquivo já está no bucket e a URL
  // pública funciona igual — só não aparece na lista de mídia.
  await adminFetch("/api/media", {
    method: "POST",
    body: JSON.stringify({ objectKey: presign.objectKey, contentType }),
  }).catch(() => {});

  return { url: presign.publicUrl, key: presign.objectKey };
}

export async function uploadImage(file: File, folder = "site") {
  const contentType = getImageContentType(file);
  if (!acceptedImageTypes.has(contentType)) throw new Error("Use uma imagem JPG, PNG, WebP, AVIF ou HEIC.");
  if (file.size > 2 * 1024 * 1024) throw new Error("A imagem precisa ter no máximo 2 MB.");

  const { url, key } = await upload(file, folder, contentType);
  return { imageUrl: url, imageKey: key };
}

export async function uploadVideo(file: File, folder = "site") {
  if (!acceptedVideoTypes.has(file.type)) throw new Error("Use um vídeo MP4 ou WebM.");
  if (file.size > 20 * 1024 * 1024) throw new Error("O vídeo precisa ter no máximo 20 MB.");

  const { url, key } = await upload(file, folder);
  return { videoUrl: url, videoKey: key };
}
