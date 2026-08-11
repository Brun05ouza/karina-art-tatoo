import { CircleHelp, FileText, GalleryVerticalEnd, Home, LayoutDashboard, Link2, MessageCircle, Package, RefreshCcw, Sparkles } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/home", label: "Home", icon: Home },
  { to: "/admin/sobre", label: "Sobre", icon: FileText },
  { to: "/admin/portfolio", label: "Portfólio", icon: GalleryVerticalEnd },
  { to: "/admin/reformulacoes", label: "Reformulações", icon: RefreshCcw },
  { to: "/admin/flash-tattoos", label: "Flash tattoos", icon: Sparkles },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/orcamento", label: "Orçamento", icon: MessageCircle },
  { to: "/admin/faq", label: "Perguntas", icon: CircleHelp },
  { to: "/admin/link-bio", label: "Link da bio", icon: Link2 },
] as const;

export function titleForPath(pathname: string) {
  return [...NAV_ITEMS].reverse().find((item) => item.exact ? pathname === item.to : pathname.startsWith(item.to))?.label || "Área administrativa";
}
