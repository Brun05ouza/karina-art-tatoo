/**
 * Gera nova senha temporária e marca must_change_password.
 * Substitui "esqueci minha senha" (não há email no sistema).
 *
 *   DATABASE_URL="..." node scripts/reset-password.mjs --email user@exemplo.com
 */
import { neon } from "@neondatabase/serverless";
import { hashPassword, parseArgs, randomTempPassword } from "./lib/crypto.mjs";

const args = parseArgs(process.argv.slice(2));
const email = String(args.email ?? "").toLowerCase().trim();
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

const rows = await sql`
  UPDATE admin_users
  SET password_hash = ${passwordHash},
      must_change_password = TRUE,
      updated_at = NOW()
  WHERE email = ${email}
  RETURNING id, email, role, must_change_password
`;

if (!rows[0]) {
  console.error("Usuário não encontrado.");
  process.exit(1);
}

const user = rows[0];
console.log("Senha redefinida.");
console.log(`  id:    ${user.id}`);
console.log(`  email: ${user.email}`);
console.log(`  role:  ${user.role}`);
console.log(`  must_change_password: ${user.must_change_password}`);
console.log("");
console.log("Nova senha temporária (guarde agora — não será mostrada de novo):");
console.log(`  ${temporaryPassword}`);
