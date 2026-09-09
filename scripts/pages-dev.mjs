/**
 * Sobe `wrangler pages dev` passando todos os pares de .dev.vars via `-b`,
 * porque em alguns setups do Pages as vars novas do .dev.vars aparecem no
 * banner mas não chegam em `context.env`.
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const frontend = join(dirname(fileURLToPath(import.meta.url)), "..", "frontend");
const raw = readFileSync(join(frontend, ".dev.vars"), "utf8");
const bindings = [];
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i <= 0) continue;
  const key = line.slice(0, i).trim();
  const value = line.slice(i + 1);
  if (!key) continue;
  bindings.push("-b", `${key}=${value}`);
}

const args = [
  "wrangler",
  "pages",
  "dev",
  "dist",
  "--ip",
  "127.0.0.1",
  "--port",
  "8788",
  ...bindings,
  ...process.argv.slice(2),
];

const child = spawn("npx", args, { cwd: frontend, stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 1));
