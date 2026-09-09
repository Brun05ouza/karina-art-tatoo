import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const raw = readFileSync("frontend/.dev.vars", "utf8");
const db = raw.match(/^DATABASE_URL=(.*)$/m)[1].trim();
const sql = neon(db);
await sql`DELETE FROM login_attempts`;
console.log("cleared login_attempts");
