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

/** Divide statements respeitando aspas simples e dollar-quotes ($tag$…$tag$). */
function splitStatements(sqlText) {
  const lines = sqlText.split("\n").map((line) => {
    if (line.trim().startsWith("--")) return "";
    return line;
  });
  const text = lines.join("\n");

  const statements = [];
  let buf = "";
  let i = 0;
  let dollarTag = null;
  let inSingle = false;

  while (i < text.length) {
    const c = text[i];

    if (dollarTag) {
      if (text.startsWith(dollarTag, i)) {
        buf += dollarTag;
        i += dollarTag.length;
        dollarTag = null;
        continue;
      }
      buf += c;
      i += 1;
      continue;
    }

    if (inSingle) {
      buf += c;
      if (c === "'" && text[i + 1] === "'") {
        buf += "'";
        i += 2;
        continue;
      }
      if (c === "'") inSingle = false;
      i += 1;
      continue;
    }

    if (c === "'") {
      inSingle = true;
      buf += c;
      i += 1;
      continue;
    }

    if (c === "$") {
      const m = text.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
      if (m) {
        dollarTag = m[0];
        buf += dollarTag;
        i += dollarTag.length;
        continue;
      }
    }

    if (c === ";") {
      const s = buf.trim();
      if (s) statements.push(s);
      buf = "";
      i += 1;
      continue;
    }

    buf += c;
    i += 1;
  }

  const tail = buf.trim();
  if (tail) statements.push(tail);
  return statements;
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
