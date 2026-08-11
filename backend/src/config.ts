import "dotenv/config";
import { z } from "zod";
import { isValidHashFormat } from "./password.js";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    HOST: z.string().min(1).default("127.0.0.1"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3333),
    CORS_ORIGINS: z.string().min(1),

    // Token para integrações servidor-servidor. Nunca vai para o navegador.
    ADMIN_API_TOKEN: z.string().min(32),

    // Login do painel administrativo. Os e-mails autorizados ficam na tabela admin_users.
    ADMIN_PASSWORD_HASH: z
      .string()
      .refine(isValidHashFormat, "formato de hash scrypt inválido (gere com: npm run admin:hash)"),
    ADMIN_SESSION_SECRET: z.string().min(32),

    // Opcionais no boot: validados no primeiro uso (ver requireDatabaseUrl/requireSupabaseConfig).
    // Assim o servidor sobe apenas com as variáveis de autenticação, e as rotas
    // que dependem de Neon/Supabase respondem 503 com mensagem clara.
    DATABASE_URL: z.string().startsWith("postgresql://").optional(),
    SUPABASE_URL: z.url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    SUPABASE_BUCKET: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
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

export type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
  bucket: string;
};

export function requireSupabaseConfig(): SupabaseConfig {
  const missing = [
    ["SUPABASE_URL", env.SUPABASE_URL],
    ["SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY],
    ["SUPABASE_BUCKET", env.SUPABASE_BUCKET],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name as string);

  if (missing.length > 0) throw new ConfigError(missing.join(", "));

  return {
    url: env.SUPABASE_URL!,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY!,
    bucket: env.SUPABASE_BUCKET!,
  };
}

export function hasDatabaseUrl(): boolean {
  return Boolean(env.DATABASE_URL);
}

export function hasSupabaseConfig(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_BUCKET);
}
