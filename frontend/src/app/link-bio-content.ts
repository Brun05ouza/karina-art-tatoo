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
};

export const defaultLinkBioContent: LinkBioContent = {
  eyebrow: "Link da bio",
  name: "Karina Sarte",
  bio: "Tatuagem autoral · Teresópolis, RJ",
  avatarUrl: "/assets/karina-sarte.png",
  backgroundUrl: "/assets/link-bio/background.jpg",
  instagram: "",
  footerLabel: "Site completo",
  footerUrl: "/",
  buttons: [
    {
      id: "link-1",
      label: "Solicitar orçamento",
      url: "https://wa.me/5521990724477?text=Ol%C3%A1%2C%20Karina%20Sarte%21%20Vim%20pela%20bio%20do%20site%20e%20queria%20fazer%20um%20or%C3%A7amento.",
      icon: "WhatsApp",
      active: true,
      order: 1,
    },
    { id: "link-2", label: "Ver portfólio", url: "/portfolio", icon: "Images", active: true, order: 2 },
    { id: "link-3", label: "Flash tattoos", url: "/flash-tattoos", icon: "Sparkles", active: true, order: 3 },
    { id: "link-4", label: "Produtos", url: "/produtos", icon: "ShoppingBag", active: true, order: 4 },
  ],
  highlights: [],
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

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
