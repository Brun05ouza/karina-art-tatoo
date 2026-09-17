import { useEffect, useState } from "react";
import { useLocation } from "react-router";

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
 * `npm run dev` ignora a chave; ver LANCAMENTO.md.
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
export function unresolvedMode(): boolean {
  return !SITE_LAUNCHED;
}

/**
 * Escape só do Vite: `?dev=1` força o aviso, `?dev=0` força o site.
 * Qualquer outro valor, inclusive a ausência do parâmetro, não liga o aviso.
 */
export function parseLocalDevOverride(search: string): boolean | null {
  const value = new URLSearchParams(search).get("dev");
  if (value === "1") return true;
  if (value === "0") return false;
  return null;
}

/**
 * Local (`isDev`) ignora a API e mostra o site, salvo o escape `?dev`.
 * Fora do Vite o parâmetro não entra na conta: `?dev=0` não publica o site.
 */
export function resolveDevelopmentMode(
  isDev: boolean,
  search: string,
  apiMode: boolean | null,
): boolean {
  if (isDev) return parseLocalDevOverride(search) ?? false;
  return typeof apiMode === "boolean" ? apiMode : unresolvedMode();
}

export function useSiteModeContent(): SiteModeContent {
  const { search } = useLocation();

  const [data, setData] = useState<SiteModeContent>(() => {
    if (import.meta.env.DEV) {
      return {
        ...defaultSiteModeContent,
        developmentMode: resolveDevelopmentMode(true, search, null),
        loaded: true,
      };
    }
    return {
      ...defaultSiteModeContent,
      developmentMode: unresolvedMode(),
      loaded: false,
    };
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      setData({
        ...defaultSiteModeContent,
        developmentMode: resolveDevelopmentMode(true, search, null),
        loaded: true,
      });
      return;
    }

    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), SITE_MODE_TIMEOUT_MS);

    fetch("/api/settings", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { developmentMode?: boolean } | null) => {
        if (!active) return;
        const developmentMode = resolveDevelopmentMode(
          false,
          "",
          typeof entry?.developmentMode === "boolean" ? entry.developmentMode : null,
        );
        setData({ ...defaultSiteModeContent, developmentMode, loaded: true });
      })
      .catch(() => {
        if (active) {
          // isDev falso de propósito: ?dev=0 não pode abrir o site se a API falhar.
          setData({
            ...defaultSiteModeContent,
            developmentMode: resolveDevelopmentMode(false, "?dev=0", null),
            loaded: true,
          });
        }
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [import.meta.env.DEV ? search : ""]);

  return data;
}
