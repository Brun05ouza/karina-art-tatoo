import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { allowedOrigins, ConfigError, env, hasDatabaseUrl, hasR2Config } from "./config.js";
import { adminAuthRoutes } from "./routes/admin-auth.js";
import { contentRoutes } from "./routes/content.js";
import { mediaRoutes } from "./routes/media.js";
import { uploadRoutes } from "./routes/uploads.js";

const app = Fastify({
  trustProxy: true,
  bodyLimit: 1_048_576,
  logger: {
    level: env.NODE_ENV === "production" ? "info" : "debug",
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers.set-cookie",
        "DATABASE_URL",
        "R2_SECRET_ACCESS_KEY",
      ],
      censor: "[REDACTED]",
    },
  },
});

await app.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// credentials: true é obrigatório para o cookie de sessão do painel. Isso torna
// a allowlist de CORS_ORIGINS parte do controle de acesso — config.ts recusa o
// boot se houver origem local ou http em produção.
await app.register(cors, {
  credentials: true,
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Accept", "Authorization", "Content-Type"],
  origin(origin, callback) {
    const normalizedOrigin = origin?.replace(/\/$/, "");
    const allowed = !normalizedOrigin || allowedOrigins.has(normalizedOrigin);
    callback(null, allowed);
  },
});

await app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: "1 minute",
  errorResponseBuilder: () => ({ error: "Muitas requisições. Tente novamente em instantes." }),
});

app.get("/health", async () => ({ status: "ok" }));
await app.register(adminAuthRoutes, { prefix: "/api" });
await app.register(contentRoutes, { prefix: "/api" });
await app.register(mediaRoutes, { prefix: "/api" });
await app.register(uploadRoutes, { prefix: "/api" });

app.setNotFoundHandler(async (_request, reply) => {
  return reply.code(404).send({ error: "Rota não encontrada." });
});

app.setErrorHandler<FastifyError>(async (error, request, reply) => {
  request.log.error({ err: error }, "request failed");

  // Recurso opcional não configurado (DATABASE_URL, R2_*): a mensagem precisa
  // chegar ao cliente, então não pode cair no mascaramento de 5xx abaixo.
  if (error instanceof ConfigError) {
    return reply.code(error.statusCode).send({ error: error.message });
  }

  const statusCode = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
  const message = statusCode < 500 ? error.message : "Erro interno do servidor.";
  return reply.code(statusCode).send({ error: message });
});

try {
  await app.listen({ host: env.HOST, port: env.PORT });

  if (!hasDatabaseUrl()) {
    app.log.warn("DATABASE_URL ausente: /api/content e /api/media responderão 503.");
  }
  if (!hasR2Config()) {
    app.log.warn("Credenciais R2 ausentes: /api/uploads/presign responderá 503.");
  }
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
