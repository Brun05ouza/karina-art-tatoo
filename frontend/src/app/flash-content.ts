import { useEffect, useState } from "react";
import { fetchGalleryItems } from "./gallery-api";

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

export const defaultFlashItems: FlashTattooItem[] = [];

function formatFlashStatus(raw: string | null | undefined): string {
  const value = (raw || "disponivel").toLowerCase();
  if (value === "vendido") return "Vendido";
  return "Disponível";
}

function mapFlash(items: Awaited<ReturnType<typeof fetchGalleryItems>>): FlashTattooItem[] {
  return items
    .filter((item) => Boolean(item.image_url))
    .map((item, index) => ({
      id: item.id,
      order: item.sort_order ?? index,
      active: true,
      title: item.title,
      description: item.price ? `Preço: ${item.price}` : undefined,
      status: formatFlashStatus(item.status),
      price: item.price ?? undefined,
      imageUrl: item.image_url,
    }));
}

export async function loadFlashPageContent(): Promise<FlashPageContent> {
  return defaultFlashPageContent;
}

export async function loadFlashItems(): Promise<FlashTattooItem[]> {
  return mapFlash(await fetchGalleryItems("flash"));
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
