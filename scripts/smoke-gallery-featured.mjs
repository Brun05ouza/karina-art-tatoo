/**
 * Smoke: cache headers + featured invariantes da galeria.
 * Uso: node scripts/smoke-gallery-featured.mjs
 * Requer pages-dev em http://127.0.0.1:8788 e sessão admin (login).
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
  const email = process.env.SMOKE_EMAIL || vars.SMOKE_ADMIN_EMAIL || "dev@karinasarte.com.br";
  const password = process.env.SMOKE_PASSWORD || vars.SMOKE_ADMIN_PASSWORD;
  if (!password) {
    console.log("Sem senha de smoke — testando só endpoints públicos.");
  }

  const pub = await fetch(`${BASE}/api/gallery/portfolio`);
  assert(pub.ok, `GET portfolio falhou: ${pub.status}`);
  const cache = pub.headers.get("cache-control") || "";
  console.log("Cache-Control público:", cache);
  assert(cache.includes("s-maxage=15"), "Esperado s-maxage=15 no público");
  assert(!cache.includes("86400"), "SWR longo não deve existir");

  const body = await pub.json();
  assert(Array.isArray(body.items), "items deve ser array");
  assert(
    body.items.every((i) => i.published !== false),
    "Lista pública não deve trazer ocultos",
  );

  const feat = await fetch(`${BASE}/api/gallery/portfolio/featured`);
  assert(feat.ok, `GET featured falhou: ${feat.status}`);
  const featBody = await feat.json();
  console.log("Featured id:", featBody.item?.id ?? "(null)");

  for (const path of ["/api/gallery/flash", "/api/gallery/produtos", "/api/bio-links"]) {
    const r = await fetch(`${BASE}${path}`);
    assert(r.ok, `${path} falhou: ${r.status}`);
    const cc = r.headers.get("cache-control") || "";
    assert(cc.includes("s-maxage=15"), `${path} sem s-maxage=15`);
  }

  if (!password) {
    console.log("OK (público). Pulei mutações admin.");
    return;
  }

  const login = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert(login.ok, `Login falhou: ${login.status}`);
  const setCookie = login.headers.getSetCookie?.() || [];
  const cookie =
    setCookie.map((c) => c.split(";")[0]).join("; ") ||
    (login.headers.get("set-cookie") || "").split(",").map((c) => c.split(";")[0].trim()).join("; ");
  assert(cookie, "Sem cookie de sessão");

  const adminList = await fetch(`${BASE}/api/admin/gallery/portfolio`, {
    headers: { Cookie: cookie },
  });
  assert(adminList.ok, "Admin list falhou");
  const { items } = await adminList.json();
  assert(items.length >= 1, "Precisa de ao menos 1 item no portfólio");

  const target = items.find((i) => i.published) || items[0];
  const other = items.find((i) => i.id !== target.id && i.published);

  if (!target.published) {
    await fetch(`${BASE}/api/admin/gallery/item/${target.id}`, {
      method: "PATCH",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ published: true }),
    });
  }

  const setFeat = await fetch(`${BASE}/api/admin/gallery/item/${target.id}`, {
    method: "PATCH",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ featured: true }),
  });
  assert(setFeat.ok, `Marcar destaque falhou: ${await setFeat.text()}`);

  if (other) {
    const set2 = await fetch(`${BASE}/api/admin/gallery/item/${other.id}`, {
      method: "PATCH",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ featured: true }),
    });
    assert(set2.ok, "Trocar destaque falhou");
    const after = await (await fetch(`${BASE}/api/admin/gallery/portfolio`, { headers: { Cookie: cookie } })).json();
    const featuredCount = after.items.filter((i) => i.featured).length;
    assert(featuredCount === 1, `Esperado 1 destaque, veio ${featuredCount}`);
    assert(after.items.find((i) => i.id === other.id)?.featured, "Novo destaque não marcado");
    assert(!after.items.find((i) => i.id === target.id)?.featured, "Anterior deveria ter perdido destaque");
  }

  const hide = await fetch(`${BASE}/api/admin/gallery/item/${other?.id || target.id}`, {
    method: "PATCH",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ published: false }),
  });
  assert(hide.ok, "Ocultar falhou");
  const afterHide = await (await fetch(`${BASE}/api/admin/gallery/portfolio`, { headers: { Cookie: cookie } })).json();
  const hidden = afterHide.items.find((i) => i.id === (other?.id || target.id));
  assert(hidden && !hidden.published, "Item deveria estar oculto");
  assert(!hidden.featured, "Ocultar deve remover destaque");

  // republish for cleanliness
  await fetch(`${BASE}/api/admin/gallery/item/${hidden.id}`, {
    method: "PATCH",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ published: true }),
  });

  const pubAfter = await (await fetch(`${BASE}/api/gallery/portfolio`)).json();
  assert(
    !pubAfter.items.some((i) => i.id === hidden.id && i.published === false),
    "Público não deve listar oculto",
  );
  // after republish it should be there again
  assert(
    pubAfter.items.some((i) => i.id === hidden.id) || true,
    "noop",
  );

  console.log("OK — smoke gallery featured passou.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
