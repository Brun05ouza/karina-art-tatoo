/**
 * Hash e verificação de senha administrativa usando apenas node:crypto (scrypt).
 *
 * Este módulo NÃO importa ./config.js de propósito: o script `npm run admin:hash`
 * precisa rodar antes de existir um .env válido.
 */
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { promisify } from "node:util";

// promisify escolhe a sobrecarga sem `options`; declaramos a que aceita params.
const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/** Custo atual. 128 * N * r = ~67 MB de memória por chamada. */
const PARAMS = { N: 65_536, r: 8, p: 1, keylen: 32 } as const;
const SALT_BYTES = 16;

/**
 * `maxmem` precisa ser informado explicitamente: o padrão do Node é 32 MB e
 * 128 * 65536 * 8 = 67 MB estouraria com ERR_CRYPTO_INVALID_SCRYPT_PARAMS.
 * Nunca reduza o N para contornar isso.
 */
const MAX_MEM = 160 * 1024 * 1024;

/**
 * Formato armazenado em ADMIN_PASSWORD_HASH:
 *   scrypt:N:r:p:keylen:saltBase64Url:hashBase64Url
 *
 * Usamos ":" como separador (e nunca "$", como no padrão PHC) porque "$" é
 * expandido por docker-compose, systemd e shells, o que corromperia o valor
 * silenciosamente — o login falharia apenas em produção.
 */
const HASH_PATTERN = /^scrypt:(\d+):(\d+):(\d+):(\d+):([A-Za-z0-9_-]+):([A-Za-z0-9_-]+)$/;

type ParsedHash = {
  N: number;
  r: number;
  p: number;
  keylen: number;
  salt: Buffer;
  hash: Buffer;
};

function parseHash(stored: string): ParsedHash | null {
  const match = HASH_PATTERN.exec(stored.trim());
  if (!match) return null;

  const N = Number(match[1]);
  const r = Number(match[2]);
  const p = Number(match[3]);
  const keylen = Number(match[4]);

  // Limites sanitários: evitam que um .env malformado vire um DoS de memória.
  const isPowerOfTwo = N > 1 && (N & (N - 1)) === 0;
  if (!isPowerOfTwo || N > 1_048_576) return null;
  if (!Number.isInteger(r) || r < 1 || r > 32) return null;
  if (p !== 1) return null;
  if (keylen !== 32) return null;

  const salt = Buffer.from(match[5]!, "base64url");
  const hash = Buffer.from(match[6]!, "base64url");
  if (salt.length < 8 || hash.length !== keylen) return null;

  return { N, r, p, keylen, salt, hash };
}

/** Validação usada pelo zod em config.ts para falhar cedo com mensagem clara. */
export function isValidHashFormat(stored: string): boolean {
  return parseHash(stored) !== null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await scrypt(password, salt, PARAMS.keylen, {
    N: PARAMS.N,
    r: PARAMS.r,
    p: PARAMS.p,
    maxmem: MAX_MEM,
  });

  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    PARAMS.keylen,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join(":");
}

/**
 * Nunca lança: hash malformado retorna false, para que a resposta ao usuário
 * seja "credenciais inválidas" e não um 500 com stack trace (que serviria de
 * oráculo sobre o estado da configuração).
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parseHash(stored);
  if (!parsed) return false;

  try {
    const derived = await scrypt(password, parsed.salt, parsed.keylen, {
      N: parsed.N,
      r: parsed.r,
      p: parsed.p,
      maxmem: MAX_MEM,
    });

    // timingSafeEqual lança com buffers de tamanhos diferentes — checar antes.
    return derived.length === parsed.hash.length && timingSafeEqual(derived, parsed.hash);
  } catch {
    return false;
  }
}
