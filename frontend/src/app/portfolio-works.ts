import { useEffect, useState } from "react";
import { tattooImages } from "./tattoo-images";

export const PORTFOLIO_CATEGORIES = [
  "Fine Line",
  "Minimalista",
  "Blackwork",
  "Projetos Autorais",
  "Flash Tattoo",
  "Cicatrizadas",
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
};

export const defaultPortfolioPageContent: PortfolioPageContent = {
  heroKicker: "Portfólio",
  heroTitle: "Portfólio",
  heroText: "Conheça tattoos, flashes e projetos autorais criados pela Karina Sarte.",
  heroImageUrl: tattooImages.heroPortfolio,
};

export const galleryItems: PortfolioWork[] = [
  {
    title: "Orquídeas",
    category: "Projetos Autorais",
    label: "Vídeo de processo",
    img: "/assets/recent-projects/orquideas-poster.jpg",
    alt: "Processo de criação de tatuagem de orquídeas",
    featured: true,
    processVideo: {
      poster: "/assets/recent-projects/orquideas-poster.jpg",
      src: "/assets/recent-projects/orquideas-processo.mp4",
    },
  },
  {
    title: "Columbina",
    category: "Projetos Autorais",
    label: "Projeto autoral",
    img: "/assets/recent-projects/columbina.jpg",
    alt: "Tatuagem autoral Columbina com composição floral e olhar",
    featured: true,
  },
  {
    title: "Mandala autoral",
    category: "Projetos Autorais",
    label: "Ornamental",
    img: "/assets/recent-projects/mandala.jpg",
    alt: "Tatuagem de mandala ornamental autoral",
    featured: true,
  },
  {
    title: "Orquídea",
    category: "Fine Line",
    label: "Fine line",
    img: "/assets/recent-projects/orquidea-pescoco.jpg",
    alt: "Tatuagem de orquídea em traço fino no pescoço",
    featured: true,
  },
  {
    title: "Kira",
    category: "Projetos Autorais",
    label: "Pet tattoo",
    img: "/assets/recent-projects/kira.jpg",
    alt: "Tatuagem autoral de cachorro chamada Kira",
    featured: true,
  },
  {
    title: "Lua botânica",
    category: "Projetos Autorais",
    label: "Projeto autoral",
    img: "/assets/recent-projects/lua-botanica.jpg",
    alt: "Tatuagem autoral de lua, folhas e andorinha",
    featured: true,
  },
];

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

function toPortfolioWorks(items: RemotePortfolioItem[]): PortfolioWork[] {
  return [...items]
    .filter((item) => item.active && item.status !== "Oculto")
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      id: item.id,
      title: item.title || "Trabalho sem título",
      category: item.category || "Projetos Autorais",
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
