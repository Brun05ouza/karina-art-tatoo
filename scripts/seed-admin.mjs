#!/usr/bin/env node
/**
 * Grava o ADMIN_PASSWORD_HASH atual nas linhas de admin_users no Neon.
 *
 * No backend antigo isso acontecia sozinho no primeiro login (ensureDefault-
 * AdminUsers, guardado por um flag de módulo). Em Workers o isolate morre a
 * qualquer momento e o flag não segura nada, então o seed sairia do lugar
 * certo — virou passo explícito, rodado uma vez.
 *
 * Uso:
 *   DATABASE_URL=... ADMIN_PASSWORD_HASH=... node scripts/seed-admin.mjs
 *
 * Os dois e-mails recebem o MESMO hash, replicando o comportamento atual.
 */
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["devbruno@karina.com.br", "karina@karina.com.br"];
const HASH_PATTERN = /^pbkdf2:(\d+):(\d+):([A-Za-z0-9_-]+):([A-Za-z0-9_-]+)$/;

const databaseUrl = process.env.DATABASE_URL;
const passwordHash = process.env.ADMIN_PASSWORD_HASH;

if (!databaseUrl) {
  console.error("DATABASE_URL ausente.");
  process.exit(1);
}

if (!passwordHash || !HASH_PATTERN.test(passwordHash)) {
  console.error(
    "ADMIN_PASSWORD_HASH ausente ou em formato inválido.\n" +
      "Esperado: pbkdf2:<iterações>:32:<salt>:<hash>\n" +
      "Gere com: node scripts/hash-password.mjs",
  );
  process.exit(1);
}

const sql = neon(databaseUrl);

for (const email of ADMIN_EMAILS) {
  await sql`
    INSERT INTO admin_users (email, password_hash, role, active)
    VALUES (${email}, ${passwordHash}, 'admin', TRUE)
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      updated_at = NOW()
  `;
  console.log(`✓ ${email}`);
}

console.log(
  "\nPronto. As sessões antigas caem sozinhas: o cookie carrega uma assinatura\n" +
    "derivada do hash, e ela deixa de bater assim que a senha muda.\n",
);
