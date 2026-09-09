/**
 * Fonte única do custo PBKDF2 (Functions + scripts CLI).
 * 5_000 ≈ 3,8ms no bench do usuário — margem sob o limite de 10ms da edge gratuita.
 * Hashes antigos guardam o próprio N em `pbkdf2:<N>:…` e continuam verificáveis.
 */
export const DEFAULT_PBKDF2_ITERATIONS = 5_000;
export const PBKDF2_KEYLEN = 32;
