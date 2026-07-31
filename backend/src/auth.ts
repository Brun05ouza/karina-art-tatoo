import { timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { allowedOrigins, env } from "./config.js";
import { readCookie, SESSION_COOKIE_NAME, verifySessionCookie, type AdminIdentity } from "./session.js";

declare module "fastify" {
  interface FastifyRequest {
    admin?: AdminIdentity;
  }
}

function safeTokenEquals(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isSafeMethod(method: string): boolean {
  return SAFE_METHODS.has(method.toUpperCase());
}

/**
 * Camada extra de CSRF para o caminho de cookie.
 *
 * SameSite=Lax já bloqueia POST/PUT/DELETE cross-site, mas não cobre um
 * subdomínio same-site (um preview deploy, um CNAME esquecido) nem um futuro
 * SameSite=None. Verificar a origem custa pouco e fecha essa brecha.
 */
export function isTrustedRequestOrigin(request: FastifyRequest): boolean {
  if (request.headers["sec-fetch-site"] === "cross-site") return false;

  const origin = request.headers.origin;
  if (origin) return allowedOrigins.has(origin.replace(/\/$/, ""));

  // Um navegador sempre envia Origin em método que altera estado. A ausência
  // aqui significa cliente não-navegador — que deve usar o token, não o cookie.
  return false;
}

export function authenticateRequest(request: FastifyRequest): AdminIdentity | null {
  const authorization = request.headers.authorization;

  // 1) Token servidor-servidor. Se o header existe, ele é a única via avaliada:
  // cair para o cookie permitiria sondar tokens usando a sessão da vítima.
  if (authorization) {
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    return token && safeTokenEquals(token, env.ADMIN_API_TOKEN)
      ? { email: "service@karinasarte", role: "admin", via: "token" }
      : null;
  }

  // 2) Sessão do painel administrativo.
  const raw = readCookie(request.headers.cookie, SESSION_COOKIE_NAME);
  if (!raw) return null;

  const identity = verifySessionCookie(raw);
  if (!identity) return null;

  if (!isSafeMethod(request.method) && !isTrustedRequestOrigin(request)) return null;

  return identity;
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const identity = authenticateRequest(request);

  if (!identity) {
    return reply.code(401).send({ error: "Não autorizado." });
  }

  request.admin = identity;
}
