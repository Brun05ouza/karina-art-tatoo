import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ChevronDown,
  ChevronUp,
  Images,
  LinkIcon,
  Pencil,
  ShoppingBag,
  Trash2,
  Youtube,
} from "lucide-react";
import {
  ApiError,
  createBioLink,
  deleteBioLink,
  listBioLinks,
  patchBioLink,
  reorderBioLinks,
  type BioIconId,
  type BioLinkItem,
} from "../auth/api";

const ICONS: { id: BioIconId; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "portfolio", label: "Portfólio" },
  { id: "produtos", label: "Produtos" },
  { id: "link", label: "Link" },
];

type Mode = { type: "list" } | { type: "create" } | { type: "edit"; item: BioLinkItem };

type FormState = {
  label: string;
  url: string;
  icon: BioIconId;
  featured: boolean;
  published: boolean;
};

const emptyForm = (): FormState => ({
  label: "",
  url: "",
  icon: "link",
  featured: false,
  published: true,
});

function fromItem(item: BioLinkItem): FormState {
  return {
    label: item.label,
    url: item.url,
    icon: item.icon ?? "link",
    featured: item.featured,
    published: item.published,
  };
}

function PreviewIcon({ icon }: { icon: BioIconId }) {
  if (icon === "whatsapp") return <WhatsAppGlyph />;
  if (icon === "tiktok") return <TikTokGlyph />;
  if (icon === "instagram") return <InstagramGlyph />;
  if (icon === "youtube") return <Youtube size={16} />;
  if (icon === "portfolio") return <Images size={16} />;
  if (icon === "produtos") return <ShoppingBag size={16} />;
  return <LinkIcon size={16} />;
}

export function BioLinksPage() {
  const [items, setItems] = useState<BioLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<{ label?: string; url?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const data = await listBioLinks();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os links.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(t);
  }, [notice]);

  function openCreate() {
    setForm(emptyForm());
    setFieldErrors({});
    setMode({ type: "create" });
  }

  function openEdit(item: BioLinkItem) {
    setForm(fromItem(item));
    setFieldErrors({});
    setMode({ type: "edit", item });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const nextErrors: { label?: string; url?: string } = {};
    if (!form.label.trim()) nextErrors.label = "Escreva o rótulo.";
    if (!form.url.trim()) nextErrors.url = "Informe a URL.";
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setBusy(true);
    setFieldErrors({});
    try {
      const body = {
        label: form.label.trim(),
        url: form.url.trim(),
        icon: form.icon,
        featured: form.featured,
        published: form.published,
      };
      if (mode.type === "edit") {
        await patchBioLink(mode.item.id, body);
        setNotice("Link atualizado.");
      } else {
        await createBioLink(body);
        setNotice("Link adicionado.");
      }
      setMode({ type: "list" });
      setLoading(true);
      await reload();
    } catch (err) {
      setFieldErrors({
        form: err instanceof ApiError ? err.message : "Não foi possível salvar.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const index = items.findIndex((i) => i.id === id);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= items.length) return;
    const ids = items.map((i) => i.id);
    const tmp = ids[index]!;
    ids[index] = ids[next]!;
    ids[next] = tmp;
    setBusyId(id);
    setError(null);
    try {
      await reorderBioLinks(ids);
      await reload();
      setNotice("Ordem atualizada.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível reordenar.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: BioLinkItem) {
    const ok = window.confirm(`Remover “${item.label}”? Essa ação não dá para desfazer.`);
    if (!ok) return;
    setBusyId(item.id);
    setError(null);
    try {
      await deleteBioLink(item.id);
      await reload();
      setNotice(`“${item.label}” removido.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível remover.");
    } finally {
      setBusyId(null);
    }
  }

  if (mode.type === "create" || mode.type === "edit") {
    return (
      <div className="ks-admin-shell">
        <header className="ks-admin-brand">
          <p className="ks-admin-kicker">
            <button type="button" className="ks-admin-back" onClick={() => setMode({ type: "list" })}>
              ← Links da bio
            </button>
          </p>
          <h1 className="ks-admin-title">{mode.type === "create" ? "Novo link" : "Editar link"}</h1>
          <p className="ks-admin-lead">Botões que aparecem no link do Instagram.</p>
        </header>

        <form className="ks-admin-form ks-bio-form" onSubmit={(e) => void onSubmit(e)} noValidate>
          <div className="ks-bio-form-layout">
            <div className="ks-bio-preview-panel" aria-label="Prévia do botão">
              <p className="ks-admin-kicker">Prévia</p>
              <div className={`ks-bio-preview-btn${form.featured ? " is-featured" : ""}`}>
                <span className="ks-bio-preview-icon">
                  <PreviewIcon icon={form.icon} />
                </span>
                <span>{form.label.trim() || "Rótulo do botão"}</span>
              </div>
              <p className="ks-bio-preview-note">Assim o botão aparece na página /bio.</p>
            </div>

            <div className="ks-bio-fields">
              <label className={`ks-admin-field ks-admin-field--title${fieldErrors.label ? " has-error" : ""}`}>
                <span>Rótulo</span>
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  maxLength={60}
                  disabled={busy}
                  required
                />
                {fieldErrors.label ? <span className="ks-admin-field-error">{fieldErrors.label}</span> : null}
              </label>

              <label className={`ks-admin-field${fieldErrors.url ? " has-error" : ""}`}>
                <span>URL</span>
                <input
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://… ou /portfolio"
                  disabled={busy}
                  required
                />
                {fieldErrors.url ? <span className="ks-admin-field-error">{fieldErrors.url}</span> : null}
              </label>

              <fieldset className="ks-bio-icon-field">
                <legend>Ícone</legend>
                <div className="ks-bio-icon-grid" role="radiogroup" aria-label="Ícone do botão">
                  {ICONS.map((opt) => (
                    <label key={opt.id} className={`ks-bio-icon-option${form.icon === opt.id ? " is-active" : ""}`}>
                      <input
                        type="radio"
                        name="bio-icon"
                        value={opt.id}
                        checked={form.icon === opt.id}
                        onChange={() => setForm((f) => ({ ...f, icon: opt.id }))}
                        disabled={busy}
                      />
                      <PreviewIcon icon={opt.id} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="ks-gallery-check">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  disabled={busy}
                />
                <span>Destaque (botão escuro)</span>
              </label>

              <label className="ks-gallery-check">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  disabled={busy}
                />
                <span>Publicado no site</span>
              </label>

              {fieldErrors.form ? (
                <p className="ks-admin-field-error" role="alert">
                  {fieldErrors.form}
                </p>
              ) : null}

              <div className="ks-gallery-form-actions">
                <button type="submit" className="ks-admin-btn" disabled={busy}>
                  {busy ? "Salvando…" : mode.type === "edit" ? "Salvar alterações" : "Adicionar"}
                </button>
                <button
                  type="button"
                  className="ks-admin-btn ks-admin-btn--secondary"
                  onClick={() => setMode({ type: "list" })}
                  disabled={busy}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="ks-admin-shell">
      <header className="ks-admin-brand ks-gallery-header">
        <div>
          <p className="ks-admin-kicker">Link da bio</p>
          <h1 className="ks-admin-title">Links da bio</h1>
          <p className="ks-admin-lead">Os botões do Instagram — o resto da página /bio continua no código.</p>
        </div>
        <button type="button" className="ks-admin-btn ks-gallery-add" onClick={openCreate}>
          Adicionar link
        </button>
      </header>

      {notice ? (
        <p className="ks-admin-toast" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="ks-admin-error" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? <p className="ks-admin-muted">Carregando…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="ks-gallery-empty">
          <img src="/assets/brand/star-karina-outline.webp" alt="" className="ks-gallery-empty-star" />
          <p>Nenhum link ainda.</p>
          <button type="button" className="ks-admin-btn" onClick={openCreate}>
            Adicionar o primeiro
          </button>
        </div>
      ) : null}

      <ul className="ks-bio-list">
        {items.map((item, index) => (
          <li key={item.id} className={`ks-bio-row${!item.published ? " is-hidden" : ""}`}>
            <div className={`ks-bio-preview-btn${item.featured ? " is-featured" : ""}`}>
              <span className="ks-bio-preview-icon">
                <PreviewIcon icon={item.icon ?? "link"} />
              </span>
              <span>{item.label}</span>
            </div>
            <p className="ks-bio-row-url">{item.url}</p>
            <div className="ks-gallery-tile-toolbar">
              <div className="ks-gallery-order">
                <button
                  type="button"
                  className="ks-gallery-icon-btn"
                  aria-label="Subir"
                  disabled={index === 0 || busyId === item.id}
                  onClick={() => void move(item.id, -1)}
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  type="button"
                  className="ks-gallery-icon-btn"
                  aria-label="Descer"
                  disabled={index === items.length - 1 || busyId === item.id}
                  onClick={() => void move(item.id, 1)}
                >
                  <ChevronDown size={18} />
                </button>
              </div>
              <button
                type="button"
                className="ks-gallery-edit-btn"
                disabled={busyId === item.id}
                onClick={() => openEdit(item)}
              >
                <Pencil size={15} /> Editar
              </button>
              <button
                type="button"
                className="ks-gallery-icon-btn ks-gallery-icon-btn--danger"
                aria-label={`Remover ${item.label}`}
                disabled={busyId === item.id}
                onClick={() => void remove(item)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.522 5.851L.054 23.25a.75.75 0 0 0 .916.916l5.453-1.474A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.964-1.363l-.357-.214-3.685.997.985-3.594-.234-.371A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}

function TikTokGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.2 8.2 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1.01-.15z" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
