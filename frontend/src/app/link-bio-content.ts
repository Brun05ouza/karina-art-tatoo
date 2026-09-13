import { useEffect, useState } from "react";

export type LinkBioButton = {
  id: string;
  label: string;
  url: string;
  icon: string;
  active: boolean;
  order: number;
  featured?: boolean;
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
  avatarFocalX?: number;
  avatarFocalY?: number;
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
  studioFocalX?: number;
  studioFocalY?: number;
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
  avatarUrl: "/assets/karina-sarte.png",
  backgroundUrl: "",
  instagram: "@karinasarte",
  footerLabel: "Site completo",
  footerUrl: "/",
  buttons: [
    {
      id: "link-1",
      label: "Solicitar orçamento",
      url:
        "https://wa.me/5521990724477?text=" +
        encodeURIComponent("Olá, Karina Sarte! Vim pela bio do site e queria fazer um orçamento."),
      icon: "whatsapp",
      active: true,
      order: 1,
      featured: true,
    },
    { id: "link-2", label: "TikTok", url: "https://www.tiktok.com/@karinasarte", icon: "tiktok", active: true, order: 2 },
    { id: "link-3", label: "Youtube", url: "https://www.youtube.com/@karinasarte", icon: "youtube", active: true, order: 3 },
    { id: "link-4", label: "Portfólio", url: "/portfolio", icon: "portfolio", active: true, order: 4 },
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

function normalizeLinkBio(raw: Partial<LinkBioContent> | null | undefined): LinkBioContent {
  const value = raw ?? {};
  return {
    ...defaultLinkBioContent,
    ...value,
    buttons: Array.isArray(value.buttons) ? value.buttons : defaultLinkBioContent.buttons,
    highlights: [],
    styleChips: mergeChips(value.styleChips),
    testimonials: mergeTestimonials(value.testimonials),
  };
}

export async function loadLinkBioContent(): Promise<LinkBioContent> {
  const base = normalizeLinkBio(defaultLinkBioContent);

  const [linksResult, profileResult] = await Promise.allSettled([
    fetch("/api/bio-links", { headers: { Accept: "application/json" } }).then(async (res) => {
      if (!res.ok) throw new Error("bio-links");
      return (await res.json()) as {
        items?: Array<{
          id: string;
          label: string;
          url: string;
          icon: string | null;
          featured: boolean;
          sort_order: number;
          published: boolean;
        }>;
      };
    }),
    fetch("/api/bio-profile", { headers: { Accept: "application/json" } }).then(async (res) => {
      if (!res.ok) throw new Error("bio-profile");
      return (await res.json()) as {
        profile?: {
          avatar_url?: string;
          subtitle?: string;
          studio_image_url?: string;
          avatar_focal_x?: number;
          avatar_focal_y?: number;
          studio_focal_x?: number;
          studio_focal_y?: number;
        };
        chips?: Array<{ id: string; label: string; sort_order: number }>;
        testimonials?: Array<{
          id: string;
          quote: string;
          sort_order: number;
          published?: boolean;
        }>;
      };
    }),
  ]);

  let next: LinkBioContent = { ...base };

  if (linksResult.status === "fulfilled" && Array.isArray(linksResult.value.items)) {
    next = {
      ...next,
      buttons: linksResult.value.items.map((item, index) => ({
        id: item.id,
        label: item.label,
        url: item.url,
        icon: item.icon || "link",
        active: item.published !== false,
        order: item.sort_order ?? index,
        featured: Boolean(item.featured),
      })),
    };
  }

  if (profileResult.status === "fulfilled") {
    const data = profileResult.value;
    const profile = data.profile;
    if (profile?.avatar_url) next = { ...next, avatarUrl: profile.avatar_url };
    if (profile?.subtitle) next = { ...next, bio: profile.subtitle };
    if (profile?.studio_image_url) next = { ...next, studioImageUrl: profile.studio_image_url };
    if (profile?.avatar_focal_x != null || profile?.avatar_focal_y != null) {
      next = {
        ...next,
        avatarFocalX: profile.avatar_focal_x ?? 50,
        avatarFocalY: profile.avatar_focal_y ?? 50,
      };
    }
    if (profile?.studio_focal_x != null || profile?.studio_focal_y != null) {
      next = {
        ...next,
        studioFocalX: profile.studio_focal_x ?? 50,
        studioFocalY: profile.studio_focal_y ?? 50,
      };
    }

    if (Array.isArray(data.chips)) {
      next = {
        ...next,
        styleChips: data.chips.map((chip, index) => ({
          id: chip.id,
          label: chip.label,
          active: true,
          order: chip.sort_order ?? index,
        })),
      };
    }

    if (Array.isArray(data.testimonials)) {
      next = {
        ...next,
        testimonials: data.testimonials.map((item, index) => ({
          id: item.id,
          text: item.quote,
          active: item.published !== false,
          order: item.sort_order ?? index,
        })),
      };
    }
  }

  return next;
}

export function useLinkBioContent(): LinkBioContent & { loaded: boolean } {
  const [data, setData] = useState<LinkBioContent>(() => normalizeLinkBio(defaultLinkBioContent));
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    let active = true;
    loadLinkBioContent().then((next) => {
      if (!active) return;
      setData(next);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return { ...data, loaded };
}
