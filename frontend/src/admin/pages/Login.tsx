import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { ApiError } from "../auth/api";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { user, loading, login, mustChangePassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={mustChangePassword ? "/admin/senha" : "/admin"} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Não foi possível entrar. Tente de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ks-admin-shell ks-admin-shell--narrow">
      <header className="ks-admin-brand">
        <p className="ks-admin-kicker">Área interna</p>
        <h1 className="ks-admin-title">Entrar</h1>
        <p className="ks-admin-lead">
          Use o email e a senha que você recebeu. No primeiro acesso, vamos pedir uma senha nova.
        </p>
      </header>

      <form className="ks-admin-form" onSubmit={onSubmit} noValidate>
        <label className="ks-admin-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
          />
        </label>

        <label className="ks-admin-field">
          <span>Senha</span>
          <div className="ks-admin-password-row">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
            />
            <button
              type="button"
              className="ks-admin-ghost-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </label>

        {error ? (
          <p className="ks-admin-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="ks-admin-btn" disabled={submitting}>
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="ks-admin-footnote">
        <Link to="/">Voltar ao site</Link>
      </p>
    </div>
  );
}
