/** PBKDF2-SHA256 e utilitários WebCrypto (sem node:crypto). */

import { DEFAULT_PBKDF2_ITERATIONS, PBKDF2_KEYLEN } from "./pbkdf2-defaults.mjs";

export { DEFAULT_PBKDF2_ITERATIONS, PBKDF2_KEYLEN };

const MIN_ITERATIONS = 1_000;
const MAX_ITERATIONS = 1_000_000;

export function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function fromBase64Url(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const bin = atob(padded + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

/** Comparação sem early-exit no conteúdo (timingSafeEqual não existe no runtime). */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return new Uint8Array(sig);
}

export type ParsedHash = {
  iterations: number;
  keylen: number;
  salt: Uint8Array;
  hash: Uint8Array;
};

/**
 * Formato: pbkdf2:<iterations>:<keylen>:<saltBase64Url>:<hashBase64Url>
 * Separador `:` — nunca `$` (shells/docker-compose expandem `$`).
 */
export function parseHash(stored: string): ParsedHash | null {
  if (typeof stored !== "string" || !stored.startsWith("pbkdf2:")) return null;
  const parts = stored.split(":");
  if (parts.length !== 5) return null;
  const [, iterStr, keylenStr, saltB64, hashB64] = parts;
  const iterations = Number(iterStr);
  const keylen = Number(keylenStr);
  if (!Number.isInteger(iterations) || iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) {
    return null;
  }
  if (keylen !== PBKDF2_KEYLEN) return null;
  if (!saltB64 || !hashB64) return null;
  const salt = fromBase64Url(saltB64);
  const hash = fromBase64Url(hashB64);
  if (!salt || !hash || hash.length !== keylen) return null;
  return { iterations, keylen, salt, hash };
}

async function deriveBits(
  password: string,
  salt: Uint8Array,
  iterations: number,
  keylen: number,
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  // BufferSource tipagem do DOM exige ArrayBuffer “puro” em alguns targets
  const saltBuf = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBuf, iterations, hash: "SHA-256" },
    keyMaterial,
    keylen * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(
  password: string,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveBits(password, salt, iterations, PBKDF2_KEYLEN);
  return `pbkdf2:${iterations}:${PBKDF2_KEYLEN}:${toBase64Url(salt)}:${toBase64Url(hash)}`;
}

/** Nunca lança — hash malformado retorna false (evita oráculo 500). */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parseHash(stored);
  if (!parsed) return false;
  try {
    const derived = await deriveBits(password, parsed.salt, parsed.iterations, parsed.keylen);
    return constantTimeEqual(derived, parsed.hash);
  } catch {
    return false;
  }
}

/**
 * Hash descartável pré-computado (mesmo custo de uma verificação real).
 * Usado quando o email não existe, para não vazar existência por timing.
 */
export const DUMMY_PASSWORD_HASH =
  "pbkdf2:5000:32:BwcHBwcHBwcHBwcHBwcHBw:eJ2bZST4_Dc3g1IZZRRENkJ_IlyfD4Lbyc5bxVKuYFw";

export async function dummyVerify(password: string): Promise<void> {
  await verifyPassword(password, DUMMY_PASSWORD_HASH);
}

export async function passwordFingerprint(passwordHash: string, secret: string): Promise<string> {
  const mac = await hmacSha256(secret, `pwd:${passwordHash}`);
  return toBase64Url(mac.slice(0, 16));
}

export function randomTempPassword(bytes = 18): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  let out = "";
  for (let i = 0; i < buf.length; i++) {
    out += alphabet[buf[i]! % alphabet.length];
  }
  return out;
}
