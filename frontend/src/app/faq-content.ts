import { useEffect, useState } from "react";
import { FAQ_ITEMS } from "./seo";

export type FaqContentItem = {
  id: string;
  order: number;
  active: boolean;
  title: string;
  answer: string;
  description?: string;
  category?: string;
  status?: string;
};

export const defaultFaqItems: FaqContentItem[] = FAQ_ITEMS.map(([title, answer], index) => ({
  id: `faq-${index + 1}`,
  order: index + 1,
  active: true,
  title,
  answer,
  category: "Geral",
  status: "Publicado",
}));

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

export function useFaqItems(): FaqContentItem[] {
  const [items, setItems] = useState<FaqContentItem[]>([]);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/faq`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: FaqContentItem[] } | null) => {
        if (active) setItems(Array.isArray(entry?.value) ? entry.value : []);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return [...items]
    .filter((item) => item.active && (!item.status || item.status === "Publicado"))
    .sort((a, b) => a.order - b.order);
}
