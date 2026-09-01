/**
 * Bindings de ambiente do Cloudflare Pages.
 *
 * Todas vêm de Settings > Environment variables no painel do Pages.
 * DATABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_* devem ser do tipo "Secret".
 * Nenhuma delas tem prefixo VITE_, então nunca entram no bundle do cliente.
 */
export interface Env {
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_BUCKET: string;
  ADMIN_PASSWORD_HASH: string;
  ADMIN_SESSION_SECRET: string;
  ADMIN_API_TOKEN: string;
}

/** Erro de recurso opcional não configurado. Vira 503. */
export class ConfigError extends Error {
  readonly statusCode = 503;
  constructor(variables: string) {
    super(`Recurso indisponível: configure ${variables} nas variáveis do Pages.`);
    this.name = "ConfigError";
  }
}

export function requireDatabaseUrl(env: Env): string {
  if (!env.DATABASE_URL) throw new ConfigError("DATABASE_URL");
  return env.DATABASE_URL;
}

export type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
  bucket: string;
};

export function requireSupabaseConfig(env: Env): SupabaseConfig {
  const missing = [
    ["SUPABASE_URL", env.SUPABASE_URL],
    ["SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY],
    ["SUPABASE_BUCKET", env.SUPABASE_BUCKET],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name as string);

  if (missing.length > 0) throw new ConfigError(missing.join(", "));

  return {
    url: env.SUPABASE_URL.replace(/\/$/, ""),
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: env.SUPABASE_BUCKET,
  };
}

export function hasSupabaseConfig(env: Env): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_BUCKET);
}

/** Resposta JSON padrão, sempre no-store para rotas administrativas. */
export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });
}

export function error(status: number, message: string, extraHeaders?: HeadersInit): Response {
  return json({ error: message }, { status, headers: extraHeaders });
}

/**
 * Converte exceções em resposta. ConfigError vira 503 com mensagem útil;
 * o resto vira 500 genérico para não vazar detalhe de infraestrutura.
 */
export function handleError(cause: unknown): Response {
  if (cause instanceof ConfigError) return error(cause.statusCode, cause.message);
  console.error("request failed", cause);
  return error(500, "Erro interno do servidor.");
}
