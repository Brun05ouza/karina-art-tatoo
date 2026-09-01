import { useEffect, useState } from "react";
import { API_URL } from "../lib/api-base";

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

type RemotePortfolioItem = {
  id: string;
  order: number;
  active: boolean;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  bodyLocation?: string;
  style?: string;
  featured?: boolean;
  imageUrl?: string;
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

/** Metadados de exemplo sem mídia — só títulos para scaffolds mortos; fotos vêm do CMS. */
export const galleryItems: PortfolioWork[] = [
  { title: "Orquídeas", category: "Botânica", label: "Botânica", img: "", alt: "Tatuagem botânica de orquídeas", featured: true },
  { title: "Columbina", category: "Neotradicional", label: "Neotradicional", img: "", alt: "Tatuagem autoral Columbina", featured: true },
  { title: "Mandala autoral", category: "Ornamental", label: "Ornamental", img: "", alt: "Tatuagem de mandala ornamental", featured: true },
  { title: "Orquídea", category: "Fineline", label: "Fineline", img: "", alt: "Tatuagem de orquídea em traço fino", featured: true },
  { title: "Kira", category: "Blackwork", label: "Blackwork", img: "", alt: "Tatuagem autoral de cachorro", featured: true },
  { title: "Lua botânica", category: "Botânica", label: "Botânica", img: "", alt: "Tatuagem de lua e folhas", featured: true },
  { title: "Traço em processo", category: "Suminagashi", label: "Suminagashi", img: "", alt: "Detalhe de processo criativo", featured: false },
];

function toPortfolioWorks(items: RemotePortfolioItem[]): PortfolioWork[] {
  return [...items]
    .filter((item) => item.active && item.status !== "Oculto")
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      id: item.id,
      title: item.title || "Trabalho sem título",
      category: item.category || "Botânica",
      label: item.style || item.category || "Projeto autoral",
      img: item.imageUrl || "",
      alt: item.description || item.title || "Trabalho de portfólio",
      featured: Boolean(item.featured),
      order: item.order,
    }));
}

export function usePortfolioItems(staticFallback = false): PortfolioWork[] {
  const [items, setItems] = useState<PortfolioWork[]>(staticFallback ? galleryItems : []);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/portfolio`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: RemotePortfolioItem[] } | null) => {
        if (!active) return;
        if (Array.isArray(entry?.value)) {
          setItems(toPortfolioWorks(entry.value));
        } else if (!staticFallback) {
          setItems([]);
        }
      })
      .catch(() => {
        if (active && !staticFallback) setItems([]);
      });

    return () => {
      active = false;
    };
  }, [staticFallback]);

  return items;
}

export function usePortfolioPageContent(): PortfolioPageContent {
  const [data, setData] = useState<PortfolioPageContent>(defaultPortfolioPageContent);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/portfolio-page`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: Partial<PortfolioPageContent> } | null) => {
        if (active && entry?.value) setData({ ...defaultPortfolioPageContent, ...entry.value });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return data;
}
