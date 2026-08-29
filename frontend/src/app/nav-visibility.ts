import { useEffect, useState } from "react";
import { isPageVisible } from "./section-visibility";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

/** Rotas do menu principal ↔ chave do conteúdo no CMS. */
const NAV_CONTENT_KEYS: Record<string, string> = {
  "/": "home",
  "/sobre": "sobre",
  "/portfolio": "portfolio-page",
  "/reformulacoes": "reformulacoes-textos",
  "/flash-tattoos": "flash-page",
  "/produtos": "products-page",
  "/orcamento": "budget-page",
};

export type NavVisibilityMap = Record<string, boolean>;

const defaultVisibility: NavVisibilityMap = Object.fromEntries(
  Object.keys(NAV_CONTENT_KEYS).map((path) => [path, true]),
);

async function fetchPageVisible(key: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/content/${key}`);
    if (!response.ok) return true;
    const entry = (await response.json()) as { value?: unknown };
    if (!entry?.value) return true;
    return isPageVisible(entry.value);
  } catch {
    return true;
  }
}

/** Quais páginas do menu/footer devem aparecer, com base em `hiddenSections` do admin. */
export function useNavVisibility(): NavVisibilityMap {
  const [visibility, setVisibility] = useState<NavVisibilityMap>(defaultVisibility);

  useEffect(() => {
    let active = true;

    void Promise.all(
      Object.entries(NAV_CONTENT_KEYS).map(async ([path, key]) => {
        const visible = await fetchPageVisible(key);
        return [path, visible] as const;
      }),
    ).then((entries) => {
      if (!active) return;
      setVisibility(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, []);

  return visibility;
}

/** Extrai o pathname de um href interno (`/produtos#x` → `/produtos`). */
export function normalizeNavPath(href: string): string {
  if (!href) return "/";
  try {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return new URL(href).pathname.replace(/\/$/, "") || "/";
    }
  } catch {
    /* ignore */
  }
  const path = href.split("?")[0]?.split("#")[0] || "/";
  if (!path.startsWith("/")) return "/";
  return path.replace(/\/$/, "") || "/";
}

export function isNavPathVisible(visibility: NavVisibilityMap, href: string): boolean {
  const path = normalizeNavPath(href);
  if (!(path in visibility)) return true;
  return visibility[path] !== false;
}

/** Se o destino é uma página controlada pelo toggle “Página no site”. */
export function isManagedNavPath(href: string): boolean {
  return normalizeNavPath(href) in NAV_CONTENT_KEYS;
}
