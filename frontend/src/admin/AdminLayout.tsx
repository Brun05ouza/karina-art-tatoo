import { useEffect, useId, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import {
  ArrowUpRight,
  Images,
  KeyRound,
  LayoutDashboard,
  LinkIcon,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "./auth/AuthContext";

function screenLabel(pathname: string): string {
  if (pathname.startsWith("/admin/galeria/portfolio")) return "Portfólio";
  if (pathname.startsWith("/admin/galeria/flash")) return "Flash tattoos";
  if (pathname.startsWith("/admin/galeria/produtos")) return "Produtos";
  if (pathname.startsWith("/admin/bio-links")) return "Links da bio";
  if (pathname === "/admin/usuarios") return "Usuários";
  if (pathname === "/admin/senha") return "Segurança";
  return "Visão geral";
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, mustChangePassword, logout } = useAuth();
  const { pathname } = useLocation();
  const access = !user || mustChangePassword;
  const title = screenLabel(pathname);
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onPointer(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest?.(".ks-admin-account")) return;
      setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [menuOpen]);

  const brand = (
    <a href="/" className="ks-admin-logo" aria-label="Karina Sarte — voltar ao site">
      <span className="ks-admin-logo-mark" aria-hidden="true">
        K
      </span>
      <span className="ks-admin-logo-text">
        Karina Sarte
        <span>ATELIÊ · ÁREA INTERNA</span>
      </span>
    </a>
  );

  if (loading) {
    return (
      <div className="ks-admin-loading" role="status">
        Preparando seu espaço…
      </div>
    );
  }

  if (access) {
    return (
      <div className="ks-admin-access">
        <aside className="ks-admin-access-art">
          {brand}
          <div className="ks-admin-access-story">
            <span className="ks-admin-eyebrow">OS BASTIDORES DA ARTE</span>
            <h2>
              Um espaço para
              <br />
              cuidar de cada
              <br />
              <em>detalhe.</em>
            </h2>
            <p>
              O mesmo cuidado que vai para a pele,
              <br />
              em tudo que acontece por aqui.
            </p>
          </div>
          <img className="ks-admin-art-star" src="/assets/brand/star-karina-outline.webp" alt="" />
          <span className="ks-admin-access-signature">Arte com identidade, cuidado e intenção.</span>
        </aside>
        <main id="admin-content" className="ks-admin-access-main">
          <div className="ks-admin-access-top">
            <span>
              <ShieldCheck size={15} /> Acesso à equipe
            </span>
            <a href="/">
              Ver o site <ArrowUpRight size={15} />
            </a>
          </div>
          {mustChangePassword && (
            <div className="ks-admin-steps" aria-label="Etapa 2 de 2">
              <span>01 · Acesso confirmado</span>
              <span aria-current="step">02 · Sua nova senha</span>
            </div>
          )}
          {children}
          <p className="ks-admin-access-bottom">Karina Sarte · Espaço de gestão</p>
        </main>
      </div>
    );
  }

  function GalleryNav() {
    return (
      <nav className="ks-admin-nav-primary" aria-label="Galerias">
        <NavLink to="/admin" end title="Visão geral">
          <LayoutDashboard size={18} aria-hidden />
          <span>Visão geral</span>
        </NavLink>
        <NavLink to="/admin/galeria/portfolio" title="Portfólio">
          <Images size={18} aria-hidden />
          <span>Portfólio</span>
        </NavLink>
        <NavLink to="/admin/galeria/flash" title="Flash tattoos">
          <Sparkles size={18} aria-hidden />
          <span>Flash</span>
        </NavLink>
        <NavLink to="/admin/galeria/produtos" title="Produtos">
          <ShoppingBag size={18} aria-hidden />
          <span>Produtos</span>
        </NavLink>
        <NavLink to="/admin/bio-links" title="Links da bio">
          <LinkIcon size={18} aria-hidden />
          <span>Bio</span>
        </NavLink>
      </nav>
    );
  }

  function AccountBlock({ id }: { id: string }) {
    return (
      <div className="ks-admin-account">
        <button
          type="button"
          className="ks-admin-account-trigger"
          aria-expanded={menuOpen}
          aria-controls={id}
          aria-haspopup="menu"
          aria-label="Menu da conta"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="ks-admin-avatar" aria-hidden>
            {user.email.slice(0, 1).toUpperCase()}
          </span>
          <span className="ks-admin-account-trigger-copy">
            <strong>{user.email}</strong>
            <small>{user.role === "owner" ? "Responsável" : "Editor"}</small>
          </span>
        </button>
        {menuOpen ? (
          <div id={id} className="ks-admin-account-menu" role="menu">
            <p className="ks-admin-account-menu-email">{user.email}</p>
            {user.role === "owner" ? (
              <NavLink to="/admin/usuarios" role="menuitem" onClick={() => setMenuOpen(false)}>
                <Users size={16} aria-hidden /> Usuários
              </NavLink>
            ) : null}
            <NavLink to="/admin/senha" role="menuitem" onClick={() => setMenuOpen(false)}>
              <KeyRound size={16} aria-hidden /> Segurança
            </NavLink>
            <a href="/" role="menuitem">
              Abrir o site <ArrowUpRight size={16} aria-hidden />
            </a>
            <button
              type="button"
              role="menuitem"
              className="ks-admin-account-logout"
              onClick={() => {
                setMenuOpen(false);
                void logout();
              }}
            >
              <LogOut size={16} aria-hidden /> Sair da conta
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="ks-admin-workspace">
      <a href="#admin-content" className="ks-admin-skip">
        Ir para o conteúdo
      </a>

      <aside className="ks-admin-sidebar">
        {brand}
        <span className="ks-admin-nav-label">GALERIAS</span>
        <GalleryNav />
        <div className="ks-admin-sidebar-bottom">
          <a href="/" className="ks-admin-sidebar-site">
            Abrir o site <ArrowUpRight size={16} aria-hidden />
          </a>
          <AccountBlock id={`${menuId}-side`} />
        </div>
      </aside>

      <div className="ks-admin-workspace-main">
        <header className="ks-admin-mobile-bar">
          <div className="ks-admin-mobile-brand">
            <a href="/" className="ks-admin-logo ks-admin-logo--compact" aria-label="Karina Sarte — voltar ao site">
              Karina Sarte
            </a>
            <p className="ks-admin-mobile-screen">{title}</p>
          </div>
          <GalleryNav />
          <AccountBlock id={`${menuId}-mobile`} />
        </header>
        <main id="admin-content">{children}</main>
        <footer className="ks-admin-workspace-footer">
          Karina Sarte <span>Feito para cuidar do que é seu.</span>
        </footer>
      </div>
    </div>
  );
}
