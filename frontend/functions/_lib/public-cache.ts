/**
 * Cache de APIs públicas (galeria, bio, settings).
 *
 * Antes: s-maxage=300 + stale-while-revalidate=86400 sem purge —
 * ocultar no painel podia deixar o item visível por minutos (ou horas via SWR).
 *
 * Agora: TTL curto na borda + invalidação ao salvar (Cache API e, se
 * configurado, purge Cloudflare por URL).
 */
import type { Env } from "./config";

/** Navegador sempre revalida; borda ~15s; SWR curto só para picos. */
export const PUBLIC_API_CACHE =
  "public, max-age=0, s-maxage=15, stale-while-revalidate=30";

/**
 * /api/settings liga ou desliga o site inteiro.
 * s-maxage + stale-while-revalidate serviriam o flag antigo depois do "desligar"
 * e o lançamento pareceria quebrado. Uma leitura por visita é barata; cache de borda, não.
 */
export const SETTINGS_API_CACHE = "no-store";

export type CacheEnv = Env & {
  CF_ZONE_ID?: string;
  CF_API_TOKEN?: string;
  PUBLIC_SITE_ORIGIN?: string;
};

function absoluteUrls(request: Request, env: CacheEnv, paths: string[]): string[] {
  const configured = env.PUBLIC_SITE_ORIGIN?.trim().replace(/\/$/, "");
  const origin = configured || new URL(request.url).origin;
  return paths.map((path) => new URL(path, `${origin}/`).toString());
}

/** Remove entradas da Cache API do Worker (quando a resposta foi put ali). */
async function purgeCacheApi(urls: string[]): Promise<void> {
  try {
    await Promise.all(
      urls.map((url) => caches.default.delete(new Request(url, { method: "GET" }))),
    );
  } catch (err) {
    console.error("[public-cache] Cache API purge falhou", err);
  }
}

/**
 * Purge na CDN Cloudflare (opcional).
 * Defina CF_ZONE_ID + CF_API_TOKEN (+ PUBLIC_SITE_ORIGIN em preview/local).
 */
async function purgeCloudflare(env: CacheEnv, urls: string[]): Promise<void> {
  const zone = env.CF_ZONE_ID?.trim();
  const token = env.CF_API_TOKEN?.trim();
  if (!zone || !token || urls.length === 0) return;

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: urls }),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[public-cache] CF purge HTTP", res.status, text.slice(0, 200));
    }
  } catch (err) {
    console.error("[public-cache] CF purge falhou", err);
  }
}

/** Invalida caminhos públicos após mutação no admin. Nunca bloqueia a resposta. */
export async function invalidatePublicPaths(
  request: Request,
  env: CacheEnv,
  paths: string[],
): Promise<void> {
  const urls = absoluteUrls(request, env, paths);
  await Promise.all([purgeCacheApi(urls), purgeCloudflare(env, urls)]);
}

export function galleryPublicPaths(collection: string): string[] {
  return [`/api/gallery/${collection}`, `/api/gallery/${collection}/featured`];
}

/** @deprecated use galleryPublicPaths */
export function galleryPublicPath(collection: string): string {
  return `/api/gallery/${collection}`;
}

export const BIO_LINKS_PUBLIC_PATH = "/api/bio-links";
export const BIO_PROFILE_PUBLIC_PATH = "/api/bio-profile";
export const SETTINGS_PUBLIC_PATH = "/api/settings";
