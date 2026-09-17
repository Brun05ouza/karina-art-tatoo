/** Configurações do site (key/value). Número do WhatsApp é a chave principal. */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { requireEnv, type Env } from "./config";

export const SETTINGS_KEYS = {
  whatsappPhone: "whatsapp_phone",
  developmentMode: "development_mode",
  youtubeVisible: "youtube_visible",
  youtubeUrl: "youtube_url",
  youtubeThumbUrl: "youtube_thumb_url",
  youtubeThumbKey: "youtube_thumb_key",
  youtubeTrailerUrl: "youtube_trailer_url",
  youtubeTrailerKey: "youtube_trailer_key",
  productsHeroImageUrl: "products_hero_image_url",
  productsHeroImageKey: "products_hero_image_key",
  productsHeroFocalX: "products_hero_focal_x",
  productsHeroFocalY: "products_hero_focal_y",
} as const;

export const YOUTUBE_VIDEO_MAX_BYTES = 10 * 1024 * 1024;

/** Fallback alinhado a SITE.phone (seo.ts) — CTAs nunca ficam sem número. */
export const FALLBACK_WHATSAPP_PHONE = "5521990724477";

function sql(env: Env): NeonQueryFunction<false, false> {
  return neon(requireEnv(env, "DATABASE_URL"));
}

export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Número BR completo: DDI 55 + DDD (2) + 8 ou 9 dígitos.
 * Aceita máscara na entrada; persiste só dígitos.
 */
export function validateWhatsappPhone(
  raw: unknown,
): { ok: true; phone: string } | { ok: false; message: string } {
  const phone = digitsOnly(String(raw ?? ""));
  if (!phone) {
    return { ok: false, message: "Informe o número do WhatsApp." };
  }
  if (!phone.startsWith("55")) {
    return {
      ok: false,
      message: "Inclua o DDI do Brasil (55), o DDD e o número.",
    };
  }
  if (phone.length < 12 || phone.length > 13) {
    return {
      ok: false,
      message: "Número incompleto. Use DDI + DDD + número (ex.: 55 21 99072-4477).",
    };
  }
  const ddd = phone.slice(2, 4);
  if (!/^[1-9]\d$/.test(ddd)) {
    return { ok: false, message: "DDD inválido." };
  }
  return { ok: true, phone };
}

/** Formata 5521990724477 → (21) 99072-4477 */
export function formatBrWhatsapp(digits: string): string {
  const d = digitsOnly(digits);
  if (d.length === 13) {
    return `(${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  }
  if (d.length === 12) {
    return `(${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`;
  }
  return d;
}

export function buildWhatsappUrl(phoneDigits: string, message?: string | null): string {
  const phone = digitsOnly(phoneDigits) || FALLBACK_WHATSAPP_PHONE;
  const base = `https://wa.me/${phone}`;
  const text = message?.trim();
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export async function getSetting(env: Env, key: string): Promise<string | null> {
  const db = sql(env);
  const rows = await db`
    SELECT value FROM site_settings WHERE key = ${key} LIMIT 1
  `;
  if (!rows[0]) return null;
  return String((rows[0] as { value: string }).value);
}

export async function setSetting(env: Env, key: string, value: string): Promise<void> {
  const db = sql(env);
  await db`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

export async function getWhatsappPhone(env: Env): Promise<string> {
  const value = await getSetting(env, SETTINGS_KEYS.whatsappPhone);
  if (!value) return FALLBACK_WHATSAPP_PHONE;
  const digits = digitsOnly(value);
  return digits || FALLBACK_WHATSAPP_PHONE;
}

export function parseDevelopmentMode(value: string | null): boolean {
  return value === "true";
}

/** Ausente no banco = desligado. O frontend decide o fallback se a API falhar. */
export async function getDevelopmentMode(env: Env): Promise<boolean> {
  const value = await getSetting(env, SETTINGS_KEYS.developmentMode);
  return parseDevelopmentMode(value);
}

export async function setDevelopmentMode(env: Env, enabled: boolean): Promise<void> {
  await setSetting(env, SETTINGS_KEYS.developmentMode, enabled ? "true" : "false");
}

export type YoutubeFeatureSettings = {
  visible: boolean;
  youtubeUrl: string;
  thumbUrl: string;
  thumbKey: string;
  trailerUrl: string;
  trailerKey: string;
};

const YOUTUBE_HOSTS = new Set(["youtube.com", "youtu.be"]);

function isYoutubeHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (YOUTUBE_HOSTS.has(host)) return true;
  return host.endsWith(".youtube.com") || host.endsWith(".youtu.be");
}

/** Vazio limpa o link. Qualquer outro valor precisa ser http(s) no YouTube. */
export function validateYoutubeUrl(
  raw: unknown,
): { ok: true; url: string } | { ok: false; message: string } {
  const url = typeof raw === "string" ? raw.trim() : "";
  if (!url) return { ok: true, url: "" };
  if (url.length > 2000) return { ok: false, message: "URL longa demais." };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, message: "URL inválida." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, message: "Use apenas links http ou https." };
  }
  if (!isYoutubeHost(parsed.hostname)) {
    return { ok: false, message: "O link precisa ser do YouTube (youtube.com ou youtu.be)." };
  }
  return { ok: true, url: parsed.toString() };
}

export function validateStoredMediaUrl(
  raw: unknown,
): { ok: true; url: string } | { ok: false; message: string } {
  const url = typeof raw === "string" ? raw.trim() : "";
  if (!url) return { ok: true, url: "" };
  if (url.length > 2000) return { ok: false, message: "URL da mídia longa demais." };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, message: "URL da mídia inválida." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, message: "A mídia precisa ser um link http ou https." };
  }
  return { ok: true, url: parsed.toString() };
}

export async function getYoutubeFeature(env: Env): Promise<YoutubeFeatureSettings> {
  const [visible, youtubeUrl, thumbUrl, thumbKey, trailerUrl, trailerKey] = await Promise.all([
    getSetting(env, SETTINGS_KEYS.youtubeVisible),
    getSetting(env, SETTINGS_KEYS.youtubeUrl),
    getSetting(env, SETTINGS_KEYS.youtubeThumbUrl),
    getSetting(env, SETTINGS_KEYS.youtubeThumbKey),
    getSetting(env, SETTINGS_KEYS.youtubeTrailerUrl),
    getSetting(env, SETTINGS_KEYS.youtubeTrailerKey),
  ]);
  return {
    visible: visible !== "false",
    youtubeUrl: youtubeUrl?.trim() ?? "",
    thumbUrl: thumbUrl?.trim() ?? "",
    thumbKey: thumbKey?.trim() ?? "",
    trailerUrl: trailerUrl?.trim() ?? "",
    trailerKey: trailerKey?.trim() ?? "",
  };
}

export async function setYoutubeVisible(env: Env, enabled: boolean): Promise<void> {
  await setSetting(env, SETTINGS_KEYS.youtubeVisible, enabled ? "true" : "false");
}

export async function setYoutubeUrl(env: Env, raw: unknown): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const check = validateYoutubeUrl(raw);
  if (!check.ok) return check;
  await setSetting(env, SETTINGS_KEYS.youtubeUrl, check.url);
  return check;
}

export async function setYoutubeThumb(
  env: Env,
  url: string,
  key: string,
): Promise<void> {
  await setSetting(env, SETTINGS_KEYS.youtubeThumbUrl, url);
  await setSetting(env, SETTINGS_KEYS.youtubeThumbKey, key);
}

export async function setYoutubeTrailer(
  env: Env,
  url: string,
  key: string,
): Promise<void> {
  await setSetting(env, SETTINGS_KEYS.youtubeTrailerUrl, url);
  await setSetting(env, SETTINGS_KEYS.youtubeTrailerKey, key);
}

export type ProductsHeroSettings = {
  imageUrl: string;
  imageKey: string;
  focalX: number;
  focalY: number;
};

function clampFocalSetting(raw: string | null | undefined, fallback = 50): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export async function getProductsHero(env: Env): Promise<ProductsHeroSettings> {
  const [imageUrl, imageKey, focalX, focalY] = await Promise.all([
    getSetting(env, SETTINGS_KEYS.productsHeroImageUrl),
    getSetting(env, SETTINGS_KEYS.productsHeroImageKey),
    getSetting(env, SETTINGS_KEYS.productsHeroFocalX),
    getSetting(env, SETTINGS_KEYS.productsHeroFocalY),
  ]);
  return {
    imageUrl: imageUrl?.trim() ?? "",
    imageKey: imageKey?.trim() ?? "",
    focalX: clampFocalSetting(focalX),
    focalY: clampFocalSetting(focalY),
  };
}

export async function setProductsHero(
  env: Env,
  url: string,
  key: string,
  focalX = 50,
  focalY = 50,
): Promise<void> {
  await setSetting(env, SETTINGS_KEYS.productsHeroImageUrl, url);
  await setSetting(env, SETTINGS_KEYS.productsHeroImageKey, key);
  await setSetting(env, SETTINGS_KEYS.productsHeroFocalX, String(clampFocalSetting(String(focalX))));
  await setSetting(env, SETTINGS_KEYS.productsHeroFocalY, String(clampFocalSetting(String(focalY))));
}

export async function setProductsHeroFocal(
  env: Env,
  focalX: number,
  focalY: number,
): Promise<void> {
  await setSetting(env, SETTINGS_KEYS.productsHeroFocalX, String(clampFocalSetting(String(focalX))));
  await setSetting(env, SETTINGS_KEYS.productsHeroFocalY, String(clampFocalSetting(String(focalY))));
}

export async function setWhatsappPhone(
  env: Env,
  raw: unknown,
): Promise<{ ok: true; phone: string } | { ok: false; message: string }> {
  const check = validateWhatsappPhone(raw);
  if (!check.ok) return check;
  await setSetting(env, SETTINGS_KEYS.whatsappPhone, check.phone);
  return check;
}
