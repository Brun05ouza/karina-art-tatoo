import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../_lib/auth";
import { type Env, handleError, json } from "../../_lib/config";
import { toPublicUser } from "../../_lib/db";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) {
      return json({ authenticated: false });
    }
    const u = toPublicUser(identity.user);
    return json({
      authenticated: true,
      mustChangePassword: u.must_change_password,
      user: {
        id: u.id,
        email: u.email,
        role: u.role,
        mustChangePassword: u.must_change_password,
        lastLoginAt: u.last_login_at,
      },
    });
  } catch (err) {
    return handleError(err);
  }
};
