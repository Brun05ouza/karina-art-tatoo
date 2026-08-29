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
  developmentImageUrl: "",
  developmentButton: "Falar comigo no WhatsApp",
  developmentButtonUrl: "https://wa.me/5521990724477?text=Oi%2C%20Karina%21%20Vim%20pelo%20site%20e%20queria%20falar%20com%20voc%C3%AA.",
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

/**
 * Enquanto `loaded` não vira true, o site inteiro fica com opacity:0 (ver
 * `.ks-shell` em App.tsx — o Preloader só aparece, e só chama onComplete,
 * depois que isso resolve). Por isso o fetch aqui NÃO pode ficar pendurado
 * esperando o backend: um backend lento pra acordar (hosts que hibernam
 * depois de um tempo sem tráfego) ou uma conexão que trava sem erro nem
 * sucesso deixava a tela em branco indefinidamente, sem nenhum fallback —
 * exatamente o "às vezes carrega, às vezes não" relatado.
 */
const SITE_MODE_TIMEOUT_MS = 4000;

export function useSiteModeContent(): SiteModeContent {
  const [data, setData] = useState<SiteModeContent>({ ...defaultSiteModeContent, loaded: false });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), SITE_MODE_TIMEOUT_MS);

    fetch(`${API_URL}/api/content/site-mode`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: Partial<SiteModeContent> } | null) => {
        if (active) setData({ ...defaultSiteModeContent, ...(entry?.value ?? {}), loaded: true });
      })
      .catch(() => {
        // Sem banco disponível (ou backend lento demais pra responder a
        // tempo): o site segue publicado normalmente, com os textos padrão.
        if (active) setData({ ...defaultSiteModeContent, loaded: true });
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  return data;
}
