/**
 * Limpa processos órfãos do stack local e libera as portas fixas.
 *
 *   npm run dev:clean
 *   npm run dev:clean -- --build
 *
 * Portas: 5174 (Vite), 8788 (wrangler pages), 4173 (vite preview).
 */
import { spawn, spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORTS = [5174, 8788, 4173];
const wantBuild = process.argv.includes("--build");
const PROTECTED = new Set(
  [process.pid, process.ppid].filter((n) => Number.isFinite(n) && n > 0),
);

/** Linhas de comando típicas do stack do projeto (não mata o próprio clean). */
const KILL_CMD_RE =
  /vite|wrangler|workerd|pages-dev\.mjs|dev\.mjs|esbuild|preview/i;
const KEEP_CMD_RE = /dev-clean\.mjs/i;

function log(msg) {
  console.log(`[dev-clean] ${msg}`);
}

function portOpen(port, host = "127.0.0.1") {
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

function listNodeDetailed() {
  if (process.platform === "win32") {
    const ps = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | ForEach-Object { "$($_.ProcessId)\t$($_.CreationDate)\t$($_.CommandLine)" }`,
      ],
      { encoding: "utf8" },
    );
    return (ps.stdout || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [id, created, ...cmdParts] = line.split("\t");
        return {
          id: Number(id),
          startTime: created || "?",
          cmd: cmdParts.join("\t") || "",
        };
      })
      .filter((p) => Number.isFinite(p.id) && p.id > 0);
  }

  const ps = spawnSync("ps", ["-eo", "pid,lstart,args"], { encoding: "utf8" });
  return (ps.stdout || "")
    .split(/\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => /\bnode\b/.test(line))
    .map((line) => {
      const m = line.match(/^(\d+)\s+(.+?)\s+(node.+)$/);
      if (!m) return null;
      return { id: Number(m[1]), startTime: m[2].trim(), cmd: m[3] };
    })
    .filter(Boolean);
}

function listPortOwners() {
  if (process.platform === "win32") {
    const ports = PORTS.join(",");
    const ps = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Get-NetTCPConnection -LocalPort ${ports} -State Listen -ErrorAction SilentlyContinue | Select-Object LocalPort, OwningProcess | ForEach-Object { "$($_.LocalPort)\t$($_.OwningProcess)" }`,
      ],
      { encoding: "utf8" },
    );
    return (ps.stdout || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [port, pid] = line.split("\t");
        return { port: Number(port), pid: Number(pid) };
      })
      .filter((row) => row.port > 0 && row.pid > 0);
  }

  const rows = [];
  for (const port of PORTS) {
    const out = spawnSync("lsof", ["-ti", `tcp:${port}`, `-sTCP:LISTEN`], {
      encoding: "utf8",
    });
    for (const pid of (out.stdout || "")
      .split(/\n/)
      .map((s) => Number(s.trim()))
      .filter((n) => n > 0)) {
      rows.push({ port, pid });
    }
  }
  return rows;
}

function listWorkerdPids() {
  if (process.platform === "win32") {
    const ps = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Get-Process workerd -ErrorAction SilentlyContinue | ForEach-Object { $_.Id }`,
      ],
      { encoding: "utf8" },
    );
    return (ps.stdout || "")
      .split(/\r?\n/)
      .map((s) => Number(s.trim()))
      .filter((n) => n > 0);
  }
  const out = spawnSync("pgrep", ["-f", "workerd"], { encoding: "utf8" });
  return (out.stdout || "")
    .split(/\n/)
    .map((s) => Number(s.trim()))
    .filter((n) => n > 0);
}

/** Mata o PID sem /T — evita derrubar a árvore do npm que lançou o clean. */
function killPid(pid) {
  if (!pid || pid <= 0 || PROTECTED.has(pid)) return "skip";
  if (process.platform === "win32") {
    const r = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue`,
      ],
      { encoding: "utf8" },
    );
    return r.status === 0 ? "ok" : "fail";
  }
  try {
    process.kill(pid, "SIGKILL");
    return "ok";
  } catch {
    return "fail";
  }
}

async function confirmPortsFree() {
  const busy = [];
  for (const port of PORTS) {
    if (await portOpen(port)) busy.push(port);
  }
  return busy;
}

async function runBuild() {
  log("Rodando npm run build…");
  await new Promise((resolve, reject) => {
    const child = spawn(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["run", "build"],
      { cwd: root, stdio: "inherit", shell: true },
    );
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Build falhou (code ${code})`));
    });
  });
}

async function main() {
  log(`Protegidos: ${[...PROTECTED].join(", ")}`);

  const nodes = listNodeDetailed();
  log("Processos node ativos:");
  if (!nodes.length) log("  (nenhum)");
  else {
    for (const n of nodes) {
      const short = (n.cmd || "").slice(0, 120);
      log(`  pid=${n.id}  ${short}`);
    }
  }

  const owners = listPortOwners();
  log("Portas do projeto (LISTEN):");
  if (!owners.length) log("  (nenhuma ocupada entre 5174 / 8788 / 4173)");
  else for (const row of owners) log(`  :${row.port} → pid ${row.pid}`);

  const targets = new Map(); // pid -> reason

  for (const row of owners) {
    targets.set(row.pid, `porta ${row.port}`);
  }
  for (const pid of listWorkerdPids()) {
    targets.set(pid, "workerd");
  }
  for (const n of nodes) {
    if (PROTECTED.has(n.id)) continue;
    if (KEEP_CMD_RE.test(n.cmd)) continue;
    if (KILL_CMD_RE.test(n.cmd)) {
      if (!targets.has(n.id)) targets.set(n.id, "stack (cmdline)");
    }
  }

  if (!targets.size) {
    log("Nada para encerrar.");
  } else {
    log(`Encerrando ${targets.size} processo(s)…`);
    for (const [pid, reason] of targets) {
      const result = killPid(pid);
      log(`  pid=${pid} (${reason}) → ${result}`);
    }
  }

  await delay(700);

  for (const row of listPortOwners()) {
    log(`  re-kill :${row.port} pid=${row.pid}`);
    killPid(row.pid);
  }
  await delay(400);

  const stillBusy = await confirmPortsFree();
  if (stillBusy.length) {
    log(`FALHA: portas ainda ocupadas: ${stillBusy.join(", ")}`);
    process.exit(1);
  }

  log("Portas livres: 5174, 8788, 4173.");

  if (wantBuild) {
    await runBuild();
    log("Build concluída.");
  }

  log("Pronto. Suba um único servidor (ex.: npm run dev) na porta fixa http://localhost:5174");
}

main().catch((err) => {
  console.error(`[dev-clean] ${err.message || err}`);
  process.exit(1);
});
