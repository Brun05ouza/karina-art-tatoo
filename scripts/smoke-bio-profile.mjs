/**
 * Smoke: bio profile público + auth nas rotas admin.
 *   node scripts/smoke-bio-profile.mjs [baseUrl]
 *
 * Sem cookie: GET público 200; PATCH/POST admin esperam 401.
 * Com ADMIN_TEMP_PASSWORD (ou reset via .dev.vars): valida limites de PATCH.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
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

// —— Público ——
{
  const r = await req("/api/bio-profile", { expectStatus: 200 });
  const hasProfile = r.json?.profile && typeof r.json.profile.subtitle === "string";
  const hasChips = Array.isArray(r.json?.chips);
  const hasTestimonials = Array.isArray(r.json?.testimonials);
  ok("GET /api/bio-profile", hasProfile && hasChips && hasTestimonials, r.json?.profile?.subtitle);
}

// —— Admin sem auth → 401 ——
{
  const r = await req("/api/admin/bio-profile", {
    method: "PATCH",
    body: { subtitle: "x".repeat(81) },
    expectStatus: 401,
  });
  ok("PATCH /api/admin/bio-profile sem cookie → 401", r.res.status === 401);
}

{
  const r = await req("/api/admin/bio-chips", {
    method: "POST",
    body: { label: "teste" },
    expectStatus: 401,
  });
  ok("POST /api/admin/bio-chips sem cookie → 401", r.res.status === 401);
}

// —— Opcional: login + validação de limites ——
let password = process.env.ADMIN_TEMP_PASSWORD;
const varsPath = join(root, "frontend/.dev.vars");
if (!password && existsSync(varsPath)) {
  try {
    const rawVars = readFileSync(varsPath, "utf8");
    const dbUrl = rawVars.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
    if (dbUrl) {
      const out = spawnSync("node", ["scripts/reset-password.mjs", "--email", email], {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, DATABASE_URL: dbUrl },
      });
      const m = (out.stdout || "").match(/Nova senha temporária[\s\S]*?\n\s*(\S+)/);
      if (m) password = m[1].trim();
    }
  } catch {
    /* skip auth tests */
  }
}

if (!password) {
  console.log("SKIP  testes autenticados (sem ADMIN_TEMP_PASSWORD / .dev.vars)");
} else {
  const cookies = jar();
  const login = await req("/api/admin/login", {
    method: "POST",
    body: { email, password },
    expectStatus: 200,
  });
  cookies.store(login.res);
  const cookieHeader = cookies.header();
  ok("login admin", Boolean(cookieHeader));

  {
    const r = await req("/api/admin/bio-profile", {
      method: "PATCH",
      body: { subtitle: "x".repeat(81) },
      cookieHeader,
      expectStatus: 400,
    });
    ok(
      "PATCH subtitle >80 → 400",
      typeof r.json?.error === "string" && /80/.test(r.json.error),
      r.json?.error,
    );
  }

  {
    const r = await req("/api/admin/bio-chips", {
      method: "POST",
      body: { label: "y".repeat(31) },
      cookieHeader,
      expectStatus: 400,
    });
    ok(
      "POST chip label >30 → 400",
      typeof r.json?.error === "string" && /30/.test(r.json.error),
      r.json?.error,
    );
  }

  {
    const get = await req("/api/admin/bio-profile", { cookieHeader, expectStatus: 200 });
    ok(
      "GET /api/admin/bio-profile",
      get.json?.profile && Array.isArray(get.json.chips) && Array.isArray(get.json.testimonials),
    );
  }
}

console.log(process.exitCode ? "\nsmoke-bio-profile: FAIL" : "\nsmoke-bio-profile: OK");
