import { useEffect, useState } from "react";

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

/** Metadados de exemplo sem mídia — só títulos para scaffolds mortos. */
export const galleryItems: PortfolioWork[] = [
  { title: "Orquídeas", category: "Botânica", label: "Botânica", img: "", alt: "Tatuagem botânica de orquídeas", featured: true },
  { title: "Columbina", category: "Neotradicional", label: "Neotradicional", img: "", alt: "Tatuagem autoral Columbina", featured: true },
  { title: "Mandala autoral", category: "Ornamental", label: "Ornamental", img: "", alt: "Tatuagem de mandala ornamental", featured: true },
  { title: "Orquídea", category: "Fineline", label: "Fineline", img: "", alt: "Tatuagem de orquídea em traço fino", featured: true },
  { title: "Kira", category: "Blackwork", label: "Blackwork", img: "", alt: "Tatuagem autoral de cachorro", featured: true },
  { title: "Lua botânica", category: "Botânica", label: "Botânica", img: "", alt: "Tatuagem de lua e folhas", featured: true },
  { title: "Traço em processo", category: "Suminagashi", label: "Suminagashi", img: "", alt: "Detalhe de processo criativo", featured: false },
];

export function usePortfolioItems(_staticFallback = false): PortfolioWork[] {
  const [items, setItems] = useState<PortfolioWork[]>(galleryItems);

  useEffect(() => {
    let active = true;
    void Promise.resolve(galleryItems).then((next) => {
      if (active) setItems(next);
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
