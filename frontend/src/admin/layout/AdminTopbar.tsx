import { ExternalLink, LogOut, Menu } from "lucide-react";
import { useLocation } from "react-router";
import { useAdminAuth } from "../auth/AdminAuthContext";
import { useDirtyGuard } from "../hooks/useDirtyGuard";
import { titleForPath } from "./NAV_ITEMS";

export function AdminTopbar({ onOpenMenu }: { onOpenMenu(): void }) {
  const location = useLocation();
  const { user, logout } = useAdminAuth();
  const { confirmLeave } = useDirtyGuard();
  return <header className="ksa-topbar"><button className="ksa-menu-button" onClick={onOpenMenu} aria-label="Abrir menu"><Menu /></button><div><span>Você está editando</span><strong>{titleForPath(location.pathname)}</strong></div><div className="ksa-topbar-actions"><span className="ksa-user-email">{user?.email}</span><a href="/" target="_blank" rel="noreferrer">Ver site <ExternalLink size={15} /></a><button onClick={() => { if (confirmLeave()) void logout(); }}>Sair <LogOut size={15} /></button></div></header>;
}
