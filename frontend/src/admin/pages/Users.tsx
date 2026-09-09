import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ApiError,
  createUser,
  listUsers,
  setUserActive,
  type AdminRole,
  type ListedUser,
} from "../auth/api";
import { useAuth } from "../auth/AuthContext";

function formatDate(value: string | null) {
  if (!value) return "Nunca";
  try {
    return new Date(value).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const data = await listUsers();
      setUsers(data.users);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setTempPassword(null);
    setCopied(false);
    try {
      const result = await createUser(email.trim(), role);
      setTempPassword(result.temporaryPassword);
      setEmail("");
      setRole("editor");
      await reload();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Não foi possível criar o usuário.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(target: ListedUser) {
    if (target.id === user?.id) return;
    setBusyId(target.id);
    setError(null);
    try {
      await setUserActive(target.id, !target.active);
      await reload();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Não foi possível atualizar o usuário.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyTemp() {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
    } catch {
      setCopied(false);
      setError("Não foi possível copiar. Selecione a senha e copie manualmente.");
    }
  }

  return (
    <div className="ks-admin-shell">
      <header className="ks-admin-brand">
        <p className="ks-admin-kicker">
          <Link to="/admin" className="ks-admin-back">
            ← Painel
          </Link>
        </p>
        <h1 className="ks-admin-title">Usuários</h1>
        <p className="ks-admin-lead">
          Crie acessos com senha temporária. A pessoa troca a senha no primeiro login.
        </p>
      </header>

      <section className="ks-admin-panel" aria-labelledby="create-user-heading">
        <h2 id="create-user-heading" className="ks-admin-section-title">
          Novo acesso
        </h2>
        <form className="ks-admin-form" onSubmit={onCreate} noValidate>
          <label className="ks-admin-field">
            <span>Email</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </label>
          <label className="ks-admin-field">
            <span>Papel</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value === "owner" ? "owner" : "editor")}
              disabled={submitting}
            >
              <option value="editor">Editor — edita o site</option>
              <option value="owner">Responsável — também gerencia usuários</option>
            </select>
          </label>
          <button type="submit" className="ks-admin-btn" disabled={submitting}>
            {submitting ? "Criando…" : "Criar usuário"}
          </button>
        </form>

        {tempPassword ? (
          <div className="ks-admin-temp" role="status">
            <p className="ks-admin-temp-label">Senha temporária (só aparece agora)</p>
            <p className="ks-admin-temp-value">{tempPassword}</p>
            <p className="ks-admin-temp-note">
              Copie e envie por fora do sistema (WhatsApp, por exemplo). Ela não será mostrada de
              novo.
            </p>
            <button type="button" className="ks-admin-btn ks-admin-btn--secondary" onClick={() => void copyTemp()}>
              {copied ? "Copiada" : "Copiar senha"}
            </button>
          </div>
        ) : null}
      </section>

      <section className="ks-admin-panel" aria-labelledby="users-list-heading">
        <h2 id="users-list-heading" className="ks-admin-section-title">
          Contas
        </h2>
        {loading ? <p className="ks-admin-muted">Carregando…</p> : null}
        {!loading && users.length === 0 ? (
          <p className="ks-admin-muted">Nenhum usuário ainda.</p>
        ) : null}
        <ul className="ks-admin-user-list">
          {users.map((item) => {
            const isSelf = item.id === user?.id;
            return (
              <li key={item.id} className={`ks-admin-user-row${!item.active ? " is-inactive" : ""}`}>
                <div>
                  <p className="ks-admin-user-email">{item.email}</p>
                  <p className="ks-admin-user-meta">
                    {item.role === "owner" ? "Responsável" : "Editor"}
                    {" · "}
                    {item.active ? "Ativo" : "Desativado"}
                    {" · "}
                    Último acesso: {formatDate(item.lastLoginAt)}
                  </p>
                </div>
                <button
                  type="button"
                  className="ks-admin-ghost-btn"
                  disabled={isSelf || busyId === item.id}
                  title={isSelf ? "Você não pode desativar a própria conta" : undefined}
                  onClick={() => void toggleActive(item)}
                >
                  {isSelf
                    ? "Você"
                    : busyId === item.id
                      ? "…"
                      : item.active
                        ? "Desativar"
                        : "Reativar"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {error ? (
        <p className="ks-admin-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
