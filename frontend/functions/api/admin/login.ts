import type { PagesFunction } from "@cloudflare/workers-types";
import { clientIp } from "../../_lib/auth";
import { type Env, error, handleError, json } from "../../_lib/config";
import { dummyVerify, verifyPassword } from "../../_lib/crypto";
import {
  clearAttempts,
  findUserByEmail,
  isRateLimited,
  recordFailedAttempt,
  toPublicUser,
  touchLastLogin,
} from "../../_lib/db";
import { createSessionCookieHeader } from "../../_lib/session";

const INVALID = "Email ou senha inválidos.";

function originOk(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    if (!originOk(request)) {
      return error(403, "Origem não permitida.");
    }

    let body: { email?: string; password?: string };
    try {
      body = (await request.json()) as { email?: string; password?: string };
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");
    if (!email || !password) {
      return error(400, "Informe email e senha.");
    }

    const ip = clientIp(request);
    if (await isRateLimited(env, ip, email)) {
      return error(429, "Muitas tentativas. Aguarde alguns minutos e tente de novo.");
    }

    const user = await findUserByEmail(env, email);

    if (!user || !user.active) {
      await dummyVerify(password);
      await recordFailedAttempt(env, ip, email);
      return error(401, INVALID);
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      await recordFailedAttempt(env, ip, email);
      return error(401, INVALID);
    }

    await clearAttempts(env, ip, email);
    await touchLastLogin(env, user.id);

    const setCookie = await createSessionCookieHeader(request, env, user.email, user.password_hash);
    const publicUser = toPublicUser(user);

    return json(
      {
        ok: true,
        mustChangePassword: publicUser.must_change_password,
        user: {
          id: publicUser.id,
          email: publicUser.email,
          role: publicUser.role,
          mustChangePassword: publicUser.must_change_password,
        },
      },
      { headers: { "Set-Cookie": setCookie } },
    );
  } catch (err) {
    return handleError(err);
  }
};
