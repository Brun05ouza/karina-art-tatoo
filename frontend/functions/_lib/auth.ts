import type { Env } from "./config";
import { constantTimeEqualString } from "./crypto";
import { findAdminUserByEmail, getSql, passwordVersionFromHash, type Sql } from "./db";
import { readCookie, sessionCookieName, verifySessionCookie, type AdminIdentity } from "./session";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isSafeMethod(method: string): boolean {
  return SAFE_METHODS.has(method.toUpperCase());
}

/**
 * Camada extra de CSRF para o caminho de cookie.
 *
 * Agora que a API é same-origin, a origem confiável é a própria origem da
 * requisição — não há mais allowlist de CORS para manter em sincronia com o
 * domínio do site. Um preview deploy do Pages valida contra a própria origem
 * dele, o que é o comportamento desejado.
 */
export function isTrustedRequestOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin) {
    return origin.replace(/\/$/, "") === new URL(request.url).origin;
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") return false;

  // Navegador sempre envia Origin em método que altera estado. Ausência aqui
  // significa cliente não-navegador — que deve usar o token, não o cookie.
  return false;
}

export async function authenticateRequest(
  request: Request,
  env: Env,
  sql?: Sql,
): Promise<AdminIdentity | null> {
  const authorization = request.headers.get("authorization");

  // 1) Token servidor-servidor. Se o header existe, ele é a única via avaliada:
  // cair para o cookie permitiria sondar tokens usando a sessão da vítima.
  if (authorization) {
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    return token && env.ADMIN_API_TOKEN && constantTimeEqualString(token, env.ADMIN_API_TOKEN)
      ? { email: "service@karinasarte", role: "admin", via: "token" }
      : null;
  }

  // 2) Sessão do painel administrativo.
  const raw = readCookie(request.headers.get("cookie"), sessionCookieName(request));
  if (!raw) return null;

  const identity = await verifySessionCookie(env.ADMIN_SESSION_SECRET, raw);
  if (!identity) return null;

  if (!isSafeMethod(request.method) && !isTrustedRequestOrigin(request)) return null;

  const client = sql ?? getSql(env);
  const user = await findAdminUserByEmail(client, identity.email);
  if (!user) return null;

  const currentVersion = await passwordVersionFromHash(user.passwordHash);
  if (identity.passwordVersion !== currentVersion) return null;

  return identity;
}

/** Retorna a identidade, ou null se a requisição não estiver autorizada. */
export async function requireAdmin(request: Request, env: Env, sql?: Sql): Promise<AdminIdentity | null> {
  return authenticateRequest(request, env, sql);
}
