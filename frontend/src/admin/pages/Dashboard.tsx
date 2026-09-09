import { Link } from "react-router";
import { useAuth } from "../auth/AuthContext";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="ks-admin-shell">
      <header className="ks-admin-brand">
        <p className="ks-admin-kicker">Painel</p>
        <h1 className="ks-admin-title">Olá</h1>
        <p className="ks-admin-lead">
          Você entrou como <strong>{user?.email}</strong>
          {user?.role === "owner" ? " (responsável)" : ""}.
        </p>
      </header>

      <nav className="ks-admin-nav-cards" aria-label="Atalhos">
        <Link className="ks-admin-card-link" to="/admin/senha">
          <span className="ks-admin-card-title">Trocar senha</span>
          <span className="ks-admin-card-text">Atualize a senha da sua conta.</span>
        </Link>
        {user?.role === "owner" ? (
          <Link className="ks-admin-card-link" to="/admin/usuarios">
            <span className="ks-admin-card-title">Usuários</span>
            <span className="ks-admin-card-text">Criar acessos e ativar ou desativar contas.</span>
          </Link>
        ) : null}
      </nav>

      <p className="ks-admin-footnote">
        <Link to="/">Ver o site</Link>
        {" · "}
        <button type="button" className="ks-admin-text-btn" onClick={() => void logout()}>
          Sair
        </button>
      </p>
    </div>
  );
}
