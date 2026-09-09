/**
 * Cria usuário admin direto no Neon (primeiro owner / bootstrap).
 *
 *   DATABASE_URL="..." node scripts/create-user.mjs --email dev@exemplo.com --role owner
 */
import { neon } from "@neondatabase/serverless";
import { hashPassword, parseArgs, randomTempPassword } from "./lib/crypto.mjs";

const args = parseArgs(process.argv.slice(2));
const email = String(args.email ?? "").toLowerCase().trim();
const role = args.role === "owner" ? "owner" : "editor";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Defina DATABASE_URL.");
  process.exit(1);
}
if (!email || !email.includes("@")) {
  console.error("Use --email usuario@dominio.com");
  process.exit(1);
}

const temporaryPassword = randomTempPassword();
const passwordHash = await hashPassword(temporaryPassword);
const sql = neon(databaseUrl);

try {
  const rows = await sql`
    INSERT INTO admin_users (email, password_hash, role, active, must_change_password)
    VALUES (${email}, ${passwordHash}, ${role}, TRUE, TRUE)
    RETURNING id, email, role, must_change_password, created_at
  `;
  const user = rows[0];
  console.log("Usuário criado.");
  console.log(`  id:    ${user.id}`);
  console.log(`  email: ${user.email}`);
  console.log(`  role:  ${user.role}`);
  console.log(`  must_change_password: ${user.must_change_password}`);
  console.log("");
  console.log("Senha temporária (guarde agora — não será mostrada de novo):");
  console.log(`  ${temporaryPassword}`);
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("unique") || msg.includes("duplicate")) {
    console.error("Já existe um usuário com esse email. Use scripts/reset-password.mjs");
    process.exit(1);
  }
  console.error(msg);
  process.exit(1);
}
