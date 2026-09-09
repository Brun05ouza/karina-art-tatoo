import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../_lib/auth";
import { type Env, error, handleError, json } from "../../_lib/config";
import { hashPassword, verifyPassword } from "../../_lib/crypto";
import { updatePassword } from "../../_lib/db";
import { validatePassword } from "../../_lib/password-policy";
import { createSessionCookieHeader } from "../../_lib/session";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const identity = await authenticateRequest(request, env);
    if (!identity) {
      return error(401, "Faça login para continuar.");
    }

    let body: { currentPassword?: string; newPassword?: string };
    try {
      body = (await request.json()) as { currentPassword?: string; newPassword?: string };
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const newPassword = String(body.newPassword ?? "");
    const currentPassword = String(body.currentPassword ?? "");
    const mustChange = identity.user.must_change_password;

    if (!mustChange) {
      if (!currentPassword) {
        return error(400, "Informe a senha atual.");
      }
      const currentOk = await verifyPassword(currentPassword, identity.user.password_hash);
      if (!currentOk) {
        return error(401, "Senha atual incorreta.");
      }
    }

    const policy = validatePassword(newPassword, { email: identity.user.email });
    if (!policy.ok) {
      return error(400, policy.message);
    }

    if (await verifyPassword(newPassword, identity.user.password_hash)) {
      return error(400, "A nova senha precisa ser diferente da atual.");
    }

    const passwordHash = await hashPassword(newPassword);
    const updated = await updatePassword(env, identity.user.id, passwordHash, false);
    if (!updated) {
      return error(500, "Não foi possível atualizar a senha.");
    }

    const setCookie = await createSessionCookieHeader(
      request,
      env,
      updated.email,
      updated.password_hash,
    );

    return json(
      {
        ok: true,
        mustChangePassword: false,
        user: {
          id: updated.id,
          email: updated.email,
          role: updated.role,
          mustChangePassword: false,
        },
      },
      { headers: { "Set-Cookie": setCookie } },
    );
  } catch (err) {
    return handleError(err);
  }
};
