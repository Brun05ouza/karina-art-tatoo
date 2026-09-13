/**
 * Sobe o stack local completo com um comando:
 *   1) garante `frontend/dist` (build só se faltar)
 *   2) Pages Functions (wrangler) em 127.0.0.1:8788
 *   3) Vite (HMR) em http://localhost:5174 com proxy /api → 8788
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createConnection } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const frontend = join(root, "frontend");
const API_HOST = "127.0.0.1";
const API_PORT = 8788;
const children = [];
let shuttingDown = false;

function log(msg) {
  console.log(`\n[dev] ${msg}`);
}

function spawnInherit(command, args, { cwd = root, shell = false, label } = {}) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell,
    env: process.env,
    // No Windows, grupo separado facilita encerrar a árvore no Ctrl+C
    detached: process.platform !== "win32",
  });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `code ${code ?? 1}`;
    log(`${label ?? command} encerrou (${reason}). Fechando o restante…`);
    shutdown(code && code !== 0 ? code : 1);
  });
  return child;
}

function killTree(pid) {
  if (!pid) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(pid), "/T", "/F"], {
      stdio: "ignore",
      shell: true,
    });
    return;
  }
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    killTree(child.pid);
  }
  // workerd às vezes sobra solto no Windows
  if (process.platform === "win32") {
    spawn("powershell", [
      "-NoProfile",
      "-Command",
      `Get-Process workerd -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue`,
    ], { stdio: "ignore", shell: true });
  }
  setTimeout(() => process.exit(code), 400).unref();
}

function portOpen(port, host = API_HOST) {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForPort(port, { host = API_HOST, timeoutMs = 120_000, label } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await portOpen(port, host)) return;
    await delay(350);
  }
  throw new Error(`Timeout esperando ${label ?? `${host}:${port}`}`);
}

async function freePort(port) {
  if (!(await portOpen(port))) return;
  log(`Porta ${port} ocupada — liberando…`);
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const ps = spawn(
        "powershell",
        [
          "-NoProfile",
          "-Command",
          `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`,
        ],
        { stdio: "ignore", shell: true },
      );
      ps.on("exit", () => resolve());
    });
  } else {
    await new Promise((resolve) => {
      const sh = spawn(
        "sh",
        ["-c", `lsof -ti tcp:${port} | xargs -r kill -9`],
        { stdio: "ignore" },
      );
      sh.on("exit", () => resolve());
    });
  }
  await delay(500);
}

async function ensureDist() {
  if (existsSync(join(frontend, "dist", "index.html"))) return;
  log("Build inicial (frontend/dist ausente)…");
  await new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", "build", "--workspace", "frontend"], {
      cwd: root,
      stdio: "inherit",
      shell: true,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Build falhou (code ${code})`));
    });
  });
}

async function main() {
  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));

  await ensureDist();
  await freePort(API_PORT);
  await freePort(5174);

  log("Subindo API (wrangler pages dev) em 127.0.0.1:8788…");
  // process.execPath + shell:false evita quebrar em pastas com espaço (ex.: Bruno Souza)
  spawnInherit(process.execPath, [join(root, "scripts", "pages-dev.mjs")], {
    label: "API",
  });

  await waitForPort(API_PORT, { label: "API em 8788" });
  log("API pronta.");

  log("Subindo Vite em http://localhost:5174 …");
  spawnInherit(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "dev", "--workspace", "frontend"],
    { shell: true, label: "Vite" },
  );

  log("Stack local: abra http://localhost:5174 (admin + site; /api via proxy).");
  log("Ctrl+C encerra Vite e a API.");
}

main().catch((err) => {
  console.error(`\n[dev] ${err.message || err}`);
  shutdown(1);
});
