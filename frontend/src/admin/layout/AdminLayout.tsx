import { useCallback, useState } from "react";
import { Outlet } from "react-router";
import { DirtyGuardProvider } from "../hooks/useDirtyGuard";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

/** Preferência de interface (não é dado de conteúdo nem de sessão). */
const COLLAPSED_KEY = "ks-admin-sidebar-collapsed";

function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function AdminLayoutInner() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggleCollapse = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* modo privado ou storage cheio: a preferência só não persiste */
      }
      return next;
    });
  }, []);

  return <div className={`ksa-app ${collapsed ? "is-collapsed" : ""}`}><AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} collapsed={collapsed} onToggleCollapse={toggleCollapse} /><div className="ksa-main"><AdminTopbar onOpenMenu={() => setMenuOpen(true)} /><Outlet /></div></div>;
}

export function AdminLayout() {
  return <DirtyGuardProvider><AdminLayoutInner /></DirtyGuardProvider>;
}
