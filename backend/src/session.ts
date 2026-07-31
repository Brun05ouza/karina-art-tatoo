/**
 * Sessão administrativa em cookie httpOnly assinado (stateless, sem store).
 *
 * Formato do valor: <payloadBase64Url>.<hmacBase64Url>
 * A assinatura é HMAC-SHA256 sobre a string já codificada do payload — nunca
 * sobre o JSON re-serializado, para não depender de canonicalização.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { env, isProduction } from "./config.js";

/** Incremente para invalidar todas as sessões existentes. */
const SESSION_VERSION = 1;
const TTL_SECONDS = 12 * 60 * 60;
const MAX_COOKIE_VALUE_LENGTH = 1024;
const MAX_COOKIE_HEADER_LENGTH = 4096;

/**
 * O prefixo __Host- em produção faz o navegador recusar o cookie sem Secure,
 * sem Path=/ ou com atributo Domain — impedindo que um subdomínio comprometido
 * sobrescreva a sessão.
 */
export const SESSION_COOKIE_NAME = isProduction ? "__Host-ks_admin_session" : "ks_admin_session";

export type AdminIdentity = {
  email: string;
  role: "admin";
  via: "cookie" | "token";
};

const claimsSchema = z.object({
  v: z.number().int(),
  sub: z.literal("admin"),
  eml: z.string().min(1).max(200),
  iat: z.number().int(),
  exp: z.number().int(),
  pv: z.string().min(1).max(64),
});

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * "Password version": derivada do hash da senha. Trocar ADMIN_PASSWORD_HASH
 * invalida todas as sessões vivas sem precisar de lista de revogação.
 */
function currentPasswordVersion(): string {
  return createHash("sha256").update(env.ADMIN_PASSWORD_HASH).digest("hex").slice(0, 16);
}

function sign(payload: string): Buffer {
  return createHmac("sha256", env.ADMIN_SESSION_SECRET).update(payload).digest();
}

export function createSessionValue(email: string): string {
  const issuedAt = nowSeconds();
  const claims = {
    v: SESSION_VERSION,
    sub: "admin" as const,
    eml: email,
    iat: issuedAt,
    exp: issuedAt + TTL_SECONDS,
    pv: currentPasswordVersion(),
  };

  const payload = Buffer.from(JSON.stringify(claims), "utf8").toString("base64url");
  return `${payload}.${sign(payload).toString("base64url")}`;
}

/** Nunca lança: qualquer problema resulta em null (falha fechada). */
export function verifySessionCookie(raw: string): AdminIdentity | null {
  if (!raw || raw.length > MAX_COOKIE_VALUE_LENGTH) return null;

  const separator = raw.lastIndexOf(".");
  if (separator < 1 || separator === raw.length - 1) return null;

  const payload = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  if (payload.includes(".")) return null;

  const received = Buffer.from(signature, "base64url");
  const expected = sign(payload);

  // timingSafeEqual lança com tamanhos diferentes — checar antes.
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  let claims: unknown;
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  // Mesmo com a assinatura válida, não confiamos na forma do objeto.
  const parsed = claimsSchema.safeParse(claims);
  if (!parsed.success) return null;

  const now = nowSeconds();
  if (parsed.data.v !== SESSION_VERSION) return null;
  if (parsed.data.pv !== currentPasswordVersion()) return null;
  if (parsed.data.exp <= now) return null;
  if (parsed.data.iat > now + 60) return null;

  return { email: parsed.data.eml, role: "admin", via: "cookie" };
}

export function buildSessionCookie(value: string): string {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${TTL_SECONDS}`,
  ];
  if (isProduction) attributes.splice(3, 0, "Secure");
  return attributes.join("; ");
}

export function buildClearedSessionCookie(): string {
  const attributes = [`${SESSION_COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (isProduction) attributes.splice(3, 0, "Secure");
  return attributes.join("; ");
}

/**
 * Parser estrito de cookie. A primeira ocorrência vence, como nos navegadores
 * (o cookie de path mais específico é enviado primeiro).
 */
export function readCookie(header: string | undefined, name: string): string | null {
  if (!header || header.length > MAX_COOKIE_HEADER_LENGTH) return null;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    if (part.slice(0, separator).trim() !== name) continue;

    let value = part.slice(separator + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    return value;
  }

  return null;
}
