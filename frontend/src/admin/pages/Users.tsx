import { FormEvent, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Search, UserPlus, Users, CheckCircle2, Trash2 } from "lucide-react";
import {
  ApiError,
  createUser,
  deleteUser,
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
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ListedUser | null>(null);
  const [deleteEmailCheck, setDeleteEmailCheck] = useState("");

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

  function openDelete(target: ListedUser) {
    if (target.id === user?.id) return;
    setConfirmDelete(target);
    setDeleteEmailCheck("");
    setError(null);
  }

  function closeDelete() {
    setConfirmDelete(null);
    setDeleteEmailCheck("");
  }

  async function confirmDeleteUser() {
    if (!confirmDelete) return;
    if (deleteEmailCheck.trim().toLowerCase() !== confirmDelete.email.toLowerCase()) {
      setError("Digite o email completo para confirmar a exclusão.");
      return;
    }
    setBusyId(confirmDelete.id);
    setError(null);
    try {
      await deleteUser(confirmDelete.id);
      closeDelete();
      await reload();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Não foi possível excluir o usuário.");
    } finally {
      setBusyId(null);
    }
  }

  const activeOwners = users.filter((u) => u.role === "owner" && u.active).length;
  const filteredUsers = users.filter(
    (item) =>
      item.email.toLowerCase().includes(query.trim().toLowerCase()) &&
      (status === "all" || (status === "active" ? item.active : !item.active)),
  );

  return (
    <div className="ks-admin-shell">
      <header className="ks-admin-brand">
        <p className="ks-admin-kicker">EQUIPE & ACESSOS</p>
        <h1 className="ks-admin-title">Usuários</h1>
        <p className="ks-admin-lead">
          Um espaço para cada pessoa que cuida do ateliê com você.
        </p>
      </header>

      <div className="ks-admin-stats" aria-label="Resumo de usuários">
        <div>
          <Users size={19} />
          <strong>{loading ? "—" : users.length}</strong>
          <span>Contas no ateliê</span>
        </div>
        <div>
          <CheckCircle2 size={19} />
          <strong>{loading ? "—" : users.filter((item) => item.active).length}</strong>
          <span>Acessos ativos</span>
        </div>
      </div>
      {error && <p className="ks-admin-error" role="alert">{error}</p>}
      <div className="ks-admin-users-layout">
        <section className="ks-admin-panel ks-admin-create-panel" aria-labelledby="create-user-heading">
          <h2 id="create-user-heading" className="ks-admin-section-title">
            <UserPlus size={20} /> Novo acesso
          </h2>
          <p className="ks-admin-panel-description">
            A pessoa recebe uma senha temporária e cria a própria senha no primeiro acesso.
          </p>
          <form className="ks-admin-form" onSubmit={onCreate}>
            <label className="ks-admin-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="pessoa@exemplo.com"
                inputMode="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </label>
            <label className="ks-admin-field">
              <span>Tipo de acesso</span>
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
              <button
                type="button"
                className="ks-admin-btn ks-admin-btn--secondary"
                onClick={() => void copyTemp()}
              >
                {copied ? "Copiada" : "Copiar senha"}
              </button>
            </div>
          ) : null}
        </section>

        <section className="ks-admin-panel ks-admin-accounts-panel" aria-labelledby="users-list-heading">
          <h2 id="users-list-heading" className="ks-admin-section-title">
            Contas <span className="ks-admin-count">{users.length}</span>
          </h2>
          <div className="ks-admin-list-tools">
            <label className="ks-admin-search">
              <Search size={17} />
              <input
                aria-label="Buscar usuário por email"
                placeholder="Buscar por email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="Filtrar por status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Desativados</option>
            </select>
          </div>
          {!loading && users.length > 0 && filteredUsers.length === 0 && (
            <p className="ks-admin-empty">Nenhuma conta encontrada. Tente outro email ou filtro.</p>
          )}
          {loading ? <p className="ks-admin-muted">Carregando…</p> : null}
          {!loading && users.length === 0 ? (
            <p className="ks-admin-muted">Nenhum usuário ainda.</p>
          ) : null}
          <ul className="ks-admin-user-list">
            {filteredUsers.map((item) => {
              const isSelf = item.id === user?.id;
              const isLastOwner = item.role === "owner" && item.active && activeOwners <= 1;
              return (
                <li
                  key={item.id}
                  className={`ks-admin-user-row${!item.active ? " is-inactive" : ""}`}
                >
                  <div className="ks-admin-user-info">
                    <p className="ks-admin-user-email">{item.email}</p>
                    <p className="ks-admin-user-meta">
                      {item.role === "owner" ? "Responsável" : "Editor"}
                      <span className={`ks-admin-status${item.active ? " is-active" : ""}`}>
                        {item.active ? "Ativo" : "Desativado"}
                      </span>
                    </p>
                    <p className="ks-admin-user-last">Último acesso: {formatDate(item.lastLoginAt)}</p>
                  </div>
                  <div className="ks-admin-user-actions">
                    <button
                      type="button"
                      className="ks-admin-ghost-btn"
                      disabled={isSelf || busyId !== null || (isLastOwner && item.active)}
                      aria-label={
                        isSelf
                          ? "Sua conta"
                          : `${item.active ? "Desativar" : "Reativar"} ${item.email}`
                      }
                      title={
                        isSelf
                          ? "Você não pode desativar a própria conta"
                          : isLastOwner && item.active
                            ? "Não dá para desativar o último responsável"
                            : undefined
                      }
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
                    {!isSelf ? (
                      <button
                        type="button"
                        className="ks-admin-ghost-btn ks-admin-ghost-btn--danger"
                        disabled={busyId !== null || (isLastOwner && item.active)}
                        aria-label={`Excluir ${item.email}`}
                        title={
                          isLastOwner && item.active
                            ? "Não dá para excluir o último responsável ativo"
                            : `Excluir ${item.email}`
                        }
                        onClick={() => openDelete(item)}
                      >
                        <Trash2 size={16} aria-hidden />
                        Excluir
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {confirmDelete
        ? createPortal(
            <div className="ks-admin-dialog-backdrop" role="presentation" onClick={closeDelete}>
              <div
                className="ks-admin-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="ks-user-delete-title"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="ks-user-delete-title">Excluir conta?</h2>
                <p>
                  Isso remove permanentemente o acesso de{" "}
                  <strong>{confirmDelete.email}</strong>. Não dá para desfazer.
                </p>
                <label className="ks-admin-field">
                  <span>Digite o email para confirmar</span>
                  <input
                    type="email"
                    value={deleteEmailCheck}
                    onChange={(e) => setDeleteEmailCheck(e.target.value)}
                    placeholder={confirmDelete.email}
                    autoComplete="off"
                    autoFocus
                  />
                </label>
                <div className="ks-admin-dialog-actions">
                  <button type="button" className="ks-admin-btn ks-admin-btn--secondary" onClick={closeDelete}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="ks-admin-btn ks-admin-btn--danger"
                    disabled={
                      busyId === confirmDelete.id ||
                      deleteEmailCheck.trim().toLowerCase() !== confirmDelete.email.toLowerCase()
                    }
                    onClick={() => void confirmDeleteUser()}
                  >
                    {busyId === confirmDelete.id ? "Excluindo…" : "Excluir definitivamente"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
