/**
 * Smoke: bio kinds + settings.
 *   node scripts/smoke-bio-kind.mjs [baseUrl]
 * Opcional: ADMIN_TEMP_PASSWORD (senão tenta resetar via scripts/reset-password.mjs)
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const base = process.argv[2] || "http://127.0.0.1:8788";
const origin = base;
const email = "dev@karinasarte.com.br";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function jar() {
  const cookies = new Map();
  return {
    store(res) {
      const raw = res.headers.getSetCookie?.() || [];
      for (const line of raw) {
        const [pair] = line.split(";");
        const eq = pair.indexOf("=");
        if (eq > 0) cookies.set(pair.slice(0, eq), pair.slice(eq + 1));
      }
    },
    header() {
      return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
  };
}

async function req(path, { method = "GET", body, cookieHeader, expectStatus } = {}) {
  const headers = { Origin: origin };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  if (expectStatus != null && res.status !== expectStatus) {
    throw new Error(`${method} ${path} expected ${expectStatus} got ${res.status}: ${text}`);
  }
  return { res, json, text };
}

function ok(name, pass, detail = "") {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!pass) process.exitCode = 1;
}

let password = process.env.ADMIN_TEMP_PASSWORD;
if (!password) {
  const rawVars = readFileSync(join(root, "frontend/.dev.vars"), "utf8");
  const dbUrl = rawVars.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
  const out = spawnSync("node", ["scripts/reset-password.mjs", "--email", email], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, DATABASE_URL: dbUrl },
  });
  const m = (out.stdout || "").match(/Nova senha temporária[\s\S]*?\n\s*(\S+)/);
  if (m) password = m[1].trim();
  else {
    console.error(out.stdout, out.stderr);
    throw new Error("Não foi possível obter senha temporária.");
  }
}

// Public settings
{
  const r = await req("/api/settings", { expectStatus: 200 });
  ok("GET /api/settings", r.json?.whatsappPhone === "5521990724477", r.json?.whatsappPhone);
  ok("Cache-Control settings", (r.res.headers.get("cache-control") || "").includes("s-maxage=300"));
}

// Public bio links — WhatsApp montado
{
  const r = await req("/api/bio-links", { expectStatus: 200 });
  const wa = (r.json?.items || []).find((i) => i.kind === "whatsapp" || i.icon === "whatsapp");
  const internal = (r.json?.items || []).find((i) => i.url === "/portfolio");
  ok(
    "bio WhatsApp URL montada",
    Boolean(wa?.url?.startsWith("https://wa.me/5521990724477") && wa.url.includes("text=")),
    wa?.url?.slice(0, 90),
  );
  ok("bio mensagem com acento no text=", decodeURIComponent(wa?.url?.split("text=")[1] || "").includes("Olá"), decodeURIComponent(wa?.url?.split("text=")[1] || "").slice(0, 60));
  ok("portfolio internal", internal?.kind === "internal" || internal?.url === "/portfolio", internal?.kind);
}

const cookies = jar();
{
  const raw = readFileSync(join(root, "frontend/.dev.vars"), "utf8");
  const { neon } = await import("@neondatabase/serverless");
  const dbUrl = raw.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
  if (dbUrl) {
    const sql = neon(dbUrl);
    await sql`DELETE FROM login_attempts`;
  }
  const login = await req("/api/admin/login", {
    method: "POST",
    body: { email, password },
    expectStatus: 200,
  });
  cookies.store(login.res);
  ok("login admin", login.json?.ok === true);
}

const cookieHeader = cookies.header();

// Reject javascript:
{
  const r = await req("/api/admin/bio-links", {
    method: "POST",
    cookieHeader,
    body: {
      label: "XSS",
      kind: "external",
      url: "javascript:alert(1)",
      icon: "link",
      featured: false,
      published: false,
    },
    expectStatus: 400,
  });
  ok("external rejeita javascript:", /http|https|inválid/i.test(r.json?.error || ""), r.json?.error);
}

// Reject protocol-relative
{
  const r = await req("/api/admin/bio-links", {
    method: "POST",
    cookieHeader,
    body: {
      label: "Evil",
      kind: "internal",
      url: "//evil.com",
      icon: "link",
      featured: false,
      published: false,
    },
    expectStatus: 400,
  });
  ok("internal rejeita //evil.com", /protocol-relative|inválid|começa/i.test(r.json?.error || ""), r.json?.error);
}

// Create WhatsApp with emoji
{
  const r = await req("/api/admin/bio-links", {
    method: "POST",
    cookieHeader,
    body: {
      label: "Teste emoji",
      kind: "whatsapp",
      message: "Olá! 🌿",
      featured: false,
      published: false,
    },
    expectStatus: 201,
  });
  ok("cria whatsapp só com mensagem", r.json?.item?.kind === "whatsapp" && r.json?.item?.url === "", r.json?.item?.message);

  const id = r.json?.item?.id;
  const pub = await req("/api/bio-links", { expectStatus: 200 });
  // unpublished — not in public list; resolve via admin then simulate
  const built = `https://wa.me/5521990724477?text=${encodeURIComponent("Olá! 🌿")}`;
  ok("encode emoji", encodeURIComponent("Olá! 🌿").includes("%F0%9F%8C%BF"));

  if (id) {
    // temporarily publish to verify public URL
    await req(`/api/admin/bio-links/${id}`, {
      method: "PATCH",
      cookieHeader,
      body: { published: true },
      expectStatus: 200,
    });
    const pub2 = await req("/api/bio-links", { expectStatus: 200 });
    const found = (pub2.json?.items || []).find((i) => i.id === id);
    ok("GET público monta emoji", found?.url === built, found?.url);
    await req(`/api/admin/bio-links/${id}`, {
      method: "DELETE",
      cookieHeader,
      expectStatus: 200,
    });
  }
  void pub;
}

// Phone update
{
  const r = await req("/api/admin/settings", {
    method: "PATCH",
    cookieHeader,
    body: { whatsappPhone: "(21) 99072-4477" },
    expectStatus: 400,
  });
  ok("telefone sem DDI rejeitado", /DDI|55/i.test(r.json?.error || ""), r.json?.error);

  const okPhone = await req("/api/admin/settings", {
    method: "PATCH",
    cookieHeader,
    body: { whatsappPhone: "55 21 99072-4477" },
    expectStatus: 200,
  });
  ok("telefone normalizado", okPhone.json?.whatsappPhone === "5521990724477", okPhone.json?.whatsappPhone);
}

console.log(process.exitCode ? "\nFalhas no smoke." : "\nSmoke bio OK.");
