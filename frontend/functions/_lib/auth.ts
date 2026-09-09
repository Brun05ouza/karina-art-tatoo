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

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "0.0.0.0"
  );
}

export function originAllowed(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) {
    // Navegação same-origin clássica / alguns clientes sem Origin
    // Para mutações via fetch do admin, Origin deve existir.
    // Sem Origin: rejeitar em métodos que alteram estado.
    return false;
  }
  try {
    const reqOrigin = new URL(request.url).origin;
    return origin === reqOrigin;
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
