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

/**
 * false enquanto o site não foi lançado.
 * No dia do lançamento, junto com o robots.txt e o interruptor no painel:
 * mude para true. Aí uma falha de rede não derruba o site já publicado.
 */
export const SITE_LAUNCHED = false;

export const defaultSiteModeContent: SiteModeContent = {
  developmentMode: !SITE_LAUNCHED,
  developmentEyebrow: "Karina Sarte",
  developmentTitle: "Esse site está em desenvolvimento",
  developmentText: "Estou preparando esse espaço com carinho. Em breve tudo aparece por aqui com mais detalhes, arte e intenção.",
  developmentImageUrl: "",
  developmentButton: "Falar comigo no WhatsApp",
  developmentButtonUrl: "",
};

const SITE_MODE_TIMEOUT_MS = 4000;

/** Sem resposta: esconde o site antes do lançamento; depois, deixa no ar. */
function unresolvedMode(): boolean {
  return !SITE_LAUNCHED;
}

export function useSiteModeContent(): SiteModeContent {
  const [data, setData] = useState<SiteModeContent>({
    ...defaultSiteModeContent,
    developmentMode: unresolvedMode(),
    loaded: false,
  });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), SITE_MODE_TIMEOUT_MS);

    fetch("/api/settings", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { developmentMode?: boolean } | null) => {
        if (!active) return;
        const developmentMode =
          typeof entry?.developmentMode === "boolean" ? entry.developmentMode : unresolvedMode();
        setData({ ...defaultSiteModeContent, developmentMode, loaded: true });
      })
      .catch(() => {
        if (active) {
          setData({ ...defaultSiteModeContent, developmentMode: unresolvedMode(), loaded: true });
        }
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
