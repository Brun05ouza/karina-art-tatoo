/**
 * Gera o valor de ADMIN_PASSWORD_HASH para o backend/.env.
 *
 * Uso:
 *   npm run admin:hash --workspace backend
 *   npm run admin:hash --workspace backend -- --all   (sugere também os segredos)
 *
 * A senha nunca é aceita por argumento de linha de comando (ficaria no
 * histórico do shell) nem ecoada no terminal.
 */
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { hashPassword } from "../password.js";

const MIN_LENGTH = 12;
const RECOMMENDED_LENGTH = 16;

function hasPasswordArgument(): boolean {
  return process.argv.slice(2).some((arg) => arg !== "--all");
}

/** Pergunta sem ecoar o que é digitado. */
function askHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let muted = false;

    const output = new Writable({
      write(chunk, _encoding, callback) {
        if (!muted) process.stdout.write(chunk as Buffer);
        callback();
      },
    });

    const rl = createInterface({ input: process.stdin, output, terminal: true });
    rl.on("error", reject);

    rl.question(question, (answer) => {
      muted = false;
      process.stdout.write("\n");
      rl.close();
      resolve(answer);
    });

    // Depois de escrever o prompt, silencia o eco do que for digitado.
    muted = true;
  });
}

/** Permite `npm run admin:hash < senha.txt` em pipelines. */
async function readFromStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk as Buffer));
  }
  return Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
}

function secret(): string {
  return randomBytes(32).toString("hex");
}

async function main() {
  if (hasPasswordArgument()) {
    console.error(
      "Erro: não passe a senha por argumento (ela fica no histórico do shell).\n" +
        'Execute "npm run admin:hash --workspace backend" e digite quando solicitado.',
    );
    process.exit(1);
  }

  let password: string;

  if (process.stdin.isTTY) {
    console.log("Gerador de ADMIN_PASSWORD_HASH — a senha não será exibida.\n");
    password = await askHidden("Senha do administrador: ");
    const confirmation = await askHidden("Confirme a senha: ");

    if (password !== confirmation) {
      console.error("\nErro: as senhas não coincidem.");
      process.exit(1);
    }
  } else {
    password = await readFromStdin();
    console.error("Aviso: senha lida da entrada padrão (modo não interativo).");
  }

  if (password.length < MIN_LENGTH) {
    console.error(`\nErro: use pelo menos ${MIN_LENGTH} caracteres.`);
    process.exit(1);
  }
  if (password.length < RECOMMENDED_LENGTH) {
    console.error(`Aviso: recomendamos ${RECOMMENDED_LENGTH} caracteres ou mais.`);
  }

  const hash = await hashPassword(password);
  password = "";

  console.log("\nCopie a linha abaixo para backend/.env:\n");
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);

  if (process.argv.includes("--all")) {
    console.log(`ADMIN_SESSION_SECRET=${secret()}`);
    console.log(`ADMIN_API_TOKEN=${secret()}`);
  }

  console.log(
    "\nLembre-se: este valor vai apenas em backend/.env (nunca em frontend/.env,\n" +
      "nunca com prefixo VITE_ e nunca comitado no git).",
  );
}

main().catch((error) => {
  console.error("Falha ao gerar o hash:", error instanceof Error ? error.message : error);
  process.exit(1);
});
