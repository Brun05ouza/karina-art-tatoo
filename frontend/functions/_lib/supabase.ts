/** Acesso ao Supabase Storage via REST — sem @supabase/supabase-js. */

import { requireEnv, type Env } from "./config";

function storageBase(env: Env): string {
  const url = requireEnv(env, "SUPABASE_URL").replace(/\/+$/, "");
  return `${url}/storage/v1`;
}

function authHeaders(env: Env): HeadersInit {
  const key = requireEnv(env, "SUPABASE_SERVICE_ROLE_KEY");
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
  };
}

export function getBucket(env: Env): string {
  return requireEnv(env, "SUPABASE_BUCKET");
}

/** URL pública de um objeto (bucket deve ser público para leitura). */
export function publicObjectUrl(env: Env, objectKey: string): string {
  const bucket = getBucket(env);
  const encoded = objectKey
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${storageBase(env)}/object/public/${bucket}/${encoded}`;
}

export type SignedUpload = {
  signedUrl: string;
  token: string;
  path: string;
  publicUrl: string;
};

/**
 * Cria URL assinada de upload (válida ~2h).
 * O cliente faz PUT/POST direto nessa URL — o arquivo não passa pela Function.
 */
export async function createSignedUploadUrl(
  env: Env,
  objectKey: string,
): Promise<SignedUpload> {
  const bucket = getBucket(env);
  const encodedKey = objectKey
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");

  const res = await fetch(`${storageBase(env)}/object/upload/sign/${bucket}/${encodedKey}`, {
    method: "POST",
    headers: {
      ...authHeaders(env),
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[supabase] createSignedUploadUrl", res.status, text);
    throw new Error("Não foi possível gerar URL de upload.");
  }

  const data = (await res.json()) as { url?: string; token?: string };
  if (!data.url) {
    throw new Error("Resposta de upload assinada inválida.");
  }

  const signedUrl = data.url.startsWith("http")
    ? data.url
    : `${storageBase(env)}${data.url.startsWith("/") ? "" : "/"}${data.url}`;

  const token =
    data.token ||
    (() => {
      try {
        return new URL(signedUrl).searchParams.get("token") || "";
      } catch {
        return "";
      }
    })();

  if (!token) {
    throw new Error("Token de upload ausente.");
  }

  return {
    signedUrl,
    token,
    path: objectKey,
    publicUrl: publicObjectUrl(env, objectKey),
  };
}

/** Remove objeto do bucket. Falhas são reportadas sem lançar (caller decide). */
export async function removeObject(
  env: Env,
  objectKey: string,
): Promise<{ ok: boolean; status: number; detail?: string }> {
  const bucket = getBucket(env);
  const res = await fetch(`${storageBase(env)}/object/${bucket}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(env),
      "Content-Type": "application/json",
    },
    body: JSON.stringify([objectKey]),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("[supabase] removeObject", objectKey, res.status, detail);
    return { ok: false, status: res.status, detail };
  }
  return { ok: true, status: res.status };
}
