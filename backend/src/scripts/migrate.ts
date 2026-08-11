import { readdir, readFile } from "node:fs/promises";
import { ensureDefaultAdminUsers } from "../admin-users.js";
import { sql } from "../db.js";

const migrationsUrl = new URL("../../migrations/", import.meta.url);
const files = (await readdir(migrationsUrl))
  .filter((file) => file.endsWith(".sql"))
  .sort((a, b) => a.localeCompare(b));

for (const file of files) {
  const migration = await readFile(new URL(file, migrationsUrl), "utf8");
  const statements = migration
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }

  console.log(`Migração aplicada: ${file}`);
}

await ensureDefaultAdminUsers();
console.log("Usuários administrativos padrão garantidos.");

console.log("Migração concluída com sucesso.");
