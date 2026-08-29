import { useEffect, useState } from "react";
import { ensureContent, isContentReady, peekContent } from "./content-loader";

export type FlashPageContent = {
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  heroImageUrl: string;
  hiddenSections?: string[];
};

export type FlashTattooItem = {
  id: string;
  order: number;
  active: boolean;
  title: string;
  description?: string;
  category?: string;
  status: string;
  price?: string;
  size?: string;
  imageUrl?: string;
};

export const defaultFlashPageContent: FlashPageContent = {
  heroKicker: "Flash Tattoos",
  heroTitle: "Flash Tattoos disponíveis",
  heroText: "Artes autorais prontas para tatuar, com disponibilidade limitada.",
  heroImageUrl: "",
};

/** Lista pública vem só do CMS — sem seed visual mockado. */
export const defaultFlashItems: FlashTattooItem[] = [];

export async function loadFlashPageContent(): Promise<FlashPageContent> {
  return ensureContent("flash-page", defaultFlashPageContent);
}

export async function loadFlashItems(): Promise<FlashTattooItem[]> {
  const value = await ensureContent<FlashTattooItem[]>("flash-tattoos", []);
  return Array.isArray(value) ? value : [];
}

export function useFlashPageContent(): FlashPageContent & { loaded: boolean } {
  const [data, setData] = useState(() => peekContent("flash-page", defaultFlashPageContent));
  const [loaded, setLoaded] = useState(() => isContentReady("flash-page"));

  useEffect(() => {
    let active = true;
    loadFlashPageContent().then((next) => {
      if (!active) return;
      setData(next);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return { ...data, loaded };
}

export function useFlashItems(): FlashTattooItem[] {
  const [items, setItems] = useState<FlashTattooItem[]>(() => peekContent<FlashTattooItem[]>("flash-tattoos", []));

  useEffect(() => {
    let active = true;
    loadFlashItems().then((next) => {
      if (active) setItems(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return [...items]
    .filter((item) => item.active && item.status !== "Oculto")
    .sort((a, b) => a.order - b.order);
}
