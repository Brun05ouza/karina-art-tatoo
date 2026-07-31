import "dotenv/config";
import { z } from "zod";
import { isValidHashFormat } from "./password.js";

const emailField = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.email().max(200),
);

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    HOST: z.string().min(1).default("127.0.0.1"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3333),
    CORS_ORIGINS: z.string().min(1),

    // Token para integrações servidor-servidor. Nunca vai para o navegador.
    ADMIN_API_TOKEN: z.string().min(32),

    // Login do painel administrativo.
    ADMIN_EMAIL: emailField,
    ADMIN_PASSWORD_HASH: z
      .string()
      .refine(isValidHashFormat, "formato de hash scrypt inválido (gere com: npm run admin:hash)"),
    ADMIN_SESSION_SECRET: z.string().min(32),

    // Login de desenvolvimento. Impossível em produção (ver superRefine abaixo).
    DEV_ADMIN_ENABLED: z.enum(["true", "false"]).default("false"),
    DEV_ADMIN_EMAIL: z.string().optional(),
    DEV_ADMIN_PASSWORD: z.string().optional(),

    // Opcionais no boot: validados no primeiro uso (ver requireDatabaseUrl/requireR2Config).
    // Assim o servidor sobe apenas com as variáveis de autenticação, e as rotas
    // que dependem de Neon/R2 respondem 503 com mensagem clara.
    DATABASE_URL: z.string().startsWith("postgresql://").optional(),
    R2_ACCOUNT_ID: z.string().min(1).optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    R2_BUCKET_NAME: z.string().min(1).optional(),
    R2_PUBLIC_BASE_URL: z.url().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === "production" && value.DEV_ADMIN_ENABLED === "true") {
      ctx.addIssue({
        code: "custom",
        path: ["DEV_ADMIN_ENABLED"],
        message: "DEV_ADMIN_ENABLED não pode estar ativo em produção.",
      });
    }

    if (value.DEV_ADMIN_ENABLED === "true" && (!value.DEV_ADMIN_EMAIL || !value.DEV_ADMIN_PASSWORD)) {
      ctx.addIssue({
        code: "custom",
        path: ["DEV_ADMIN_EMAIL"],
        message: "DEV_ADMIN_EMAIL e DEV_ADMIN_PASSWORD são obrigatórios quando DEV_ADMIN_ENABLED=true.",
      });
    }

    // Com cookies de sessão (credentials: true), a allowlist de origens passa a
    // fazer parte do controle de acesso: uma origem local em produção viraria
    // superfície de ataque.
    if (value.NODE_ENV === "production") {
      const localOrigin = value.CORS_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .find((origin) => origin.startsWith("http://") || /localhost|127\.0\.0\.1/.test(origin));

      if (localOrigin) {
        ctx.addIssue({
          code: "custom",
          path: ["CORS_ORIGINS"],
          message: `CORS_ORIGINS não pode conter origens locais ou http em produção (${localOrigin}).`,
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((issue) => `${issue.path.join(".")} (${issue.message})`)
    .join(", ");
  throw new Error(`Configuração inválida ou ausente: ${missing}`);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";

export const allowedOrigins = new Set(
  env.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
);

/** Erro de recurso opcional não configurado. Vira 503 no error handler. */
export class ConfigError extends Error {
  readonly statusCode = 503;

  constructor(variables: string) {
    super(`Recurso indisponível: configure ${variables} no backend/.env.`);
    this.name = "ConfigError";
  }
}

export function requireDatabaseUrl(): string {
  if (!env.DATABASE_URL) throw new ConfigError("DATABASE_URL");
  return env.DATABASE_URL;
}

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl: string;
};

export function requireR2Config(): R2Config {
  const missing = [
    ["R2_ACCOUNT_ID", env.R2_ACCOUNT_ID],
    ["R2_ACCESS_KEY_ID", env.R2_ACCESS_KEY_ID],
    ["R2_SECRET_ACCESS_KEY", env.R2_SECRET_ACCESS_KEY],
    ["R2_BUCKET_NAME", env.R2_BUCKET_NAME],
    ["R2_PUBLIC_BASE_URL", env.R2_PUBLIC_BASE_URL],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name as string);

  if (missing.length > 0) throw new ConfigError(missing.join(", "));

  return {
    accountId: env.R2_ACCOUNT_ID!,
    accessKeyId: env.R2_ACCESS_KEY_ID!,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    bucketName: env.R2_BUCKET_NAME!,
    publicBaseUrl: env.R2_PUBLIC_BASE_URL!,
  };
}

export function hasDatabaseUrl(): boolean {
  return Boolean(env.DATABASE_URL);
}

export function hasR2Config(): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET_NAME &&
      env.R2_PUBLIC_BASE_URL,
  );
}

/**
 * O login de desenvolvimento só existe fora de produção. Esta função é a
 * segunda de quatro travas (as outras: recusa de boot no superRefine acima,
 * rota não registrada e recheck no handler).
 */
export function isDevLoginEnabled(): boolean {
  return (
    !isProduction &&
    env.DEV_ADMIN_ENABLED === "true" &&
    Boolean(env.DEV_ADMIN_EMAIL) &&
    Boolean(env.DEV_ADMIN_PASSWORD)
  );
}
