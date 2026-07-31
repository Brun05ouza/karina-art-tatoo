import { readFile } from "node:fs/promises";
import { sql } from "../db.js";

const migrationUrl = new URL("../../migrations/001_initial.sql", import.meta.url);
const migration = await readFile(migrationUrl, "utf8");
const statements = migration
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

console.log("Migração concluída com sucesso.");
