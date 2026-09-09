import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import { ArrowUpRight, Images, LayoutDashboard, LogOut, ShieldCheck, ShoppingBag, Sparkles, Users, KeyRound } from "lucide-react";
import { useAuth } from "./auth/AuthContext";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, mustChangePassword, logout } = useAuth();
  const { pathname } = useLocation();
  const access = !user || mustChangePassword;
  const brand = <a href="/" className="ks-admin-logo" aria-label="Karina Sarte — voltar ao site">Karina Sarte<span>ATELIÊ · ÁREA INTERNA</span></a>;

  const crumb =
    pathname.startsWith("/admin/galeria/portfolio")
      ? "Portfólio"
      : pathname.startsWith("/admin/galeria/flash")
        ? "Flash tattoos"
        : pathname.startsWith("/admin/galeria/produtos")
          ? "Produtos"
          : pathname === "/admin/usuarios"
            ? "Usuários"
            : pathname === "/admin/senha"
              ? "Segurança"
              : "Visão geral";

  if (loading) return <div className="ks-admin-loading" role="status">Preparando seu espaço…</div>;

  if (access) return (
    <div className="ks-admin-access">
      <aside className="ks-admin-access-art">
        {brand}
        <div className="ks-admin-access-story">
          <span className="ks-admin-eyebrow">OS BASTIDORES DA ARTE</span>
          <h2>Um espaço para<br />cuidar de cada<br /><em>detalhe.</em></h2>
          <p>O mesmo cuidado que vai para a pele,<br />em tudo que acontece por aqui.</p>
        </div>
        <img className="ks-admin-art-star" src="/assets/brand/star-karina-outline.webp" alt="" />
        <span className="ks-admin-access-signature">Arte com identidade, cuidado e intenção.</span>
      </aside>
      <main id="admin-content" className="ks-admin-access-main">
        <div className="ks-admin-access-top"><span><ShieldCheck size={15} /> Acesso à equipe</span><a href="/">Ver o site <ArrowUpRight size={15} /></a></div>
        {mustChangePassword && <div className="ks-admin-steps" aria-label="Etapa 2 de 2"><span>01 · Acesso confirmado</span><span aria-current="step">02 · Sua nova senha</span></div>}
        {children}
        <p className="ks-admin-access-bottom">Karina Sarte · Espaço de gestão</p>
      </main>
    </div>
  );

  return (
    <div className="ks-admin-workspace">
      <a href="#admin-content" className="ks-admin-skip">Ir para o conteúdo</a>
      <aside className="ks-admin-sidebar">
        {brand}
        <span className="ks-admin-nav-label">GALERIAS</span>
        <nav aria-label="Navegação do painel">
          <NavLink to="/admin" end><LayoutDashboard size={18} /> Visão geral</NavLink>
          <NavLink to="/admin/galeria/portfolio"><Images size={18} /> Portfólio</NavLink>
          <NavLink to="/admin/galeria/flash"><Sparkles size={18} /> Flash tattoos</NavLink>
          <NavLink to="/admin/galeria/produtos"><ShoppingBag size={18} /> Produtos</NavLink>
        </nav>
        <span className="ks-admin-nav-label">CONTA</span>
        <nav aria-label="Conta">
          {user.role === "owner" && <NavLink to="/admin/usuarios"><Users size={18} /> Usuários</NavLink>}
          <NavLink to="/admin/senha"><KeyRound size={18} /> Segurança</NavLink>
        </nav>
        <div className="ks-admin-sidebar-bottom">
          <a href="/">Abrir o site <ArrowUpRight size={16} /></a>
          <div className="ks-admin-profile"><span className="ks-admin-avatar">{user.email.slice(0, 1).toUpperCase()}</span><div><strong>{user.email}</strong><small>{user.role === "owner" ? "Responsável" : "Editor"}</small></div></div>
          <button onClick={() => void logout()}><LogOut size={16} /> Sair da conta</button>
        </div>
      </aside>
      <div className="ks-admin-workspace-main">
        <header className="ks-admin-topbar"><span>Painel <span aria-hidden="true">/</span> <strong>{crumb}</strong></span><span className="ks-admin-session"><span /> Sessão ativa</span></header>
        <main id="admin-content">{children}</main>
        <footer className="ks-admin-workspace-footer">Karina Sarte <span>Feito para cuidar do que é seu.</span></footer>
      </div>
    </div>
  );
}
