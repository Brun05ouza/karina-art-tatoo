/** Autenticação de request: cookie + usuário ativo + CSRF Origin. */

import type { Env } from "./config";
import { findUserByEmail, type AdminRole, type AdminUser } from "./db";
import {
  fingerprintMatches,
  readSessionCookie,
  verifySessionToken,
} from "./session";

export type AuthIdentity = {
  user: AdminUser;
  email: string;
  role: AdminRole;
};

const STATE_CHANGING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Hosts/portas locais: Vite (5173/5174) faz proxy para wrangler (8788). */
const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);
const LOCAL_DEV_PORTS = new Set(["5173", "5174", "8788", "4173"]);

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "0.0.0.0"
  );
}

/**
 * CSRF: Origin deve bater com a URL do request.
 * Em dev, aceita também Vite → proxy → Pages Functions (portas locais).
 */
export function originAllowed(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) {
    // Navegação same-origin clássica / alguns clientes sem Origin
    // Para mutações via fetch do admin, Origin deve existir.
    return false;
  }
  try {
    const reqUrl = new URL(request.url);
    const originUrl = new URL(origin);
    if (origin === reqUrl.origin) return true;

    const reqLocal = LOCAL_HOSTS.has(reqUrl.hostname);
    const originLocal = LOCAL_HOSTS.has(originUrl.hostname);
    const originPort = originUrl.port || (originUrl.protocol === "https:" ? "443" : "80");
    if (reqLocal && originLocal && LOCAL_DEV_PORTS.has(originPort)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function authenticateRequest(
  request: Request,
  env: Env,
): Promise<AuthIdentity | null> {
  try {
    if (STATE_CHANGING.has(request.method.toUpperCase()) && !originAllowed(request)) {
      return null;
    }

    const token = readSessionCookie(request);
    if (!token) return null;

    const claims = await verifySessionToken(env, token);
    if (!claims) return null;

    const user = await findUserByEmail(env, claims.email);
    if (!user || !user.active) return null;

    const pwdOk = await fingerprintMatches(env, user.password_hash, claims.pwd);
    if (!pwdOk) return null;

    return { user, email: user.email, role: user.role };
  } catch {
    return null;
  }
}
