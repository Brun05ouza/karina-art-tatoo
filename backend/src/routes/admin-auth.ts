import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { authenticateRequest, isTrustedRequestOrigin } from "../auth.js";
import { env, isDevLoginEnabled } from "../config.js";
import { verifyPassword } from "../password.js";
import { buildClearedSessionCookie, buildSessionCookie, createSessionValue } from "../session.js";

const emailField = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.email().max(200),
);

const loginSchema = z.object({
  email: emailField,
  // O limite é aplicado antes de hashear: scrypt é memory-hard e o endpoint
  // seria um vetor de amplificação sem esse teto (ver rate limit por rota).
  password: z.string().min(1).max(200),
});

/** Rate limit específico do login, mais estrito que o global de 100/min. */
const loginRateLimit = {
  rateLimit: {
    max: 5,
    timeWindow: "10 minutes",
    errorResponseBuilder: () => ({
      error: "Muitas tentativas de login. Tente novamente em alguns minutos.",
    }),
  },
};

function safeEquals(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

function sessionPayload(email: string) {
  return {
    authenticated: true as const,
    user: { email, role: "admin" as const },
    devLoginAvailable: isDevLoginEnabled(),
  };
}

function grantSession(reply: FastifyReply, email: string) {
  reply.header("set-cookie", buildSessionCookie(createSessionValue(email)));
  return reply.code(200).send(sessionPayload(email));
}

function rejectUntrustedOrigin(request: FastifyRequest, reply: FastifyReply): boolean {
  if (isTrustedRequestOrigin(request)) return false;
  reply.code(403).send({ error: "Origem não permitida." });
  return true;
}

export async function adminAuthRoutes(app: FastifyInstance) {
  // Nenhuma resposta de autenticação pode ser cacheada por proxy ou navegador.
  app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("cache-control", "no-store");
    return payload;
  });

  /**
   * Sempre responde 200. Um 401 aqui seria capturado pelo tratamento global de
   * 401 no cliente e criaria loop de redirecionamento.
   */
  app.get("/admin/session", async (request) => {
    const identity = authenticateRequest(request);
    const devLoginAvailable = isDevLoginEnabled();

    if (!identity) return { authenticated: false, devLoginAvailable };
    return { authenticated: true, user: { email: identity.email, role: "admin" }, devLoginAvailable };
  });

  app.post("/admin/login", { config: loginRateLimit }, async (request, reply) => {
    if (rejectUntrustedOrigin(request, reply)) return reply;

    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: "Informe um e-mail e uma senha válidos." });
    }

    // Sem curto-circuito: se pularmos verifyPassword quando o e-mail não bate,
    // a diferença de latência (~400 ms vs ~2 ms) vira oráculo de enumeração.
    const emailMatches = safeEquals(body.data.email, env.ADMIN_EMAIL);
    const passwordMatches = await verifyPassword(body.data.password, env.ADMIN_PASSWORD_HASH);

    if (emailMatches && passwordMatches) {
      return grantSession(reply, env.ADMIN_EMAIL);
    }

    // Em desenvolvimento as credenciais DEV_ADMIN_* também valem no formulário,
    // além do botão de um clique. Este bloco não existe em produção.
    if (isDevLoginEnabled() && env.DEV_ADMIN_EMAIL && env.DEV_ADMIN_PASSWORD) {
      const devMatches =
        safeEquals(body.data.email, env.DEV_ADMIN_EMAIL.trim().toLowerCase()) &&
        safeEquals(body.data.password, env.DEV_ADMIN_PASSWORD);

      if (devMatches) {
        request.log.warn({ ip: request.ip }, "admin dev credentials used");
        return grantSession(reply, env.DEV_ADMIN_EMAIL);
      }
    }

    // Nunca registrar o e-mail ou a senha enviados: o redact do logger cobre
    // headers, não o corpo da requisição.
    request.log.warn({ ip: request.ip }, "admin login failed");
    return reply.code(401).send({ error: "E-mail ou senha inválidos." });
  });

  /** Idempotente: sempre 204, mesmo sem sessão ativa. */
  app.post("/admin/logout", async (request, reply) => {
    if (rejectUntrustedOrigin(request, reply)) return reply;

    reply.header("set-cookie", buildClearedSessionCookie());
    return reply.code(204).send();
  });

  // Terceira trava: fora de desenvolvimento a rota simplesmente não existe.
  if (isDevLoginEnabled()) {
    app.post("/admin/dev-login", { config: loginRateLimit }, async (request, reply) => {
      // Quarta trava: recheck no handler.
      if (!isDevLoginEnabled()) {
        return reply.code(404).send({ error: "Rota não encontrada." });
      }
      if (rejectUntrustedOrigin(request, reply)) return reply;

      const email = env.DEV_ADMIN_EMAIL;
      if (!email) {
        return reply.code(503).send({ error: "Login de desenvolvimento não configurado." });
      }

      request.log.warn({ ip: request.ip }, "admin dev login used");
      return grantSession(reply, email);
    });
  }
}
