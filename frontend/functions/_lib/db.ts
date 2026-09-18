/** Cliente Neon e queries de admin / rate-limit. */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { requireEnv, type Env } from "./config";
import { hashPassword, randomTempPassword } from "./crypto";

export type AdminRole = "owner" | "editor";

export type AdminUser = {
  id: string;
  email: string;
  password_hash: string;
  role: AdminRole;
  active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicAdminUser = Omit<AdminUser, "password_hash">;

function sql(env: Env): NeonQueryFunction<false, false> {
  const url = requireEnv(env, "DATABASE_URL");
  return neon(url);
}

function mapUser(row: Record<string, unknown>): AdminUser {
  return {
    id: String(row.id),
    email: String(row.email),
    password_hash: String(row.password_hash),
    role: row.role === "owner" ? "owner" : "editor",
    active: Boolean(row.active),
    must_change_password: Boolean(row.must_change_password),
    last_login_at: row.last_login_at ? String(row.last_login_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function toPublicUser(user: AdminUser): PublicAdminUser {
  const { password_hash: _, ...rest } = user;
  return rest;
}

export async function findUserByEmail(env: Env, email: string): Promise<AdminUser | null> {
  const db = sql(env);
  const normalized = email.toLowerCase().trim();
  const rows = await db`
    SELECT id, email, password_hash, role, active, must_change_password,
           last_login_at, created_at, updated_at
    FROM admin_users
    WHERE email = ${normalized}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapUser(rows[0] as Record<string, unknown>);
}

export async function findUserById(env: Env, id: string): Promise<AdminUser | null> {
  const db = sql(env);
  const rows = await db`
    SELECT id, email, password_hash, role, active, must_change_password,
           last_login_at, created_at, updated_at
    FROM admin_users
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapUser(rows[0] as Record<string, unknown>);
}

export async function createUser(
  env: Env,
  input: { email: string; role: AdminRole; temporaryPassword?: string },
): Promise<{ user: PublicAdminUser; temporaryPassword: string }> {
  const db = sql(env);
  const email = input.email.toLowerCase().trim();
  const role = input.role === "owner" ? "owner" : "editor";
  const temporaryPassword = input.temporaryPassword ?? randomTempPassword();
  const password_hash = await hashPassword(temporaryPassword);

  const rows = await db`
    INSERT INTO admin_users (email, password_hash, role, active, must_change_password)
    VALUES (${email}, ${password_hash}, ${role}, TRUE, TRUE)
    RETURNING id, email, password_hash, role, active, must_change_password,
              last_login_at, created_at, updated_at
  `;
  const user = mapUser(rows[0] as Record<string, unknown>);
  return { user: toPublicUser(user), temporaryPassword };
}

export async function updatePassword(
  env: Env,
  userId: string,
  passwordHash: string,
  mustChangePassword: boolean,
): Promise<AdminUser | null> {
  const db = sql(env);
  const rows = await db`
    UPDATE admin_users
    SET password_hash = ${passwordHash},
        must_change_password = ${mustChangePassword},
        updated_at = NOW()
    WHERE id = ${userId}
    RETURNING id, email, password_hash, role, active, must_change_password,
              last_login_at, created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapUser(rows[0] as Record<string, unknown>);
}

export async function listUsers(env: Env): Promise<PublicAdminUser[]> {
  const db = sql(env);
  const rows = await db`
    SELECT id, email, password_hash, role, active, must_change_password,
           last_login_at, created_at, updated_at
    FROM admin_users
    ORDER BY created_at ASC
  `;
  return (rows as Record<string, unknown>[]).map((row) => toPublicUser(mapUser(row)));
}

export async function setUserActive(
  env: Env,
  userId: string,
  active: boolean,
): Promise<PublicAdminUser | null> {
  const db = sql(env);
  const rows = await db`
    UPDATE admin_users
    SET active = ${active}, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING id, email, password_hash, role, active, must_change_password,
              last_login_at, created_at, updated_at
  `;
  if (!rows[0]) return null;
  return toPublicUser(mapUser(rows[0] as Record<string, unknown>));
}

/** Conta owners ativos (para impedir apagar o último responsável). */
export async function countActiveOwners(env: Env): Promise<number> {
  const db = sql(env);
  const rows = await db`
    SELECT COUNT(*)::int AS count
    FROM admin_users
    WHERE role = 'owner' AND active = TRUE
  `;
  return Number((rows[0] as { count: number })?.count ?? 0);
}

/**
 * Hard-delete: não há FKs apontando para admin_users.
 * login_attempts guarda só email/ip — não bloqueia exclusão.
 */
export async function deleteUser(
  env: Env,
  userId: string,
): Promise<PublicAdminUser | null> {
  const db = sql(env);
  const rows = await db`
    DELETE FROM admin_users
    WHERE id = ${userId}
    RETURNING id, email, password_hash, role, active, must_change_password,
              last_login_at, created_at, updated_at
  `;
  if (!rows[0]) return null;
  return toPublicUser(mapUser(rows[0] as Record<string, unknown>));
}

export async function touchLastLogin(env: Env, userId: string): Promise<void> {
  const db = sql(env);
  await db`
    UPDATE admin_users
    SET last_login_at = NOW(), updated_at = NOW()
    WHERE id = ${userId}
  `;
}

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

export async function isRateLimited(
  env: Env,
  ip: string,
  email: string,
): Promise<boolean> {
  const db = sql(env);
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const normalized = email.toLowerCase().trim();

  const byIp = await db`
    SELECT COUNT(*)::int AS count
    FROM login_attempts
    WHERE ip = ${ip} AND attempted_at >= ${since}
  `;
  const byEmail = await db`
    SELECT COUNT(*)::int AS count
    FROM login_attempts
    WHERE email = ${normalized} AND attempted_at >= ${since}
  `;

  const ipCount = Number((byIp[0] as { count: number })?.count ?? 0);
  const emailCount = Number((byEmail[0] as { count: number })?.count ?? 0);
  return ipCount >= RATE_MAX || emailCount >= RATE_MAX;
}

export async function recordFailedAttempt(
  env: Env,
  ip: string,
  email: string,
): Promise<void> {
  const db = sql(env);
  const normalized = email.toLowerCase().trim() || null;
  await db`
    INSERT INTO login_attempts (email, ip)
    VALUES (${normalized}, ${ip})
  `;
}

export async function clearAttempts(env: Env, ip: string, email: string): Promise<void> {
  const db = sql(env);
  const normalized = email.toLowerCase().trim();
  await db`
    DELETE FROM login_attempts
    WHERE ip = ${ip} OR email = ${normalized}
  `;
}

export { RATE_MAX, RATE_WINDOW_MS };
