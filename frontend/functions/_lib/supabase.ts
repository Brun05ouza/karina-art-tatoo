/**
 * Supabase Storage via REST, sem @supabase/supabase-js.
 *
 * O SDK funciona em Workers, mas são só quatro chamadas HTTP e o pacote
 * inteiro (auth, realtime, postgrest) entraria no bundle das Functions à toa.
 * Menos código no bundle = deploy mais rápido e menos superfície para quebrar.
 */
import type { SupabaseConfig } from "./config";

function storageUrl(config: SupabaseConfig, path: string): string {
  return `${config.url}/storage/v1${path}`;
}

function authHeaders(config: SupabaseConfig): HeadersInit {
  return {
    authorization: `Bearer ${config.serviceRoleKey}`,
    apikey: config.serviceRoleKey,
  };
}

/** URL pública do objeto — mesmo formato que o SDK montava. */
export function getPublicUrl(config: SupabaseConfig, objectKey: string): string {
  const encoded = objectKey.split("/").map(encodeURIComponent).join("/");
  return storageUrl(config, `/object/public/${config.bucket}/${encoded}`);
}

/**
 * Gera URL assinada de upload. O navegador faz PUT direto nela — o arquivo
 * nunca passa pela Function, o que mantém o upload fora de qualquer limite
 * de CPU ou de tamanho de body.
 */
export async function createSignedUploadUrl(
  config: SupabaseConfig,
  objectKey: string,
): Promise<string | null> {
  const encoded = objectKey.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(storageUrl(config, `/object/upload/sign/${config.bucket}/${encoded}`), {
    method: "POST",
    headers: { ...authHeaders(config), "content-type": "application/json" },
    body: "{}",
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { url?: string };
  if (!data.url) return null;

  // A API devolve caminho relativo já com o token: /object/upload/sign/...?token=...
  return storageUrl(config, data.url.startsWith("/") ? data.url : `/${data.url}`);
}

/** Verifica se o objeto realmente existe no bucket antes de catalogá-lo. */
export async function objectExists(config: SupabaseConfig, objectKey: string): Promise<boolean> {
  const lastSlash = objectKey.lastIndexOf("/");
  const prefix = lastSlash >= 0 ? objectKey.slice(0, lastSlash) : "";
  const filename = lastSlash >= 0 ? objectKey.slice(lastSlash + 1) : objectKey;

  const response = await fetch(storageUrl(config, `/object/list/${config.bucket}`), {
    method: "POST",
    headers: { ...authHeaders(config), "content-type": "application/json" },
    body: JSON.stringify({ prefix, search: filename, limit: 100, offset: 0 }),
  });

  if (!response.ok) return false;

  const entries = (await response.json()) as Array<{ name?: string }>;
  return Array.isArray(entries) && entries.some((entry) => entry.name === filename);
}

export async function removeObjects(config: SupabaseConfig, objectKeys: string[]): Promise<void> {
  if (objectKeys.length === 0) return;

  const response = await fetch(storageUrl(config, `/object/${config.bucket}`), {
    method: "DELETE",
    headers: { ...authHeaders(config), "content-type": "application/json" },
    body: JSON.stringify({ prefixes: objectKeys }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao remover objetos do bucket (${response.status}).`);
  }
}
