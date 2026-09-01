/**
 * Validações escritas à mão, substituindo os schemas Zod do backend antigo.
 *
 * São seis validações triviais (regex de chave, e-mail, enum de MIME, limites
 * de tamanho). Trazer o Zod para o bundle das Functions custaria dezenas de KB
 * e um pouco de CPU por requisição — e o plano gratuito mede CPU. As regras
 * abaixo são idênticas às do backend, só sem a biblioteca.
 */

export const CONTENT_KEY_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
export const OBJECT_KEY_PATTERN = /^[a-z0-9][a-z0-9/._-]+$/i;
export const FOLDER_PATTERN = /^[a-z0-9][a-z0-9/-]{0,60}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  "video/mp4",
  "video/webm",
] as const;

export type MediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

export const EXTENSION_BY_TYPE: Record<MediaType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/heic-sequence": "heic",
  "image/heif-sequence": "heif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export function isMediaType(value: unknown): value is MediaType {
  return typeof value === "string" && (ALLOWED_MEDIA_TYPES as readonly string[]).includes(value);
}

export function isValidContentKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 1 && value.length <= 120 && CONTENT_KEY_PATTERN.test(value);
}

export function isValidObjectKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 1 && value.length <= 500 && OBJECT_KEY_PATTERN.test(value);
}

export function normalizeLoginEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 200 || !EMAIL_PATTERN.test(email)) return null;
  return email;
}

export function isValidPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 1 && value.length <= 200;
}

/** Lê o body como JSON, devolvendo null em vez de lançar quando malformado. */
export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return null;
    return body as T;
  } catch {
    return null;
  }
}

/** IP do cliente. Em Cloudflare, CF-Connecting-IP é confiável e não falsificável. */
export function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
