/**
 * Primitivas de cripto sobre WebCrypto — substitui node:crypto, que não existe
 * no runtime de Workers.
 *
 * Diferenças relevantes em relação ao backend antigo:
 *  - createHmac (síncrono) → crypto.subtle.sign (assíncrono)
 *  - scrypt → PBKDF2-SHA256 (WebCrypto não implementa scrypt)
 *  - timingSafeEqual → comparação constante escrita à mão
 *  - Buffer → Uint8Array + helpers base64url
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function utf8(value: string): Uint8Array {
  return encoder.encode(value);
}

export function fromUtf8(bytes: Uint8Array): string {
  return decoder.decode(bytes);
}

export function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Comparação em tempo constante. Sai cedo apenas no tamanho — que já é
 * público — e nunca no conteúdo, para não virar oráculo de timing.
 */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export function constantTimeEqualString(a: string, b: string): boolean {
  return constantTimeEqual(utf8(a), utf8(b));
}

/** HMAC-SHA256. Custo de CPU desprezível (microssegundos). */
export async function hmacSha256(secret: string, payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, utf8(payload));
  return new Uint8Array(signature);
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", utf8(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/* ------------------------------------------------------------------ *
 * Senha — PBKDF2-SHA256
 * ------------------------------------------------------------------ */

/**
 * Formato armazenado em ADMIN_PASSWORD_HASH e em admin_users.password_hash:
 *
 *   pbkdf2:<iterations>:<keylen>:<saltBase64Url>:<hashBase64Url>
 *
 * Separador ":" e não "$" pelo mesmo motivo do backend antigo: "$" é expandido
 * por shells e docker-compose e corromperia o valor silenciosamente.
 *
 * As iterações ficam DENTRO do hash de propósito. O plano gratuito do Pages
 * limita a 10ms de CPU por requisição, e PBKDF2 é a única coisa cara em todo
 * o backend. Calibrar = gerar um hash novo com outro número de iterações;
 * nenhuma linha de código muda. Ver scripts/hash-password.mjs.
 */
const HASH_PATTERN = /^pbkdf2:(\d+):(\d+):([A-Za-z0-9_-]+):([A-Za-z0-9_-]+)$/;

const SALT_BYTES = 16;
const DEFAULT_KEYLEN = 32;

type ParsedHash = {
  iterations: number;
  keylen: number;
  salt: Uint8Array;
  hash: Uint8Array;
};

function parseHash(stored: string): ParsedHash | null {
  const match = HASH_PATTERN.exec(stored.trim());
  if (!match) return null;

  const iterations = Number(match[1]);
  const keylen = Number(match[2]);

  // Limites sanitários: um valor absurdo vindo de env malformada estouraria
  // o limite de CPU e derrubaria o login com erro opaco.
  if (!Number.isInteger(iterations) || iterations < 1_000 || iterations > 1_000_000) return null;
  if (keylen !== DEFAULT_KEYLEN) return null;

  const salt = fromBase64Url(match[3]!);
  const hash = fromBase64Url(match[4]!);
  if (salt.length < 8 || hash.length !== keylen) return null;

  return { iterations, keylen, salt, hash };
}

export function isValidHashFormat(stored: string): boolean {
  return parseHash(stored) !== null;
}

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number,
  keylen: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", utf8(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    keylen * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, iterations: number): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await derive(password, salt, iterations, DEFAULT_KEYLEN);
  return ["pbkdf2", iterations, DEFAULT_KEYLEN, toBase64Url(salt), toBase64Url(derived)].join(":");
}

/**
 * Nunca lança: hash malformado retorna false, para que a resposta ao usuário
 * seja "credenciais inválidas" e não um 500 que sirva de oráculo sobre o
 * estado da configuração.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parseHash(stored);
  if (!parsed) return false;

  try {
    const derived = await derive(password, parsed.salt, parsed.iterations, parsed.keylen);
    return constantTimeEqual(derived, parsed.hash);
  } catch {
    return false;
  }
}
