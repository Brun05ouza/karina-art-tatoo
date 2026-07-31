import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { NavLink } from "react-router";
import { useDirtyGuard } from "../hooks/useDirtyGuard";
import { NAV_ITEMS } from "./NAV_ITEMS";

type AdminSidebarProps = {
  open: boolean;
  onClose(): void;
  collapsed: boolean;
  onToggleCollapse(): void;
};

export function AdminSidebar({ open, onClose, collapsed, onToggleCollapse }: AdminSidebarProps) {
  const { confirmLeave } = useDirtyGuard();
  return <><button className={`ksa-sidebar-backdrop ${open ? "is-open" : ""}`} aria-label="Fechar menu" onClick={onClose} /><aside className={`ksa-sidebar ${open ? "is-open" : ""}`}><header className="ksa-sidebar-brand"><a href="/" target="_blank" rel="noreferrer"><span>＋</span> Karina Sarte</a><button className="ksa-sidebar-collapse" onClick={onToggleCollapse} aria-expanded={!collapsed} title={collapsed ? "Mostrar nomes do menu" : "Mostrar apenas ícones"} aria-label={collapsed ? "Mostrar nomes do menu" : "Mostrar apenas ícones"}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button><button className="ksa-sidebar-close" onClick={onClose} aria-label="Fechar menu"><X size={20} /></button></header><nav>{NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => <NavLink key={to} to={to} end={exact} title={label} className={({ isActive }) => `ksa-nav-item ${isActive ? "is-active" : ""}`} onClick={(event) => { if (!confirmLeave()) event.preventDefault(); else onClose(); }}><Icon size={18} /><span>{label}</span></NavLink>)}</nav></aside></>;
}
