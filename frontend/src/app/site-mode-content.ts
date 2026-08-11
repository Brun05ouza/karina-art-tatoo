import { useEffect, useState } from "react";

export type SiteModeContent = {
  developmentMode: boolean;
  developmentEyebrow: string;
  developmentTitle: string;
  developmentText: string;
  developmentImageUrl: string;
  developmentButton: string;
  developmentButtonUrl: string;
  loaded?: boolean;
};

export const defaultSiteModeContent: SiteModeContent = {
  developmentMode: false,
  developmentEyebrow: "Karina Sarte",
  developmentTitle: "Esse site está em desenvolvimento",
  developmentText: "Estou preparando esse espaço com carinho. Em breve tudo aparece por aqui com mais detalhes, arte e intenção.",
  developmentImageUrl: "/assets/link-bio/background.jpg",
  developmentButton: "Falar comigo no WhatsApp",
  developmentButtonUrl: "https://wa.me/5521990724477?text=Oi%2C%20Karina%21%20Vim%20pelo%20site%20e%20queria%20falar%20com%20voc%C3%AA.",
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

export function useSiteModeContent(): SiteModeContent {
  const [data, setData] = useState<SiteModeContent>({ ...defaultSiteModeContent, loaded: false });

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/site-mode`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: Partial<SiteModeContent> } | null) => {
        if (active) setData({ ...defaultSiteModeContent, ...(entry?.value ?? {}), loaded: true });
      })
      .catch(() => {
        // Sem banco disponível, o site segue publicado normalmente.
        if (active) setData({ ...defaultSiteModeContent, loaded: true });
      });

    return () => {
      active = false;
    };
  }, []);

  return data;
}
