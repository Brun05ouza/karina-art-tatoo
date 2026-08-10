import { useEffect, useState } from "react";

export type FlashPageContent = {
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  heroImageUrl: string;
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
  heroImageUrl: "/assets/hero-home.png",
};

export const defaultFlashItems: FlashTattooItem[] = [
  { id: "flash-1", order: 1, active: true, title: "Olho floral", description: "Flash autoral disponível uma única vez.", category: "Botânico", status: "Disponível", price: "R$ 450", size: "12 cm", imageUrl: "/assets/brand/products-hero-flower-eye.png" },
  { id: "flash-2", order: 2, active: true, title: "Olho coração", description: "Desenho autoral em preto e vermelho.", category: "Símbolos", status: "Reservado", price: "R$ 380", size: "10 cm", imageUrl: "/assets/brand/eye-heart.png" },
  { id: "flash-3", order: 3, active: true, title: "Estrela violeta", description: "Peça gráfica com identidade Sarte.", category: "Gráfico", status: "Disponível", price: "R$ 320", size: "8 cm", imageUrl: "/assets/brand/eye-purple.png" },
];

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

export function useFlashPageContent(): FlashPageContent {
  const [data, setData] = useState<FlashPageContent>(defaultFlashPageContent);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/flash-page`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: Partial<FlashPageContent> } | null) => {
        if (active && entry?.value) setData({ ...defaultFlashPageContent, ...entry.value });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return data;
}

export function useFlashItems(): FlashTattooItem[] {
  const [items, setItems] = useState<FlashTattooItem[]>([]);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/flash-tattoos`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: FlashTattooItem[] } | null) => {
        if (active) setItems(Array.isArray(entry?.value) ? entry.value : []);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return [...items]
    .filter((item) => item.active && item.status !== "Oculto")
    .sort((a, b) => a.order - b.order);
}
