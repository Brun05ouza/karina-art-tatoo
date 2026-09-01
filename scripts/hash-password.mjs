#!/usr/bin/env node
/**
 * Gera o hash PBKDF2 da senha administrativa e mede quanto tempo a verificação
 * leva — que é o número que decide se o login cabe no plano gratuito do
 * Cloudflare Pages (10ms de CPU por requisição).
 *
 * Uso:
 *   node scripts/hash-password.mjs                  # 10.000 iterações (padrão calibrado)
 *   node scripts/hash-password.mjs --iterations 20000
 *   node scripts/hash-password.mjs --bench          # só mede, não pede senha
 *
 * Usa a WebCrypto do Node (globalThis.crypto.subtle), a MESMA API das
 * Functions — então o hash gerado aqui é verificável lá, e o tempo medido é
 * comparável. Requer Node 20+.
 *
 * IMPORTANTE: a medição local é uma aproximação. A máquina do Cloudflare não
 * é a sua. Use o número como ponto de partida e confirme com wrangler.
 */
import { createInterface } from "node:readline";
import { webcrypto } from "node:crypto";

const subtle = webcrypto.subtle;
const KEYLEN = 32;
const SALT_BYTES = 16;

function toBase64Url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function derive(password, salt, iterations) {
  const key = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    KEYLEN * 8,
  );
  return new Uint8Array(bits);
}

async function buildHash(password, iterations) {
  const salt = webcrypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await derive(password, salt, iterations);
  return ["pbkdf2", iterations, KEYLEN, toBase64Url(salt), toBase64Url(derived)].join(":");
}

async function measure(iterations, rounds = 5) {
  const salt = webcrypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const samples = [];
  for (let i = 0; i < rounds; i++) {
    const start = performance.now();
    await derive("senha-de-referencia-para-medicao", salt, iterations);
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)];
}

function ask(question, silent = false) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (silent) {
      // Evita ecoar a senha no terminal / histórico do shell.
      const originalWrite = process.stdout.write.bind(process.stdout);
      rl._writeToOutput = (chunk) => {
        if (chunk.includes(question)) originalWrite(chunk);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (silent) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

function randomSecret() {
  return toBase64Url(webcrypto.getRandomValues(new Uint8Array(32)));
}

const args = process.argv.slice(2);
const benchOnly = args.includes("--bench");
const iterationsFlag = args.indexOf("--iterations");
const iterations = iterationsFlag >= 0 ? Number(args[iterationsFlag + 1]) : 10_000;

if (!Number.isInteger(iterations) || iterations < 1_000 || iterations > 1_000_000) {
  console.error("Iterações precisam ser um inteiro entre 1.000 e 1.000.000.");
  process.exit(1);
}

console.log(`\nMedindo PBKDF2-SHA256 com ${iterations.toLocaleString("pt-BR")} iterações...`);
const median = await measure(iterations);
console.log(`Tempo mediano de verificação: ${median.toFixed(1)}ms (nesta máquina)\n`);

if (median > 7) {
  console.warn(
    "⚠  Acima de ~7ms. O plano gratuito do Pages corta em 10ms de CPU e o login\n" +
      "   falharia com 'exceeded CPU time limit'. Rode de novo com menos iterações,\n" +
      `   por exemplo: node scripts/hash-password.mjs --iterations ${Math.floor(iterations / 2)}\n`,
  );
} else {
  console.log("✓ Dentro da margem dos 10ms do plano gratuito.\n");
}

if (benchOnly) process.exit(0);

const password = await ask("Senha do painel (não aparece na tela): ", true);
if (!password || password.length < 12) {
  console.error(
    "\nA senha precisa ter pelo menos 12 caracteres.\n" +
      "Com PBKDF2 calibrado para caber em 10ms, o comprimento da senha é o que\n" +
      "carrega a segurança — uma senha longa compensa a derivação mais leve.",
  );
  process.exit(1);
}

const hash = await buildHash(password, iterations);

console.log("\n--- Cole no painel do Cloudflare Pages (tipo: Secret) ---\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`ADMIN_SESSION_SECRET=${randomSecret()}`);
console.log(`ADMIN_API_TOKEN=${randomSecret()}`);
console.log(
  "\nDepois rode: node scripts/seed-admin.mjs\n" +
    "para gravar esse mesmo hash nas linhas de admin_users no Neon.\n",
);
