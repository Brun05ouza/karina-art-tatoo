/** Espelho leve da política do servidor — só para feedback imediato. */

export type HintResult = { ok: true } | { ok: false; message: string };

const SUBSTRING_BANNED = ["senha", "password", "admin123", "qwerty", "karinasarte"];
const SITE_TOKENS = ["karinasarte", "karina-sarte", "kahsarte", "kah-sarte"];

export function checkPasswordHints(
  password: string,
  opts?: { email?: string },
): HintResult {
  if (!password) return { ok: false, message: "Digite uma senha." };
  if (password.length < 12) {
    return {
      ok: false,
      message: "Essa senha é curta demais — use pelo menos 12 caracteres.",
    };
  }

  const compact = password.toLowerCase().replace(/\s+/g, "");
  for (const word of SUBSTRING_BANNED) {
    if (compact.includes(word)) {
      return { ok: false, message: "Essa senha é muito óbvia — escolha outra frase." };
    }
  }
  for (const token of SITE_TOKENS) {
    if (compact.includes(token)) {
      return { ok: false, message: "Não use o nome do site na senha." };
    }
  }

  const email = opts?.email?.toLowerCase().trim();
  if (email) {
    const local = email.split("@")[0] ?? "";
    if (local.length >= 3 && compact.includes(local)) {
      return { ok: false, message: "Não use o seu email (ou parte dele) na senha." };
    }
  }

  return { ok: true };
}

export const PASSWORD_TIPS = [
  "Pelo menos 12 caracteres",
  "Uma frase de 4–5 palavras funciona melhor que símbolos complicados",
  "Evite 'senha', 'admin' ou o nome do site",
] as const;

export const PASSWORD_EXAMPLE = "lua clara sobre pedra fria";
