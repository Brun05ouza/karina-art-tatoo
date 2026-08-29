import { useEffect, useState } from "react";
import { loadFlashItems, loadFlashPageContent } from "./flash-content";
import { loadHomeContent } from "./home-content";
import { loadLinkBioContent } from "./link-bio-content";
import { preloadImage, preloadImages } from "./content-loader";

const MIN_BOOT_MS = 900;
const MAX_BOOT_MS = 7000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        window.clearTimeout(timer);
        resolve(fallback);
      });
  });
}

async function prepareRoute(pathname: string): Promise<void> {
  if (pathname === "/bio") {
    const [bio, flashes] = await Promise.all([loadLinkBioContent(), loadFlashItems()]);
    await loadFlashPageContent();
    await preloadImages(
      [
        bio.avatarUrl,
        bio.studioImageUrl,
        ...flashes
          .filter((item) => item.active && item.status.toLowerCase() !== "reservado")
          .slice(0, 3)
          .map((item) => item.imageUrl),
        "/assets/brand/star-karina-filled.png",
        "/assets/brand/star-karina-outline.png",
        "/assets/IMG_0430.GIF",
      ],
      4500,
    );
    return;
  }

  if (pathname === "/" || pathname === "") {
    const home = await loadHomeContent();
    void loadLinkBioContent();
    await preloadImages(
      [
        home.heroImageUrl,
        home.processImageUrl,
        home.processPortraitUrl,
        home.youtubeThumbUrl,
        ...home.serviceCards.map((card) => card.imageUrl),
        ...home.collectionCards.map((card) => card.imageUrl),
        "/assets/IMG_0430.GIF",
      ],
      4500,
    );
    return;
  }

  await preloadImage("/assets/IMG_0430.GIF", 3000);
}

/**
 * Mantém o preloader visível até o conteúdo da rota atual (e imagens-chave)
 * estar pronto — evita o flash de defaults/mocks antes do CMS.
 */
export function useBootReady(pathname: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);
    const startedAt = performance.now();

    const hardStop = window.setTimeout(() => {
      if (active) setReady(true);
    }, MAX_BOOT_MS);

    withTimeout(prepareRoute(pathname), MAX_BOOT_MS - 200, undefined)
      .then(async () => {
        const elapsed = performance.now() - startedAt;
        const waitMore = Math.max(0, MIN_BOOT_MS - elapsed);
        if (waitMore) await new Promise((resolve) => window.setTimeout(resolve, waitMore));
        if (active) setReady(true);
      })
      .finally(() => window.clearTimeout(hardStop));

    return () => {
      active = false;
      window.clearTimeout(hardStop);
    };
  }, [pathname]);

  return ready;
}
