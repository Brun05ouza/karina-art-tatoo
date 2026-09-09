/** Cookie de sessão httpOnly assinado com HMAC. */

import { requireEnv, type Env } from "./config";
import {
  fromBase64Url,
  hmacSha256,
  passwordFingerprint,
  toBase64Url,
  constantTimeEqual,
} from "./crypto";

const SESSION_VERSION = 1;
const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12h
const COOKIE_BASE = "ks_admin_session";
const COOKIE_HOST = `__Host-${COOKIE_BASE}`;

export type SessionClaims = {
  v: number;
  email: string;
  iat: number;
  exp: number;
  pwd: string;
};

export type SessionUser = {
  email: string;
  pwd: string;
};

function isHttps(request: Request): boolean {
  const url = new URL(request.url);
  if (url.protocol === "https:") return true;
  const forwarded = request.headers.get("x-forwarded-proto");
  return forwarded === "https";
}

export function sessionCookieName(request: Request): string {
  // __Host- exige Secure; em http://localhost o browser recusa o cookie.
  return isHttps(request) ? COOKIE_HOST : COOKIE_BASE;
}

function encodePayload(claims: SessionClaims): string {
  const json = JSON.stringify(claims);
  return toBase64Url(new TextEncoder().encode(json));
}

function decodePayload(payloadB64: string): SessionClaims | null {
  const bytes = fromBase64Url(payloadB64);
  if (!bytes) return null;
  try {
    const text = new TextDecoder().decode(bytes);
    const data = JSON.parse(text) as SessionClaims;
    if (
      typeof data.v !== "number" ||
      typeof data.email !== "string" ||
      typeof data.iat !== "number" ||
      typeof data.exp !== "number" ||
      typeof data.pwd !== "string"
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

async function sign(payloadB64: string, secret: string): Promise<string> {
  const mac = await hmacSha256(secret, payloadB64);
  return toBase64Url(mac);
}

export async function createSessionToken(
  env: Env,
  email: string,
  passwordHash: string,
): Promise<string> {
  const secret = requireEnv(env, "ADMIN_SESSION_SECRET");
  const now = Math.floor(Date.now() / 1000);
  const claims: SessionClaims = {
    v: SESSION_VERSION,
    email: email.toLowerCase().trim(),
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    pwd: await passwordFingerprint(passwordHash, secret),
  };
  const payload = encodePayload(claims);
  const sig = await sign(payload, secret);
  return `${payload}.${sig}`;
}

/** Falha fechada: qualquer problema retorna null. */
export async function verifySessionToken(
  env: Env,
  token: string,
): Promise<SessionClaims | null> {
  try {
    const secret = requireEnv(env, "ADMIN_SESSION_SECRET");
    const dot = token.indexOf(".");
    if (dot <= 0 || dot === token.length - 1) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = await sign(payload, secret);
    const a = fromBase64Url(sig);
    const b = fromBase64Url(expected);
    if (!a || !b || !constantTimeEqual(a, b)) return null;
    const claims = decodePayload(payload);
    if (!claims || claims.v !== SESSION_VERSION) return null;
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp < now || claims.iat > now + 60) return null;
    if (!claims.email.includes("@")) return null;
    return claims;
  } catch {
    return null;
  }
}

export function readSessionCookie(request: Request): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  const names = [sessionCookieName(request), COOKIE_HOST, COOKIE_BASE];
  const parts = header.split(/;\s*/);
  for (const name of names) {
    const prefix = `${name}=`;
    for (const part of parts) {
      if (part.startsWith(prefix)) {
        const value = part.slice(prefix.length).trim();
        if (value) return decodeURIComponent(value);
      }
    }
  }
  return null;
}

export function buildSetCookie(
  request: Request,
  token: string,
  maxAgeSeconds: number = SESSION_TTL_SECONDS,
): string {
  const name = sessionCookieName(request);
  const secure = isHttps(request);
  const parts = [
    `${name}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildClearCookie(request: Request): string[] {
  const secure = isHttps(request);
  const names = secure ? [COOKIE_HOST, COOKIE_BASE] : [COOKIE_BASE, COOKIE_HOST];
  return names.map((name) => {
    const parts = [`${name}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
    if (name.startsWith("__Host-") || secure) parts.push("Secure");
    return parts.join("; ");
  });
}

export async function createSessionCookieHeader(
  request: Request,
  env: Env,
  email: string,
  passwordHash: string,
): Promise<string> {
  const token = await createSessionToken(env, email, passwordHash);
  return buildSetCookie(request, token);
}

export async function fingerprintMatches(
  env: Env,
  passwordHash: string,
  claimed: string,
): Promise<boolean> {
  const secret = requireEnv(env, "ADMIN_SESSION_SECRET");
  const expected = await passwordFingerprint(passwordHash, secret);
  const a = new TextEncoder().encode(expected);
  const b = new TextEncoder().encode(claimed);
  return constantTimeEqual(a, b);
}
