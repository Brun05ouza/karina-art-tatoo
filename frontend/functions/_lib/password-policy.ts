/** Política de senha forte — validação no servidor. */

const EXACT_BANNED = [
  "senha",
  "senha123",
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password123",
  "admin",
  "admin123",
  "qwerty",
  "karina",
  "karinasarte",
  "karina sarte",
  "tatuagem",
  "tattoo",
];

/** Tokens que não podem aparecer como substring (óbvios demais). */
const SUBSTRING_BANNED = [
  "senha",
  "password",
  "admin123",
  "qwerty",
  "karinasarte",
];

const SITE_TOKENS = ["karinasarte", "karina-sarte", "kahsarte", "kah-sarte"];

export type PasswordPolicyResult =
  | { ok: true }
  | { ok: false; message: string };

export function validatePassword(
  password: string,
  opts?: { email?: string },
): PasswordPolicyResult {
  if (typeof password !== "string" || password.length === 0) {
    return { ok: false, message: "Digite uma senha." };
  }
  if (password.length < 12) {
    return {
      ok: false,
      message: "Essa senha é curta demais — use pelo menos 12 caracteres.",
    };
  }
  if (password.length > 200) {
    return { ok: false, message: "Essa senha é longa demais." };
  }

  const lower = password.toLowerCase().trim();
  const compact = lower.replace(/\s+/g, "");

  for (const word of EXACT_BANNED) {
    if (compact === word.replace(/\s+/g, "") || lower === word) {
      return {
        ok: false,
        message: "Essa senha é muito óbvia — escolha outra frase.",
      };
    }
  }

  for (const word of SUBSTRING_BANNED) {
    if (compact.includes(word)) {
      return {
        ok: false,
        message: "Essa senha é muito óbvia — escolha outra frase.",
      };
    }
  }

  for (const token of SITE_TOKENS) {
    if (compact.includes(token)) {
      return {
        ok: false,
        message: "Não use o nome do site na senha.",
      };
    }
  }

  const email = opts?.email?.toLowerCase().trim();
  if (email) {
    const local = email.split("@")[0] ?? "";
    if (local.length >= 3 && compact.includes(local)) {
      return {
        ok: false,
        message: "Não use o seu email (ou parte dele) na senha.",
      };
    }
    if (compact.includes(email.replace(/[@.]/g, ""))) {
      return {
        ok: false,
        message: "Não use o seu email na senha.",
      };
    }
  }

  // Sequências triviais
  if (/^(.)\1+$/.test(compact) || /^(0123456789|9876543210)+$/.test(compact)) {
    return {
      ok: false,
      message: "Essa senha é muito previsível — tente uma frase de 4–5 palavras.",
    };
  }

  return { ok: true };
}
