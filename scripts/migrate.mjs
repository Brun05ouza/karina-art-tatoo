/**
 * Aplica migrations/*.sql no Neon.
 *   DATABASE_URL=... node scripts/migrate.mjs
 * ou lê DATABASE_URL de frontend/.dev.vars
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const raw = readFileSync(join(root, "frontend", ".dev.vars"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^DATABASE_URL=(.*)$/);
      if (m) return m[1].trim();
    }
  } catch {
    /* ignore */
  }
  return null;
}

const databaseUrl = loadDatabaseUrl();
if (!databaseUrl) {
  console.error("Defina DATABASE_URL ou crie frontend/.dev.vars");
  process.exit(1);
}

const migrationsDir = join(root, "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const sql = neon(databaseUrl);

function splitStatements(sqlText) {
  return sqlText
    .split(";")
    .map((s) =>
      s
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);
}

for (const file of files) {
  const path = join(migrationsDir, file);
  const body = readFileSync(path, "utf8");
  console.log(`Applying ${file}…`);
  for (const statement of splitStatements(body)) {
    await sql.query(statement);
  }
  console.log(`  ok`);
}

console.log("Migrations concluídas.");
