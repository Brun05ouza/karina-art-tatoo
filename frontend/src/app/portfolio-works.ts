import { useEffect, useState } from "react";
import { fetchGalleryItems } from "./gallery-api";

export const PORTFOLIO_CATEGORIES = [
  "Blackwork",
  "Botânica",
  "Ornamental",
  "Suminagashi",
  "Fineline",
  "Neotradicional",
] as const;

export type PortfolioWork = {
  id?: string;
  title: string;
  category: string;
  label: string;
  img: string;
  alt: string;
  featured: boolean;
  order?: number;
  processVideo?: {
    poster: string;
    src: string;
  };
};

export type PortfolioPageContent = {
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  heroImageUrl: string;
  hiddenSections?: string[];
};

export const defaultPortfolioPageContent: PortfolioPageContent = {
  heroKicker: "Portfólio",
  heroTitle: "Portfólio",
  heroText: "Conheça tattoos, flashes e projetos autorais criados pela Karina Sarte.",
  heroImageUrl: "",
};

/** Fallback vazio — se a API falhar, a UI mostra mensagem discreta. */
export const galleryItems: PortfolioWork[] = [];

function mapPortfolio(items: Awaited<ReturnType<typeof fetchGalleryItems>>): PortfolioWork[] {
  return items
    .filter((item) => Boolean(item.image_url))
    .map((item, index) => {
      const category = item.category?.trim() || "Autoral";
      return {
        id: item.id,
        title: item.title,
        category,
        label: category,
        img: item.image_url,
        alt: item.alt_text?.trim() || item.title,
        featured: true,
        order: item.sort_order ?? index,
      };
    });
}

export function usePortfolioItems(_staticFallback = false): PortfolioWork[] {
  const [items, setItems] = useState<PortfolioWork[]>(galleryItems);

  useEffect(() => {
    let active = true;
    void fetchGalleryItems("portfolio").then((raw) => {
      if (!active) return;
      setItems(mapPortfolio(raw));
    });
    return () => {
      active = false;
    };
  }, []);

  return items;
}

export function usePortfolioPageContent(): PortfolioPageContent {
  const [data, setData] = useState<PortfolioPageContent>(defaultPortfolioPageContent);

  useEffect(() => {
    let active = true;
    void Promise.resolve(defaultPortfolioPageContent).then((next) => {
      if (active) setData(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
