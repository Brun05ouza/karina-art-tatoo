import { isTrustedRequestOrigin } from "../../_lib/auth";
import { error, handleError, json, type Env } from "../../_lib/config";
import { verifyPassword } from "../../_lib/crypto";
import {
  clearLoginAttempts,
  findAdminUserByEmail,
  getSql,
  isLoginRateLimited,
  passwordVersionFromHash,
  recordFailedLogin,
} from "../../_lib/db";
import { buildSessionCookie, createSessionValue } from "../../_lib/session";
import { clientIp, isValidPassword, normalizeLoginEmail, readJson } from "../../_lib/validation";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!isTrustedRequestOrigin(request)) {
      return error(403, "Origem não permitida.");
    }

    const body = await readJson<{ email?: unknown; password?: unknown }>(request);
    const email = normalizeLoginEmail(body?.email);
    const password = body?.password;

    if (!email || !isValidPassword(password)) {
      return error(400, "Informe um e-mail e uma senha válidos.");
    }

    const sql = getSql(env);
    const ip = clientIp(request);

    if (await isLoginRateLimited(sql, ip)) {
      return error(429, "Muitas tentativas de login. Tente novamente em alguns minutos.");
    }

    const user = await findAdminUserByEmail(sql, email);

    /**
     * Sem curto-circuito completo: quando o e-mail não existe, verificamos
     * contra o hash do env para manter o custo de derivação próximo e reduzir
     * enumeração de usuários por latência.
     */
    const passwordHash = user?.passwordHash ?? env.ADMIN_PASSWORD_HASH;
    const passwordMatches = await verifyPassword(password, passwordHash);

    if (!user || !passwordMatches) {
      await recordFailedLogin(sql, ip);
      console.warn("admin login failed", { ip });
      return error(401, "E-mail ou senha inválidos.");
    }

    await clearLoginAttempts(sql, ip);

    const passwordVersion = await passwordVersionFromHash(user.passwordHash);
    const value = await createSessionValue(env.ADMIN_SESSION_SECRET, user.email, passwordVersion);

    return json(
      { authenticated: true, user: { email: user.email, role: "admin" } },
      { status: 200, headers: { "set-cookie": buildSessionCookie(request, value) } },
    );
  } catch (cause) {
    return handleError(cause);
  }
};
