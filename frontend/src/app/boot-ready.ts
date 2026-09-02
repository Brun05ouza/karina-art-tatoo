import { useEffect, useState } from "react";
import { preloadImages } from "./content-loader";

/**
 * Assets locais relevantes ao primeiro paint de cada rota.
 * Conteúdo é estático (sem CMS) — não há fetch para aguardar.
 */
const ROUTE_ASSETS: Record<string, string[]> = {
  "/": [
    "/assets/brand/star-karina-filled.webp",
    "/assets/brand/star-karina-outline.webp",
  ],
  "/bio": [
    "/assets/karina-sarte.png",
    "/assets/studio/studio-5.jpeg",
    "/assets/brand/star-karina-filled.webp",
    "/assets/brand/star-karina-outline.webp",
  ],
};

const DEFAULT_ASSETS = ["/assets/brand/star-karina-filled.webp"];

/** Timeout curto: só imagens locais pequenas; não bloquear no GIF do preloader. */
const PRELOAD_TIMEOUT_MS = 1200;

async function prepareRoute(pathname: string): Promise<void> {
  const key = pathname === "" ? "/" : pathname;
  const assets = ROUTE_ASSETS[key] ?? DEFAULT_ASSETS;
  await preloadImages(assets, PRELOAD_TIMEOUT_MS);
}

/**
 * Sinaliza quando assets locais prioritários foram pré-carregados (ou timeout).
 * O preloader ainda faz fade-out próprio (~700 ms) antes de revelar o site.
 */
export function useBootReady(pathname: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);

    void prepareRoute(pathname).finally(() => {
      if (active) setReady(true);
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  return ready;
}
