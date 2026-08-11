import { createHash } from "node:crypto";
import { env } from "./config.js";
import { sql } from "./db.js";

export type AdminUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin";
  active: boolean;
};

const DEFAULT_ADMIN_EMAILS = ["devbruno@karina.com.br", "karina@karina.com.br"] as const;
let defaultAdminUsersReady = false;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function passwordVersionFromHash(passwordHash: string) {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

export async function ensureDefaultAdminUsers() {
  if (defaultAdminUsersReady) return;

  for (const email of DEFAULT_ADMIN_EMAILS) {
    await sql`
      INSERT INTO admin_users (email, password_hash, role, active)
      VALUES (${email}, ${env.ADMIN_PASSWORD_HASH}, 'admin', TRUE)
      ON CONFLICT (email) DO NOTHING
    `;
  }

  defaultAdminUsersReady = true;
}

export async function findAdminUserByEmail(email: string): Promise<AdminUserRecord | null> {
  await ensureDefaultAdminUsers();

  const rows = await sql`
    SELECT
      id,
      email,
      password_hash AS "passwordHash",
      role,
      active
    FROM admin_users
    WHERE email = ${normalizeEmail(email)}
    LIMIT 1
  `;

  const user = rows[0] as AdminUserRecord | undefined;
  if (!user || user.role !== "admin" || !user.active) return null;
  return user;
}
