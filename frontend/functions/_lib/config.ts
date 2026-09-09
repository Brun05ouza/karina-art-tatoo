/** Tipos de ambiente e helpers HTTP para Pages Functions. */

export type Env = {
  DATABASE_URL: string;
  ADMIN_SESSION_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_BUCKET: string;
};

export class MissingEnvError extends Error {
  readonly status = 503;
  constructor(public readonly key: string) {
    super(`Variável de ambiente ausente: ${key}`);
    this.name = "MissingEnvError";
  }
}

export function requireEnv(env: Env, key: keyof Env): string {
  const value = env[key];
  if (value == null || !String(value).trim()) {
    throw new MissingEnvError(String(key));
  }
  return String(value).trim();
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(
  status: number,
  message: string,
  extra?: Record<string, unknown>,
): Response {
  return json({ error: message, ...extra }, { status });
}

export function handleError(err: unknown): Response {
  if (err instanceof MissingEnvError) {
    return error(503, err.message);
  }
  console.error("[admin-api]", err);
  return error(500, "Erro interno do servidor.");
}
