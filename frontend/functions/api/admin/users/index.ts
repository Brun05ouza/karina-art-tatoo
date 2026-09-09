import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../../_lib/auth";
import { type Env, error, handleError, json } from "../../../_lib/config";
import { createUser, listUsers, type AdminRole } from "../../../_lib/db";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");
    if (identity.role !== "owner") return error(403, "Sem permissão para gerenciar usuários.");

    const users = await listUsers(context.env);
    return json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        active: u.active,
        mustChangePassword: u.must_change_password,
        lastLoginAt: u.last_login_at,
        createdAt: u.created_at,
      })),
    });
  } catch (err) {
    return handleError(err);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const identity = await authenticateRequest(request, env);
    if (!identity) return error(401, "Faça login para continuar.");
    if (identity.role !== "owner") return error(403, "Sem permissão para gerenciar usuários.");

    let body: { email?: string; role?: string };
    try {
      body = (await request.json()) as { email?: string; role?: string };
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const email = String(body.email ?? "").toLowerCase().trim();
    const role = (body.role === "owner" ? "owner" : "editor") as AdminRole;

    if (!email || !email.includes("@") || email.length > 200) {
      return error(400, "Informe um email válido.");
    }

    try {
      const { user, temporaryPassword } = await createUser(env, { email, role });
      return json({
        ok: true,
        temporaryPassword,
        notice:
          "Guarde esta senha temporária agora — ela não será mostrada de novo. Entregue manualmente à pessoa.",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          active: user.active,
          mustChangePassword: user.must_change_password,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("unique") || msg.includes("duplicate") || msg.includes("admin_users_email")) {
        return error(409, "Já existe um usuário com esse email.");
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
};
