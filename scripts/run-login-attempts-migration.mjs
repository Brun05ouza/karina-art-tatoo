import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    out[t.slice(0, i)] = t.slice(i + 1);
  }
  return out;
}

const env = { ...loadEnv("backend/.env"), ...process.env };
if (!env.DATABASE_URL) {
  console.log("SKIP_MIGRATION: DATABASE_URL nao disponivel localmente");
  process.exit(0);
}

const sql = neon(env.DATABASE_URL);
await sql`
  CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip VARCHAR(64) NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
await sql`
  CREATE INDEX IF NOT EXISTS login_attempts_ip_time_idx
    ON login_attempts (ip, attempted_at DESC)
`;
console.log("MIGRATION_OK: login_attempts pronta");
