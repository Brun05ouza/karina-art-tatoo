import { useEffect, useState } from "react";
import { fetchGalleryFeatured, fetchGalleryItems } from "./gallery-api";

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
  focalX?: number;
  focalY?: number;
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
  heroImageUrl: "/assets/hero-portifolio.webp",
};

/** Fallback vazio — se a API falhar, a UI mostra mensagem discreta. */
export const galleryItems: PortfolioWork[] = [];

/**
 * Imagem de reserva da seção "Projeto em destaque" se a API falhar.
 * Copy (título/parágrafo/CTA) continua no JSX.
 */
export const featuredProjectFallback: PortfolioWork = {
  title: "Projeto em destaque",
  category: "Autoral",
  label: "Autoral",
  img: "/assets/projeto-destaque.webp",
  alt: "Projeto em destaque da Karina Sarte",
  featured: true,
};

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
        featured: Boolean(item.featured),
        focalX: item.focal_x ?? 50,
        focalY: item.focal_y ?? 50,
        order: item.sort_order ?? index,
      };
    });
}

function mapOne(item: NonNullable<Awaited<ReturnType<typeof fetchGalleryFeatured>>>): PortfolioWork {
  const category = item.category?.trim() || "Autoral";
  return {
    id: item.id,
    title: item.title,
    category,
    label: category,
    img: item.image_url,
    alt: item.alt_text?.trim() || item.title,
    featured: true,
    focalX: item.focal_x ?? 50,
    focalY: item.focal_y ?? 50,
    order: item.sort_order ?? 0,
  };
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

/** Projeto em destaque da home/portfólio — API com fallback estático. */
export function useFeaturedPortfolioWork(): PortfolioWork {
  const [work, setWork] = useState<PortfolioWork>(featuredProjectFallback);

  useEffect(() => {
    let active = true;
    void fetchGalleryFeatured("portfolio").then((raw) => {
      if (!active) return;
      if (raw?.image_url) setWork(mapOne(raw));
      else setWork(featuredProjectFallback);
    });
    return () => {
      active = false;
    };
  }, []);

  return work;
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
