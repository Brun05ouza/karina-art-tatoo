import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { findAdminUserByEmail, passwordVersionFromHash } from "../admin-users.js";
import { authenticateRequest, isTrustedRequestOrigin } from "../auth.js";
import { env } from "../config.js";
import { verifyPassword } from "../password.js";
import { buildClearedSessionCookie, buildSessionCookie, createSessionValue } from "../session.js";

const emailField = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.email().max(200),
);

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1).max(200),
});

const loginRateLimit = {
  rateLimit: {
    max: 5,
    timeWindow: "10 minutes",
    errorResponseBuilder: () => ({
      error: "Muitas tentativas de login. Tente novamente em alguns minutos.",
    }),
  },
};

function sessionPayload(email: string) {
  return {
    authenticated: true as const,
    user: { email, role: "admin" as const },
  };
}

function grantSession(reply: FastifyReply, email: string, passwordHash: string) {
  const passwordVersion = passwordVersionFromHash(passwordHash);
  reply.header("set-cookie", buildSessionCookie(createSessionValue(email, passwordVersion)));
  return reply.code(200).send(sessionPayload(email));
}

function rejectUntrustedOrigin(request: FastifyRequest, reply: FastifyReply): boolean {
  if (isTrustedRequestOrigin(request)) return false;
  reply.code(403).send({ error: "Origem não permitida." });
  return true;
}

export async function adminAuthRoutes(app: FastifyInstance) {
  app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("cache-control", "no-store");
    return payload;
  });

  app.get("/admin/session", async (request) => {
    const identity = await authenticateRequest(request);

    if (!identity) return { authenticated: false };
    return { authenticated: true, user: { email: identity.email, role: "admin" } };
  });

  app.post("/admin/login", { config: loginRateLimit }, async (request, reply) => {
    if (rejectUntrustedOrigin(request, reply)) return reply;

    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: "Informe um e-mail e uma senha válidos." });
    }

    const user = await findAdminUserByEmail(body.data.email);

    /**
     * Sem curto-circuito completo: quando o e-mail não existe, verificamos contra
     * o hash legado do env para manter o custo de scrypt próximo e reduzir
     * enumeração por latência.
     */
    const passwordHash = user?.passwordHash ?? env.ADMIN_PASSWORD_HASH;
    const passwordMatches = await verifyPassword(body.data.password, passwordHash);

    if (user && passwordMatches) {
      return grantSession(reply, user.email, user.passwordHash);
    }

    request.log.warn({ ip: request.ip }, "admin login failed");
    return reply.code(401).send({ error: "E-mail ou senha inválidos." });
  });

  app.post("/admin/logout", async (request, reply) => {
    if (rejectUntrustedOrigin(request, reply)) return reply;

    reply.header("set-cookie", buildClearedSessionCookie());
    return reply.code(204).send();
  });
}
