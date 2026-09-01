import { authenticateRequest } from "../../_lib/auth";
import { handleError, json, type Env } from "../../_lib/config";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const identity = await authenticateRequest(request, env);
    if (!identity) return json({ authenticated: false });
    return json({ authenticated: true, user: { email: identity.email, role: "admin" } });
  } catch (cause) {
    return handleError(cause);
  }
};
