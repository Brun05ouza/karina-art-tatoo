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

export function useFaqItems(): FaqContentItem[] {
  const [items, setItems] = useState<FaqContentItem[]>(defaultFaqItems);

  useEffect(() => {
    let active = true;
    void Promise.resolve(defaultFaqItems).then((next) => {
      if (active) setItems(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return [...items]
    .filter((item) => item.active && (!item.status || item.status === "Publicado"))
    .sort((a, b) => a.order - b.order);
}
