/** Configurações do site (key/value). Número do WhatsApp é a chave principal. */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { requireEnv, type Env } from "./config";

export const SETTINGS_KEYS = {
  whatsappPhone: "whatsapp_phone",
  developmentMode: "development_mode",
} as const;

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

export async function setWhatsappPhone(
  env: Env,
  raw: unknown,
): Promise<{ ok: true; phone: string } | { ok: false; message: string }> {
  const check = validateWhatsappPhone(raw);
  if (!check.ok) return check;
  await setSetting(env, SETTINGS_KEYS.whatsappPhone, check.phone);
  return check;
}
