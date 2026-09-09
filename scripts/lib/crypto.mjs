/** Crypto compartilhado com functions/_lib/crypto.ts (WebCrypto). */
import { webcrypto } from "node:crypto";
import {
  DEFAULT_PBKDF2_ITERATIONS,
  PBKDF2_KEYLEN,
} from "../../frontend/functions/_lib/pbkdf2-defaults.mjs";

export { DEFAULT_PBKDF2_ITERATIONS, PBKDF2_KEYLEN };

const subtle = webcrypto.subtle;

export function toBase64Url(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function hashPassword(password, iterations = DEFAULT_PBKDF2_ITERATIONS) {
  const enc = new TextEncoder();
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    PBKDF2_KEYLEN * 8,
  );
  return `pbkdf2:${iterations}:${PBKDF2_KEYLEN}:${toBase64Url(salt)}:${toBase64Url(new Uint8Array(bits))}`;
}

export function randomTempPassword(bytes = 18) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const buf = webcrypto.getRandomValues(new Uint8Array(bytes));
  let out = "";
  for (let i = 0; i < buf.length; i++) out += alphabet[buf[i] % alphabet.length];
  return out;
}

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) out[key] = true;
      else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}
