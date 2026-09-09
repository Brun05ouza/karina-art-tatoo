/**
 * Garante bucket público `gallery` no Supabase (idempotente).
 * Lê credenciais de frontend/.dev.vars
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = readFileSync(join(root, "frontend", ".dev.vars"), "utf8");
const env = Object.fromEntries(
  raw
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const url = env.SUPABASE_URL?.replace(/\/+$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = env.SUPABASE_BUCKET || "gallery";

if (!url || !key) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes em .dev.vars");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${key}`,
  apikey: key,
  "Content-Type": "application/json",
};

const list = await fetch(`${url}/storage/v1/bucket`, { headers });
const buckets = list.ok ? await list.json() : [];
const exists = Array.isArray(buckets) && buckets.some((b) => b.id === bucket || b.name === bucket);

if (exists) {
  console.log(`Bucket "${bucket}" já existe.`);
} else {
  const create = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: bucket, name: bucket, public: true }),
  });
  const body = await create.text();
  if (!create.ok) {
    console.error("Falha ao criar bucket:", create.status, body);
    process.exit(1);
  }
  console.log(`Bucket "${bucket}" criado (público).`);
}

// smoke: signed upload URL
const path = `${bucket === "gallery" ? "portfolio" : "test"}/smoke/test.jpg`;
// path inside bucket shouldn't include bucket name in object key — use portfolio/...
const objectKey = `portfolio/smoke/${crypto.randomUUID()}.jpg`;
const sign = await fetch(`${url}/storage/v1/object/upload/sign/${bucket}/${objectKey}`, {
  method: "POST",
  headers,
  body: "{}",
});
console.log("presign status", sign.status, await sign.text().then((t) => t.slice(0, 200)));
