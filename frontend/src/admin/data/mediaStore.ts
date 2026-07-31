const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function prepareLocalImage(file: File) {
  if (!acceptedTypes.has(file.type)) throw new Error("Use uma imagem JPG, PNG, WebP ou AVIF.");
  if (file.size > 2 * 1024 * 1024) throw new Error("A imagem precisa ter no máximo 2 MB.");

  // TODO(r2): POST /api/uploads/presign -> PUT direto no R2 -> POST /api/media.
  // O object URL é apenas um preview temporário da etapa de mocks.
  return { imageUrl: URL.createObjectURL(file), imageKey: `local:${file.name}` };
}
