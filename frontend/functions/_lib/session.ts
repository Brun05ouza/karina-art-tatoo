/**
 * Sessão administrativa em cookie httpOnly assinado.
 * Formato do valor: <payloadBase64Url>.<hmacBase64Url>
 *
 * Mudança em relação ao backend no Render: a API agora é same-origin
 * (karinasarte.com.br/api/*), então o cookie volta a ser SameSite=Lax.
 * SameSite=None só era necessário porque a API vivia em outro domínio
 * registrável — e é justamente o modo que Safari/iOS bloqueiam como
 * cookie de terceiro.
 */
import { constantTimeEqual, fromBase64Url, fromUtf8, hmacSha256, toBase64Url, utf8 } from "./crypto";

/** Incremente para invalidar todas as sessões existentes. */
const SESSION_VERSION = 1;
const TTL_SECONDS = 12 * 60 * 60;
const MAX_COOKIE_VALUE_LENGTH = 1024;
const MAX_COOKIE_HEADER_LENGTH = 4096;

export type AdminIdentity = {
  email: string;
  role: "admin";
  via: "cookie" | "token";
  passwordVersion?: string;
};

type Claims = {
  v: number;
  sub: "admin";
  eml: string;
  iat: number;
  exp: number;
  pv: string;
};

/**
 * O prefixo __Host- exige Secure, e Secure exige https. Em `wrangler pages dev`
 * a origem é http://localhost, então o nome muda no ambiente local — caso
 * contrário o navegador recusaria o cookie e o login falharia só em dev.
 */
export function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}

export function sessionCookieName(request: Request): string {
  return isSecureRequest(request) ? "__Host-ks_admin_session" : "ks_admin_session";
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function isValidClaims(value: unknown): value is Claims {
  if (!value || typeof value !== "object") return false;
  const claims = value as Record<string, unknown>;
  return (
    Number.isInteger(claims.v) &&
    claims.sub === "admin" &&
    typeof claims.eml === "string" &&
    claims.eml.length >= 1 &&
    claims.eml.length <= 200 &&
    Number.isInteger(claims.iat) &&
    Number.isInteger(claims.exp) &&
    typeof claims.pv === "string" &&
    claims.pv.length >= 1 &&
    claims.pv.length <= 64
  );
}

export async function createSessionValue(
  secret: string,
  email: string,
  passwordVersion: string,
): Promise<string> {
  const issuedAt = nowSeconds();
  const claims: Claims = {
    v: SESSION_VERSION,
    sub: "admin",
    eml: email,
    iat: issuedAt,
    exp: issuedAt + TTL_SECONDS,
    pv: passwordVersion,
  };

  const payload = toBase64Url(utf8(JSON.stringify(claims)));
  const signature = await hmacSha256(secret, payload);
  return `${payload}.${toBase64Url(signature)}`;
}

/** Nunca lança: qualquer problema resulta em null (falha fechada). */
export async function verifySessionCookie(secret: string, raw: string): Promise<AdminIdentity | null> {
  if (!raw || raw.length > MAX_COOKIE_VALUE_LENGTH) return null;

  const separator = raw.lastIndexOf(".");
  if (separator < 1 || separator === raw.length - 1) return null;

  const payload = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  if (payload.includes(".")) return null;

  let received: Uint8Array;
  try {
    received = fromBase64Url(signature);
  } catch {
    return null;
  }

  const expected = await hmacSha256(secret, payload);
  if (!constantTimeEqual(received, expected)) return null;

  let claims: unknown;
  try {
    claims = JSON.parse(fromUtf8(fromBase64Url(payload)));
  } catch {
    return null;
  }

  if (!isValidClaims(claims)) return null;

  const now = nowSeconds();
  if (claims.v !== SESSION_VERSION) return null;
  if (claims.exp <= now) return null;
  if (claims.iat > now + 60) return null;

  return { email: claims.eml, role: "admin", via: "cookie", passwordVersion: claims.pv };
}

function cookieAttributes(request: Request, value: string, maxAge: number): string {
  const attributes = [
    `${sessionCookieName(request)}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (isSecureRequest(request)) attributes.splice(3, 0, "Secure");
  return attributes.join("; ");
}

export function buildSessionCookie(request: Request, value: string): string {
  return cookieAttributes(request, value, TTL_SECONDS);
}

export function buildClearedSessionCookie(request: Request): string {
  return cookieAttributes(request, "", 0);
}

export function readCookie(header: string | null, name: string): string | null {
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
