import { useEffect, useState } from "react";

export type LinkBioButton = {
  id: string;
  label: string;
  url: string;
  icon: string;
  active: boolean;
  order: number;
};

export type LinkBioHighlight = {
  id: string;
  title: string;
  text: string;
  url: string;
  active: boolean;
  order?: number;
};

export type LinkBioChip = {
  id: string;
  label: string;
  active: boolean;
  order: number;
};

export type LinkBioTestimonial = {
  id: string;
  text: string;
  active: boolean;
  order: number;
};

export type LinkBioContent = {
  eyebrow: string;
  name: string;
  bio: string;
  avatarUrl: string;
  backgroundUrl: string;
  instagram: string;
  footerLabel: string;
  footerUrl: string;
  buttons: LinkBioButton[];
  highlights: LinkBioHighlight[];

  stylesLabel: string;
  stylesTitle: string;
  stylesText: string;
  styleChips: LinkBioChip[];

  flashLabel: string;
  flashTitle: string;
  flashText: string;
  flashCta: string;

  testimonialsLabel: string;
  testimonialsTitle: string;
  testimonialsCta: string;
  testimonials: LinkBioTestimonial[];

  studioLabel: string;
  studioTitle: string;
  studioText: string;
  studioImageUrl: string;
  studioButton: string;
  studioButtonUrl: string;

  finalTitle: string;
  finalText: string;
  finalButton: string;
};

const DEFAULT_STYLE_CHIPS: LinkBioChip[] = [
  { id: "chip-1", label: "blackwork", active: true, order: 1 },
  { id: "chip-2", label: "botânica", active: true, order: 2 },
  { id: "chip-3", label: "ornamental", active: true, order: 3 },
  { id: "chip-4", label: "suminagashi", active: true, order: 4 },
  { id: "chip-5", label: "fineline", active: true, order: 5 },
  { id: "chip-6", label: "neotradicional", active: true, order: 6 },
];

const DEFAULT_TESTIMONIALS: LinkBioTestimonial[] = [
  { id: "quote-1", text: "Ficou simplesmente perfeita!", active: true, order: 1 },
  { id: "quote-2", text: "Me senti ouvida em cada detalhe.", active: true, order: 2 },
  { id: "quote-3", text: "Melhor que eu esperava.", active: true, order: 3 },
  { id: "quote-4", text: "O trabalho ficou surreal.", active: true, order: 4 },
];

export const defaultLinkBioContent: LinkBioContent = {
  eyebrow: "Link da bio",
  name: "Karina Sarte",
  bio: "Tatuagem autoral · Teresópolis, RJ",
  avatarUrl: "",
  backgroundUrl: "",
  instagram: "",
  footerLabel: "Site completo",
  footerUrl: "/",
  buttons: [
    {
      id: "link-1",
      label: "Solicitar orçamento",
      url:
        "https://wa.me/5521990724477?text=" +
        encodeURIComponent("Olá Karina, vim pelo seu link da bio e queria fazer um orçamento de tattoo."),
      icon: "WhatsApp",
      active: true,
      order: 1,
    },
    { id: "link-2", label: "Portfólio", url: "/portfolio", icon: "Images", active: true, order: 2 },
    { id: "link-3", label: "Flash Tattoos", url: "/flash-tattoos", icon: "Sparkles", active: true, order: 3 },
    { id: "link-4", label: "Produtos", url: "/produtos", icon: "ShoppingBag", active: true, order: 4 },
    { id: "link-5", label: "TikTok", url: "https://www.tiktok.com/@karinasarte", icon: "TikTok", active: true, order: 5 },
    { id: "link-6", label: "YouTube", url: "https://www.youtube.com/@karinasarte", icon: "YouTube", active: true, order: 6 },
    { id: "link-7", label: "Instagram", url: "https://www.instagram.com/karinasarte", icon: "Instagram", active: true, order: 7 },
  ],
  highlights: [],

  stylesLabel: "linguagem visual",
  stylesTitle: "Estilos que atravessam meu trabalho",
  stylesText: "Traços, símbolos e referências que aparecem nas minhas criações autorais.",
  styleChips: DEFAULT_STYLE_CHIPS,

  flashLabel: "flash tattoos",
  flashTitle: "Flashs disponíveis",
  flashText: "Desenhos autorais prontos para tatuar, com disponibilidade limitada.",
  flashCta: "Ver todos os flashs",

  testimonialsLabel: "depoimentos",
  testimonialsTitle: "Quem já passou por aqui",
  testimonialsCta: "Quero viver essa experiência também",
  testimonials: DEFAULT_TESTIMONIALS,

  studioLabel: "meu studio",
  studioTitle: "Um espaço para criar com calma",
  studioText: "É aqui que eu desenho, preparo cada detalhe e recebo quem chega para transformar ideia em pele.",
  studioImageUrl: "/assets/studio/studio-5.jpeg",
  studioButton: "Conhecer o studio",
  studioButtonUrl: "/sobre",

  finalTitle: "Vamos criar sua próxima tattoo?",
  finalText: "Me chama com sua ideia, referência ou dúvida e a gente começa a pensar no projeto.",
  finalButton: "Solicitar orçamento",
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

function mergeChips(incoming?: Partial<LinkBioChip>[] | null): LinkBioChip[] {
  if (!Array.isArray(incoming) || incoming.length === 0) return defaultLinkBioContent.styleChips;
  return incoming.map((item, index) => ({
    id: item.id || `chip-${index + 1}`,
    label: item.label || "",
    active: item.active !== false,
    order: typeof item.order === "number" ? item.order : index + 1,
  }));
}

function mergeTestimonials(incoming?: Partial<LinkBioTestimonial>[] | null): LinkBioTestimonial[] {
  if (!Array.isArray(incoming) || incoming.length === 0) return defaultLinkBioContent.testimonials;
  return incoming.map((item, index) => ({
    id: item.id || `quote-${index + 1}`,
    text: item.text || "",
    active: item.active !== false,
    order: typeof item.order === "number" ? item.order : index + 1,
  }));
}

export function useLinkBioContent(): LinkBioContent {
  const [data, setData] = useState<LinkBioContent>(defaultLinkBioContent);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/link-bio`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: Partial<LinkBioContent> } | null) => {
        if (active && entry?.value) {
          setData({
            ...defaultLinkBioContent,
            ...entry.value,
            buttons: Array.isArray(entry.value.buttons) ? entry.value.buttons : defaultLinkBioContent.buttons,
            highlights: [],
            styleChips: mergeChips(entry.value.styleChips),
            testimonials: mergeTestimonials(entry.value.testimonials),
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return data;
}
