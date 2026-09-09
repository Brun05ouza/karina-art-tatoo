import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../../_lib/auth";
import { type Env, error, handleError, json } from "../../../_lib/config";
import { findUserById, setUserActive } from "../../../_lib/db";

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const { request, env, params } = context;
    const identity = await authenticateRequest(request, env);
    if (!identity) return error(401, "Faça login para continuar.");
    if (identity.role !== "owner") return error(403, "Sem permissão para gerenciar usuários.");

    const id = String(params.id ?? "");
    if (!id) return error(400, "Usuário inválido.");

    let body: { active?: boolean };
    try {
      body = (await request.json()) as { active?: boolean };
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    if (typeof body.active !== "boolean") {
      return error(400, "Informe active: true ou false.");
    }

    const target = await findUserById(env, id);
    if (!target) return error(404, "Usuário não encontrado.");

    if (target.id === identity.user.id && body.active === false) {
      return error(400, "Você não pode desativar a própria conta.");
    }

    const updated = await setUserActive(env, id, body.active);
    if (!updated) return error(404, "Usuário não encontrado.");

    return json({
      ok: true,
      user: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        active: updated.active,
        mustChangePassword: updated.must_change_password,
        lastLoginAt: updated.last_login_at,
      },
    });
  } catch (err) {
    return handleError(err);
  }
};
