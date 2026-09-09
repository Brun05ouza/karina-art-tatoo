/**
 * Smoke tests da API admin (fase 1). Uso:
 *   node scripts/smoke-admin-api.mjs [baseUrl]
 */
const base = process.argv[2] || "http://127.0.0.1:8788";
const origin = base;
const email = "dev@karinasarte.com.br";
const password = process.env.ADMIN_TEMP_PASSWORD;
if (!password) {
  console.error("Defina ADMIN_TEMP_PASSWORD com a senha temporária atual.");
  process.exit(1);
}

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
  const t0 = performance.now();
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const ms = performance.now() - t0;
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
  return { res, json, text, ms };
}

const results = [];
function ok(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

try {
  // wrong password
  const bad = await req("/api/admin/login", {
    method: "POST",
    body: { email, password: "senha-errada-xyz" },
    expectStatus: 401,
  });
  ok("login senha errada = 401 genérico", bad.json?.error === "Email ou senha inválidos.", bad.json?.error);

  // missing email
  const missing = await req("/api/admin/login", {
    method: "POST",
    body: { email: "naoexiste@example.com", password: "senha-errada-xyz" },
    expectStatus: 401,
  });
  ok(
    "email inexistente mesma mensagem",
    missing.json?.error === bad.json?.error,
    `t_bad=${bad.ms.toFixed(0)}ms t_miss=${missing.ms.toFixed(0)}ms`,
  );

  // rate limit por email (IP pode já ter tentativas — limpe login_attempts se flaky)
  const rlEmail = `ratelimit-${Date.now()}@example.com`;
  let hit429 = false;
  for (let i = 0; i < 8; i++) {
    const r = await req("/api/admin/login", {
      method: "POST",
      body: { email: rlEmail, password: "x" },
    });
    if (r.res.status === 429) {
      hit429 = true;
      break;
    }
    if (r.res.status !== 401) {
      throw new Error(`rate-limit setup unexpected ${r.res.status}: ${r.text}`);
    }
  }
  ok("rate limit retorna 429", hit429);

  // O teste de rate limit enche o balde do IP — limpa antes do login real.
  const { readFileSync } = await import("node:fs");
  const { neon } = await import("@neondatabase/serverless");
  const raw = readFileSync(new URL("../frontend/.dev.vars", import.meta.url), "utf8");
  const dbUrl = raw.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
  if (dbUrl) {
    const sql = neon(dbUrl);
    await sql`DELETE FROM login_attempts`;
  }

  // good login
  const cookies = jar();
  const login = await req("/api/admin/login", {
    method: "POST",
    body: { email, password },
    expectStatus: 200,
  });
  cookies.store(login.res);
  ok("login ok", login.json?.ok === true && login.json?.mustChangePassword === true);
  ok("cookie set", Boolean(cookies.header()), cookies.header().slice(0, 40));

  // session
  const session = await req("/api/admin/session", {
    cookieHeader: cookies.header(),
    expectStatus: 200,
  });
  ok("session authenticated", session.json?.authenticated === true);

  // password policy via API
  const weak = await req("/api/admin/password", {
    method: "POST",
    cookieHeader: cookies.header(),
    body: { newPassword: "curta" },
    expectStatus: 400,
  });
  ok("senha curta rejeitada", String(weak.json?.error || "").includes("curta"));

  const obvious = await req("/api/admin/password", {
    method: "POST",
    cookieHeader: cookies.header(),
    body: { newPassword: "senha1234567" },
    expectStatus: 400,
  });
  ok("senha óbvia rejeitada", Boolean(obvious.json?.error));

  // change password (first access — no current)
  const strong = `lua clara sobre pedra ${Date.now()}`;
  const changed = await req("/api/admin/password", {
    method: "POST",
    cookieHeader: cookies.header(),
    body: { newPassword: strong },
    expectStatus: 200,
  });
  cookies.store(changed.res);
  ok("troca de senha ok", changed.json?.ok === true && changed.json?.mustChangePassword === false);

  // session still valid after change
  const session2 = await req("/api/admin/session", {
    cookieHeader: cookies.header(),
    expectStatus: 200,
  });
  ok("sessão válida após troca", session2.json?.authenticated === true && session2.json?.mustChangePassword === false);

  // old cookie (before reissue) should fail — we overwrote jar; simulate with login again in other jar
  // Users list as owner
  const users = await req("/api/admin/users", {
    cookieHeader: cookies.header(),
    expectStatus: 200,
  });
  ok("owner lista users", Array.isArray(users.json?.users));

  // no password_hash leaked
  const leaked = JSON.stringify(users.json).includes("password_hash");
  ok("sem password_hash na lista", !leaked);

  // cannot deactivate self
  const selfId = login.json.user.id;
  const selfOff = await req(`/api/admin/users/${selfId}`, {
    method: "PATCH",
    cookieHeader: cookies.header(),
    body: { active: false },
    expectStatus: 400,
  });
  ok("owner não desativa a si", selfOff.res.status === 400);

  // create editor
  const created = await req("/api/admin/users", {
    method: "POST",
    cookieHeader: cookies.header(),
    body: { email: `editor-${Date.now()}@example.com`, role: "editor" },
    expectStatus: 200,
  });
  ok("cria editor + temp password", Boolean(created.json?.temporaryPassword) && created.json?.user?.role === "editor");

  // logout
  await req("/api/admin/logout", { method: "POST", cookieHeader: cookies.header(), expectStatus: 200 });

  // login as new password
  const cookies2 = jar();
  const relogin = await req("/api/admin/login", {
    method: "POST",
    body: { email, password: strong },
    expectStatus: 200,
  });
  cookies2.store(relogin.res);
  ok("login com senha nova", relogin.json?.ok === true && relogin.json?.mustChangePassword === false);

  console.log("\n---");
  const failed = results.filter((r) => !r.pass);
  console.log(`${results.length - failed.length}/${results.length} passou`);
  if (failed.length) process.exitCode = 1;
} catch (err) {
  console.error(err);
  process.exitCode = 1;
}
