import { neon } from "@neondatabase/serverless";
import { requireDatabaseUrl, type Env } from "./config";
import { sha256Hex } from "./crypto";

/**
 * Cliente Neon por requisição.
 *
 * O backend antigo guardava o cliente em módulo. Em Workers cada isolate é
 * efêmero e pode atender requisições de contas diferentes, então o cliente é
 * criado a partir do env da própria requisição. O driver serverless fala HTTP,
 * não mantém pool, então isso não custa conexão.
 */
export function getSql(env: Env) {
  return neon(requireDatabaseUrl(env));
}

export type Sql = ReturnType<typeof getSql>;

export type AdminUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin";
  active: boolean;
};

const DEFAULT_ADMIN_EMAILS = ["devbruno@karina.com.br", "karina@karina.com.br"] as const;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Identificador curto do hash atual. Vai dentro do cookie: se a senha mudar,
 * o valor deixa de bater e todas as sessões antigas caem sozinhas.
 */
export function passwordVersionFromHash(passwordHash: string): Promise<string> {
  return sha256Hex(passwordHash).then((digest) => digest.slice(0, 16));
}

/**
 * Semeia os administradores padrão. Idempotente (ON CONFLICT DO NOTHING).
 *
 * No backend antigo isso rodava uma vez por processo, guardado num flag de
 * módulo. Em Workers o isolate é descartado a qualquer momento, então o flag
 * não segura nada — as duas queries voltariam a rodar com frequência. Como o
 * seed só precisa acontecer uma vez na vida do banco, ele saiu do caminho do
 * login e virou passo do script de migração (scripts/seed-admin.mjs).
 */
export async function seedDefaultAdminUsers(sql: Sql, passwordHash: string): Promise<void> {
  for (const email of DEFAULT_ADMIN_EMAILS) {
    await sql`
      INSERT INTO admin_users (email, password_hash, role, active)
      VALUES (${email}, ${passwordHash}, 'admin', TRUE)
      ON CONFLICT (email) DO NOTHING
    `;
  }
}

export async function findAdminUserByEmail(sql: Sql, email: string): Promise<AdminUserRecord | null> {
  const rows = (await sql`
    SELECT id, email, password_hash AS "passwordHash", role, active
    FROM admin_users
    WHERE email = ${normalizeEmail(email)}
    LIMIT 1
  `) as AdminUserRecord[];

  const user = rows[0];
  if (!user || user.role !== "admin" || !user.active) return null;
  return user;
}

/* ------------------------------------------------------------------ *
 * Rate limit de login
 * ------------------------------------------------------------------ */

/**
 * @fastify/rate-limit não existe em Workers e KV tem consistência eventual
 * (ruim para contador). Como o Neon já está no caminho do login, o contador
 * mora lá: custo de I/O, zero de CPU, e nenhum serviço novo.
 */
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MINUTES = 10;

export async function isLoginRateLimited(sql: Sql, ip: string): Promise<boolean> {
  const rows = (await sql`
    SELECT COUNT(*)::int AS count
    FROM login_attempts
    WHERE ip = ${ip}
      AND attempted_at > NOW() - (${LOGIN_WINDOW_MINUTES} || ' minutes')::interval
  `) as Array<{ count: number }>;

  return (rows[0]?.count ?? 0) >= LOGIN_MAX_ATTEMPTS;
}

export async function recordFailedLogin(sql: Sql, ip: string): Promise<void> {
  await sql`INSERT INTO login_attempts (ip) VALUES (${ip})`;
  // Poda oportunista: mantém a tabela pequena sem precisar de cron.
  await sql`DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '1 hour'`;
}

export async function clearLoginAttempts(sql: Sql, ip: string): Promise<void> {
  await sql`DELETE FROM login_attempts WHERE ip = ${ip}`;
}
