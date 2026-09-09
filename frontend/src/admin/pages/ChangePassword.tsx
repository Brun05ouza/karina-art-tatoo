import { FormEvent, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { ApiError } from "../auth/api";
import { useAuth } from "../auth/AuthContext";
import {
  checkPasswordHints,
  PASSWORD_EXAMPLE,
  PASSWORD_TIPS,
} from "../auth/password-hints";

export function ChangePasswordPage() {
  const { user, loading, mustChangePassword, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hint = useMemo(
    () => checkPasswordHints(newPassword, { email: user?.email }),
    [newPassword, user?.email],
  );

  if (!loading && !user) {
    return <Navigate to="/admin/login" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirm) {
      setError("As duas senhas novas não são iguais.");
      return;
    }
    if (!hint.ok) {
      setError(hint.message);
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({
        currentPassword: mustChangePassword ? undefined : currentPassword,
        newPassword,
      });
      navigate("/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Não foi possível salvar a senha. Tente de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ks-admin-shell ks-admin-shell--narrow">
      <header className="ks-admin-brand">
        <p className="ks-admin-kicker">
          {mustChangePassword ? "Primeiro acesso" : "Sua conta"}
        </p>
        <h1 className="ks-admin-title">
          {mustChangePassword ? "Crie uma senha nova" : "Trocar senha"}
        </h1>
        <p className="ks-admin-lead">
          {mustChangePassword
            ? "A senha temporária só serve uma vez. Escolha uma frase fácil de lembrar e difícil de adivinhar."
            : "Depois de trocar, você continua conectada neste aparelho."}
        </p>
      </header>

      <aside className="ks-admin-tips" aria-label="Dicas de senha">
        <p className="ks-admin-tips-title">Como escolher bem</p>
        <ul>
          {PASSWORD_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="ks-admin-example">
          Exemplo: <em>{PASSWORD_EXAMPLE}</em>
        </p>
      </aside>

      <form className="ks-admin-form" onSubmit={onSubmit} noValidate>
        {!mustChangePassword ? (
          <label className="ks-admin-field">
            <span>Senha atual</span>
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </label>
        ) : null}

        <label className="ks-admin-field">
          <span>Nova senha</span>
          <div className="ks-admin-password-row">
            <input
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={submitting}
            />
            <button
              type="button"
              className="ks-admin-ghost-btn"
              onClick={() => setShow((v) => !v)}
              aria-pressed={show}
            >
              {show ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {newPassword ? (
            <span className={hint.ok ? "ks-admin-hint-ok" : "ks-admin-hint-bad"}>
              {hint.ok ? "Essa senha parece boa." : hint.message}
            </span>
          ) : null}
        </label>

        <label className="ks-admin-field">
          <span>Repetir nova senha</span>
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={submitting}
          />
        </label>

        {error ? (
          <p className="ks-admin-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="ks-admin-btn" disabled={submitting}>
          {submitting ? "Salvando…" : "Salvar senha"}
        </button>
      </form>

      <p className="ks-admin-footnote">
        <button type="button" className="ks-admin-text-btn" onClick={() => void logout()}>
          Sair
        </button>
      </p>
    </div>
  );
}
