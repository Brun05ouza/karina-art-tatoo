/**
 * Mede o tempo de PBKDF2-SHA256 via WebCrypto para calibrar iterações
 * no limite de ~10ms de CPU do Cloudflare Pages (plano gratuito).
 * Alvo: o maior valor confortavelmente abaixo de 7ms nesta máquina.
 */
import { webcrypto } from "node:crypto";

const subtle = webcrypto.subtle;
const TARGET_MS = 7;
const ITERATIONS = [5_000, 10_000, 20_000, 30_000, 40_000, 50_000];
const KEYLEN = 32;
const SAMPLES = 5;
const PASSWORD = "bench-password-karina-sarte";

function toBase64Url(bytes) {
  const bin = String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function derive(iterations, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey("raw", enc.encode(PASSWORD), "PBKDF2", false, [
    "deriveBits",
  ]);
  return subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    KEYLEN * 8,
  );
}

async function measure(iterations) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  // warm-up
  await derive(iterations, salt);
  const times = [];
  for (let i = 0; i < SAMPLES; i++) {
    const s = webcrypto.getRandomValues(new Uint8Array(16));
    const t0 = performance.now();
    await derive(iterations, s);
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  return { median, mean, min: times[0], max: times[times.length - 1] };
}

const saltPreview = toBase64Url(webcrypto.getRandomValues(new Uint8Array(16)));
console.log("PBKDF2-SHA256 bench (WebCrypto)");
console.log(`keylen=${KEYLEN} samples=${SAMPLES} target<${TARGET_MS}ms`);
console.log(`salt preview encoding ok: ${saltPreview.slice(0, 8)}…\n`);

let recommended = null;
for (const n of ITERATIONS) {
  const { median, mean, min, max } = await measure(n);
  const flag = median > TARGET_MS ? "  ⚠ acima de 7ms" : "  ok";
  console.log(
    `${String(n).padStart(6)} iter | median ${median.toFixed(2)}ms | mean ${mean.toFixed(2)}ms | min ${min.toFixed(2)} max ${max.toFixed(2)}${flag}`,
  );
  if (median <= TARGET_MS) recommended = n;
}

console.log("");
if (recommended == null) {
  console.log("Nenhuma configuração ficou ≤ 7ms. Use 5000 e monitore o wrangler.");
  process.exitCode = 1;
} else {
  console.log(`Recomendado: ${recommended} iterações (maior valor ≤ ${TARGET_MS}ms nesta máquina).`);
  console.log("Defina DEFAULT_PBKDF2_ITERATIONS em functions/_lib/crypto.ts com esse valor.");
  console.log("Nota: Workers Cloudflare tendem a ser um pouco mais lentos que este Node local —");
  console.log("prefira margem; se 20k estiver no limite local, considere 10k em produção.");
}
