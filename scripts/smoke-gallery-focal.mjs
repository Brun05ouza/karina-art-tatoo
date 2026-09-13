/**
 * Smoke: focal point API validation + public fields.
 * node scripts/smoke-gallery-focal.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.SMOKE_BASE || "http://127.0.0.1:8788";

function loadDevVars() {
  const out = {};
  try {
    const raw = readFileSync(join(root, "frontend", ".dev.vars"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  } catch {
    /* ignore */
  }
  return out;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const vars = loadDevVars();
  const email = process.env.SMOKE_EMAIL || "dev@karinasarte.com.br";
  const password = process.env.SMOKE_PASSWORD || vars.SMOKE_ADMIN_PASSWORD;

  const pub = await fetch(`${BASE}/api/gallery/portfolio`);
  assert(pub.ok, `GET portfolio ${pub.status}`);
  const body = await pub.json();
  if (body.items?.[0]) {
    assert("focal_x" in body.items[0], "público deve incluir focal_x");
    assert("focal_y" in body.items[0], "público deve incluir focal_y");
    console.log("público focal sample", body.items[0].focal_x, body.items[0].focal_y);
  } else {
    console.log("sem itens publicados — ok");
  }

  if (!password) {
    console.log("OK (público). Sem senha para mutações.");
    return;
  }

  const login = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert(login.ok, `login ${login.status}`);
  const setCookie = login.headers.getSetCookie?.() || [];
  const cookie =
    setCookie.map((c) => c.split(";")[0]).join("; ") ||
    (login.headers.get("set-cookie") || "")
      .split(",")
      .map((c) => c.split(";")[0].trim())
      .join("; ");

  const list = await (
    await fetch(`${BASE}/api/admin/gallery/portfolio`, { headers: { Cookie: cookie } })
  ).json();
  const item = list.items?.[0];
  assert(item, "precisa de item no admin");

  const bad = await fetch(`${BASE}/api/admin/gallery/item/${item.id}`, {
    method: "PATCH",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ focalX: 150, focalY: 50 }),
  });
  assert(bad.status === 400, `esperado 400 para focal inválido, veio ${bad.status}`);
  const badBody = await bad.json();
  console.log("rejeição OK:", badBody.error);

  const ok = await fetch(`${BASE}/api/admin/gallery/item/${item.id}`, {
    method: "PATCH",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ focalX: 20, focalY: 50 }),
  });
  assert(ok.ok, `patch focal falhou ${await ok.text()}`);
  const saved = await ok.json();
  assert(saved.item.focal_x === 20 && saved.item.focal_y === 50, "focal não persistiu");

  // restaura centro
  await fetch(`${BASE}/api/admin/gallery/item/${item.id}`, {
    method: "PATCH",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ focalX: 50, focalY: 50 }),
  });

  console.log("OK — smoke gallery focal passou.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
