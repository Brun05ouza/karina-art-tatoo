import { useEffect, useState } from "react";
import { fetchGalleryItems, type PublicGalleryItem } from "./gallery-api";

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
  status: "disponivel" | "vendido" | string;
  price?: string;
  size?: string;
  imageUrl?: string;
  focalX?: number;
  focalY?: number;
};

export const defaultFlashPageContent: FlashPageContent = {
  heroKicker: "Flash Tattoos",
  heroTitle: "Flash Tattoos disponíveis",
  heroText: "Artes autorais prontas para tatuar, com disponibilidade limitada.",
  heroImageUrl: "/assets/flashs/gatin-sem-bkg.png",
};

export const defaultFlashItems: FlashTattooItem[] = [];

function formatFlashStatus(raw: string | null | undefined): "disponivel" | "vendido" {
  const value = (raw || "disponivel").toLowerCase();
  if (value === "vendido") return "vendido";
  return "disponivel";
}

function mapFlash(items: PublicGalleryItem[]): FlashTattooItem[] {
  return items
    .filter((item) => Boolean(item.image_url))
    .map((item, index) => ({
      id: item.id,
      order: item.sort_order ?? index,
      active: true,
      title: item.title,
      status: formatFlashStatus(item.status),
      price: item.price?.trim() || undefined,
      imageUrl: item.image_url,
      focalX: item.focal_x ?? 50,
      focalY: item.focal_y ?? 50,
    }));
}

export async function loadFlashPageContent(): Promise<FlashPageContent> {
  return defaultFlashPageContent;
}

export async function loadFlashItems(): Promise<FlashTattooItem[]> {
  try {
    const res = await fetch("/api/gallery/flash", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { items?: PublicGalleryItem[] };
    return mapFlash(Array.isArray(data.items) ? data.items : []);
  } catch {
    return mapFlash(await fetchGalleryItems("flash"));
  }
}

export function useFlashPageContent(): FlashPageContent & { loaded: boolean } {
  const [data, setData] = useState<FlashPageContent>(defaultFlashPageContent);

  useEffect(() => {
    let active = true;
    loadFlashPageContent().then((next) => {
      if (!active) return;
      setData(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return { ...data, loaded: true };
}

export function useFlashItems(): FlashTattooItem[] {
  const [items, setItems] = useState<FlashTattooItem[]>(defaultFlashItems);

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
