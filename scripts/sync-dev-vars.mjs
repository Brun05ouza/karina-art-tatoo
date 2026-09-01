import { readFileSync, writeFileSync, existsSync } from "node:fs";

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let v = t.slice(i + 1);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[t.slice(0, i)] = v;
  }
  return out;
}

const env = loadEnv("backend/.env");
const keys = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_BUCKET",
  "ADMIN_PASSWORD_HASH",
  "ADMIN_SESSION_SECRET",
  "ADMIN_API_TOKEN",
];

const lines = keys.filter((k) => env[k]).map((k) => `${k}=${env[k]}`);
if (lines.length < 4) {
  console.log("SKIP_DEV_VARS: backend/.env incompleto para Pages Functions");
  process.exit(0);
}

writeFileSync("frontend/.dev.vars", lines.join("\n") + "\n", "utf8");
console.log(`DEV_VARS_OK: ${lines.length} vars escritas em frontend/.dev.vars (gitignored)`);
if (env.ADMIN_PASSWORD_HASH && !env.ADMIN_PASSWORD_HASH.startsWith("pbkdf2:")) {
  console.log("WARN: ADMIN_PASSWORD_HASH ainda e scrypt — rode hash-password.mjs + seed-admin.mjs antes do login nas Functions");
}
