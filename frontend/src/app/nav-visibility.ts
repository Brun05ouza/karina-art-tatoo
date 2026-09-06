/** Rotas do menu principal. */
const NAV_PATHS = ["/", "/sobre", "/portfolio", "/reformulacoes", "/flash-tattoos", "/produtos", "/orcamento"] as const;

export type NavVisibilityMap = Record<string, boolean>;

const defaultVisibility: NavVisibilityMap = Object.fromEntries(NAV_PATHS.map((path) => [path, true]));

/** Quais páginas do menu/footer devem aparecer. Sem CMS, todas ficam visíveis. */
export function useNavVisibility(): NavVisibilityMap {
  return defaultVisibility;
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

export function isManagedNavPath(href: string): boolean {
  return NAV_PATHS.includes(normalizeNavPath(href) as (typeof NAV_PATHS)[number]);
}
