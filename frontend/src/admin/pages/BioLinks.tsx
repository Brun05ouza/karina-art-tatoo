import { useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent } from "react";
import { ChevronDown, ChevronUp, Eye, Pencil, Trash2 } from "lucide-react";
import { BioLinkAction, bioActionIcon } from "../../app/components/BioLinkAction";
import {
  ApiError,
  createBioLink,
  deleteBioLink,
  getAdminSettings,
  listBioLinks,
  patchAdminSettings,
  patchBioLink,
  reorderBioLinks,
  type BioIconId,
  type BioKindId,
  type BioLinkItem,
} from "../auth/api";
import "../bio-preview.css";

const ICONS: { id: BioIconId; label: string }[] = [
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "portfolio", label: "Portfólio" },
  { id: "produtos", label: "Produtos" },
  { id: "link", label: "Link" },
];

const KINDS: { id: BioKindId; label: string; hint: string }[] = [
  { id: "whatsapp", label: "WhatsApp", hint: "Só a mensagem — o link usa o número do site" },
  { id: "external", label: "Abre fora", hint: "URL completa (http/https)" },
  { id: "internal", label: "Página do site", hint: "Caminho como /portfolio" },
];

type Mode = { type: "list" } | { type: "create" } | { type: "edit"; item: BioLinkItem };

type FormState = {
  label: string;
  kind: BioKindId;
  url: string;
  message: string;
  icon: BioIconId;
  featured: boolean;
  published: boolean;
};

type PhoneStatus = "idle" | "saving" | "saved";

const emptyForm = (): FormState => ({
  label: "",
  kind: "external",
  url: "",
  message: "",
  icon: "link",
  featured: false,
  published: true,
});

function normalizeBrandLabel(label: string): string {
  const t = label.trim();
  if (/^youtube$/i.test(t)) return "YouTube";
  if (/^tiktok$/i.test(t)) return "TikTok";
  if (/^instagram$/i.test(t)) return "Instagram";
  return label;
}

function fromItem(item: BioLinkItem): FormState {
  return {
    label: normalizeBrandLabel(item.label),
    kind: item.kind || "external",
    url: item.url || "",
    message: item.message || "",
    icon: item.icon ?? (item.kind === "whatsapp" ? "whatsapp" : "link"),
    featured: item.featured,
    published: item.published,
  };
}

function itemIcon(item: BioLinkItem): string {
  return item.icon || (item.kind === "whatsapp" ? "whatsapp" : "link");
}

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** DDD + número a partir do E.164 BR (55…). */
function nationalDigits(full: string): string {
  const d = digitsOnly(full);
  return d.startsWith("55") ? d.slice(2) : d;
}

function formatNational(digits: string): string {
  const d = digitsOnly(digits).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function destinationOf(item: BioLinkItem): { text: string; title: string; broken: boolean } {
  if (item.kind === "whatsapp") {
    const msg = item.message?.trim();
    if (!msg) {
      return { text: "Sem mensagem inicial", title: "WhatsApp sem mensagem inicial", broken: false };
    }
    const quoted = `"${msg}"`;
    return { text: quoted, title: quoted, broken: false };
  }

  if (item.kind === "internal") {
    const url = item.url?.trim() || "";
    if (!url) return { text: "Caminho ausente", title: "Sem destino", broken: true };
    return { text: url, title: url, broken: false };
  }

  const url = item.url?.trim() || "";
  if (!url) return { text: "URL ausente", title: "Sem destino", broken: true };
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { text: "URL inválida", title: url, broken: true };
    }
    const host = u.hostname.replace(/^www\./i, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    const display = `${host}${path}${u.search}`;
    return { text: display || host, title: url, broken: false };
  } catch {
    return { text: "URL inválida", title: url, broken: true };
  }
}

function kindChipLabel(kind: BioKindId): string {
  if (kind === "whatsapp") return "WhatsApp";
  if (kind === "internal") return "página do site";
  return "abre fora";
}

function BioLivePreview({
  items,
  editId,
  draft,
}: {
  items: BioLinkItem[];
  editId?: string;
  draft?: FormState | null;
}) {
  const buttons = useMemo(() => {
    const out: { key: string; label: string; icon: string; featured: boolean }[] = [];

    for (const item of items) {
      if (editId && item.id === editId) {
        if (draft?.published) {
          out.push({
            key: item.id,
            label: normalizeBrandLabel(draft.label.trim() || "Rótulo do botão"),
            icon: draft.kind === "whatsapp" ? "whatsapp" : draft.icon,
            featured: draft.featured,
          });
        }
        continue;
      }
      if (!item.published) continue;
      out.push({
        key: item.id,
        label: normalizeBrandLabel(item.label),
        icon: itemIcon(item),
        featured: item.featured,
      });
    }

    if (draft && !editId && draft.published) {
      out.push({
        key: "draft",
        label: normalizeBrandLabel(draft.label.trim() || "Rótulo do botão"),
        icon: draft.kind === "whatsapp" ? "whatsapp" : draft.icon,
        featured: draft.featured,
      });
    }

    return out;
  }, [items, editId, draft]);

  return (
    <div className="ks-bio-live-preview ks-link-bio-page--lilac" aria-label="Simulação dos botões da bio">
      <p className="ks-admin-kicker ks-bio-preview-kicker">Simulação · /bio</p>
      <div className="ks-link-bio-links">
        {buttons.length === 0 ? (
          <p className="ks-bio-preview-empty">
            Sem botões publicados. No Instagram, a bio ficaria sem nenhum link clicável.
          </p>
        ) : (
          buttons.map((b) => (
            <BioLinkAction
              key={b.key}
              preview
              button={{ label: b.label, icon: b.icon, featured: b.featured }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function BioLinksPage() {
  const [items, setItems] = useState<BioLinkItem[]>([]);
  const [phone, setPhone] = useState("");
  const [phoneNational, setPhoneNational] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<{
    label?: string;
    url?: string;
    message?: string;
    phone?: string;
    form?: string;
  }>({});
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>("idle");
  const [showPreview, setShowPreview] = useState(false);

  const phoneDirty =
    digitsOnly(`55${digitsOnly(phoneNational)}`) !== digitsOnly(phone) &&
    digitsOnly(phoneNational).length > 0;

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [links, settings] = await Promise.all([listBioLinks(), getAdminSettings()]);
      setItems(links.items);
      setPhone(settings.whatsappPhone);
      setPhoneNational(formatNational(nationalDigits(settings.whatsappPhone)));
      setPhoneStatus("idle");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar.");
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

  useEffect(() => {
    if (phoneStatus !== "saved") return;
    const t = window.setTimeout(() => setPhoneStatus("idle"), 2200);
    return () => window.clearTimeout(t);
  }, [phoneStatus]);

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

  async function savePhone() {
    if (phoneBusy || mode.type !== "list") return;
    const national = digitsOnly(phoneNational);
    if (!national) {
      setFieldErrors((e) => ({ ...e, phone: "Informe DDD e número." }));
      return;
    }
    const full = `55${national}`;
    if (full === digitsOnly(phone)) {
      setPhoneStatus("idle");
      return;
    }

    setPhoneBusy(true);
    setPhoneStatus("saving");
    setFieldErrors((e) => ({ ...e, phone: undefined }));
    try {
      const res = await patchAdminSettings({ whatsappPhone: full });
      setPhone(res.whatsappPhone);
      setPhoneNational(formatNational(nationalDigits(res.whatsappPhone)));
      setPhoneStatus("saved");
    } catch (err) {
      setPhoneStatus("idle");
      setFieldErrors((e) => ({
        ...e,
        phone: err instanceof ApiError ? err.message : "Não foi possível salvar o número.",
      }));
    } finally {
      setPhoneBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const nextErrors: { label?: string; url?: string } = {};
    if (!form.label.trim()) nextErrors.label = "Escreva o rótulo.";
    if (form.kind !== "whatsapp" && !form.url.trim()) {
      nextErrors.url = form.kind === "internal" ? "Informe o caminho." : "Informe a URL.";
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setBusy(true);
    setFieldErrors({});
    try {
      const body: Record<string, unknown> = {
        label: normalizeBrandLabel(form.label.trim()),
        kind: form.kind,
        featured: form.featured,
        published: form.published,
        icon: form.kind === "whatsapp" ? "whatsapp" : form.icon,
      };
      if (form.kind === "whatsapp") {
        body.message = form.message.trim() || null;
        body.url = "";
      } else {
        body.url = form.url.trim();
        body.message = null;
      }

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

  async function move(id: string, dir: -1 | 1, e?: MouseEvent) {
    e?.stopPropagation();
    const index = items.findIndex((i) => i.id === id);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= items.length) return;
    const ids = items.map((i) => i.id);
    const tmp = ids[index]!;
    ids[index] = ids[next]!;
    ids[next] = tmp;
    setBusyId(id);
    setError(null);
    setItems(ids.map((xid) => items.find((i) => i.id === xid)!).filter(Boolean));
    try {
      await reorderBioLinks(ids);
      setNotice("Ordem atualizada.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível reordenar.");
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: BioLinkItem, e?: MouseEvent) {
    e?.stopPropagation();
    const ok = window.confirm(`Remover “${normalizeBrandLabel(item.label)}”? Essa ação não dá para desfazer.`);
    if (!ok) return;
    setBusyId(item.id);
    setError(null);
    try {
      await deleteBioLink(item.id);
      await reload();
      setNotice(`“${normalizeBrandLabel(item.label)}” removido.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível remover.");
    } finally {
      setBusyId(null);
    }
  }

  const editId = mode.type === "edit" ? mode.item.id : undefined;
  const draft = mode.type === "list" ? null : form;

  const phoneStatusLabel =
    phoneStatus === "saving" ? "Salvando…" : phoneStatus === "saved" ? "Salvo" : null;

  const phoneBlock = (
    <section className="ks-bio-phone-card">
      <h2 className="ks-bio-phone-title">WhatsApp do site</h2>
      <p className="ks-bio-phone-lead">
        Um único número para a bio, orçamento, flash, produtos, rodapé e botão flutuante.
      </p>
      <div className="ks-bio-phone-row">
        <label className={`ks-admin-field ks-bio-phone-field${fieldErrors.phone ? " has-error" : ""}`}>
          <span>Celular com DDD</span>
          <span className="ks-bio-phone-input">
            <span className="ks-bio-phone-prefix" aria-hidden="true">
              +55
            </span>
            <input
              value={phoneNational}
              onChange={(e) => {
                setPhoneNational(formatNational(e.target.value));
                setPhoneStatus("idle");
                setFieldErrors((err) => ({ ...err, phone: undefined }));
              }}
              onBlur={() => {
                if (phoneDirty && mode.type === "list") void savePhone();
              }}
              placeholder="(21) 99072-4477"
              disabled={phoneBusy || mode.type !== "list"}
              inputMode="tel"
              autoComplete="tel-national"
              aria-describedby="ks-bio-phone-ddi"
            />
          </span>
          <span id="ks-bio-phone-ddi" className="ks-admin-muted">
            DDI do Brasil já incluído.
          </span>
          {fieldErrors.phone ? <span className="ks-admin-field-error">{fieldErrors.phone}</span> : null}
          {phoneStatusLabel && !fieldErrors.phone ? (
            <span className="ks-bio-phone-status" role="status">
              {phoneStatusLabel}
            </span>
          ) : null}
        </label>
        {mode.type === "list" ? (
          <button
            type="button"
            className="ks-admin-btn ks-admin-btn--secondary"
            disabled={phoneBusy || !phoneDirty}
            onClick={() => void savePhone()}
          >
            {phoneBusy ? "Salvando…" : "Salvar número"}
          </button>
        ) : null}
      </div>
    </section>
  );

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
          <p className="ks-admin-lead">Escolha o tipo — a URL do WhatsApp é montada pelo sistema.</p>
        </header>

        {phoneBlock}

        <div className="ks-bio-workspace">
          <form className="ks-admin-form ks-bio-form" onSubmit={(e) => void onSubmit(e)} noValidate>
            <div className="ks-bio-fields">
              <fieldset className="ks-bio-kind-field">
                <legend>Tipo de link</legend>
                <div className="ks-bio-kind-grid" role="radiogroup">
                  {KINDS.map((k) => (
                    <label key={k.id} className={`ks-bio-kind-option${form.kind === k.id ? " is-active" : ""}`}>
                      <input
                        type="radio"
                        name="bio-kind"
                        checked={form.kind === k.id}
                        onChange={() =>
                          setForm((f) => ({
                            ...f,
                            kind: k.id,
                            icon: k.id === "whatsapp" ? "whatsapp" : f.icon === "whatsapp" ? "link" : f.icon,
                          }))
                        }
                        disabled={busy}
                      />
                      <strong>{k.label}</strong>
                      <span>{k.hint}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

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

              {form.kind === "whatsapp" ? (
                <label className="ks-admin-field">
                  <span>Mensagem inicial (opcional)</span>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    rows={3}
                    maxLength={500}
                    disabled={busy}
                    placeholder="Olá! 🌿 Vim pela bio…"
                  />
                  <span className="ks-admin-muted">Usa o número do site. Acentos e emoji funcionam.</span>
                </label>
              ) : (
                <label className={`ks-admin-field${fieldErrors.url ? " has-error" : ""}`}>
                  <span>{form.kind === "internal" ? "Caminho" : "URL"}</span>
                  <input
                    value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder={form.kind === "internal" ? "/portfolio" : "https://…"}
                    disabled={busy}
                    required
                  />
                  {fieldErrors.url ? <span className="ks-admin-field-error">{fieldErrors.url}</span> : null}
                </label>
              )}

              {form.kind !== "whatsapp" ? (
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
                        <span className="ks-bio-icon-option-glyph" aria-hidden="true">
                          {bioActionIcon(opt.id, 16)}
                        </span>
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}

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
          </form>

          <aside className="ks-bio-preview-aside is-open">
            <BioLivePreview items={items} editId={editId} draft={draft} />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="ks-admin-shell">
      <header className="ks-admin-brand ks-gallery-header">
        <div>
          <p className="ks-admin-kicker">Link da bio</p>
          <h1 className="ks-admin-title">Links da bio</h1>
          <p className="ks-admin-lead">Botões do Instagram — número do WhatsApp vale para o site inteiro.</p>
        </div>
        <div className="ks-bio-header-actions">
          <button
            type="button"
            className="ks-admin-btn ks-admin-btn--secondary ks-bio-preview-toggle"
            onClick={() => setShowPreview((v) => !v)}
          >
            <Eye size={16} /> {showPreview ? "Ocultar prévia" : "Ver prévia"}
          </button>
          <button type="button" className="ks-admin-btn ks-gallery-add" onClick={openCreate}>
            Adicionar link
          </button>
        </div>
      </header>

      {phoneBlock}

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

      <div className="ks-bio-workspace ks-bio-workspace--list">
        <div className="ks-bio-list-col">
          {!loading && items.length === 0 ? (
            <div className="ks-gallery-empty ks-bio-empty">
              <img src="/assets/brand/star-karina-outline.webp" alt="" className="ks-gallery-empty-star" />
              <p className="ks-bio-empty-title">A bio está sem botões</p>
              <p className="ks-bio-empty-text">
                Quem abrir o link do Instagram não vai ter nenhum caminho para falar com você. Adicione ao menos o
                WhatsApp de orçamento.
              </p>
              <button type="button" className="ks-admin-btn" onClick={openCreate}>
                Adicionar o primeiro link
              </button>
            </div>
          ) : null}

          <ul className="ks-bio-list">
            {items.map((item, index) => {
              const dest = destinationOf(item);
              const label = normalizeBrandLabel(item.label);
              return (
                <li key={item.id}>
                  <div
                    className={`ks-bio-row ks-bio-row--compact${!item.published ? " is-hidden" : ""}${item.featured ? " is-featured" : ""}`}
                  >
                    <button type="button" className="ks-bio-row-hit" onClick={() => openEdit(item)}>
                      <span className={`ks-bio-row-glyph${item.featured ? " is-featured" : ""}`} aria-hidden="true">
                        {bioActionIcon(itemIcon(item), 16)}
                      </span>
                      <span className="ks-bio-row-main">
                        <span className="ks-bio-row-label-line">
                          <span className="ks-bio-row-label">{label}</span>
                          {item.featured ? (
                            <span className="ks-bio-chip ks-bio-chip--featured" title="Destaque na bio">
                              ●
                            </span>
                          ) : null}
                          {!item.published ? <span className="ks-bio-chip">oculto</span> : null}
                          <span className="ks-bio-chip">{kindChipLabel(item.kind)}</span>
                        </span>
                        <span
                          className={`ks-bio-row-dest${dest.broken ? " is-broken" : ""}`}
                          title={dest.title}
                        >
                          {dest.text}
                        </span>
                      </span>
                    </button>
                    <span className="ks-bio-row-actions">
                      <span className="ks-bio-order" role="group" aria-label="Ordem">
                        <button
                          type="button"
                          className="ks-bio-order-btn"
                          aria-label="Subir"
                          disabled={index === 0 || busyId === item.id}
                          onClick={(e) => void move(item.id, -1, e)}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          className="ks-bio-order-btn"
                          aria-label="Descer"
                          disabled={index === items.length - 1 || busyId === item.id}
                          onClick={(e) => void move(item.id, 1, e)}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </span>
                      <button
                        type="button"
                        className="ks-bio-edit-btn"
                        aria-label={`Editar ${label}`}
                        onClick={() => openEdit(item)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="ks-bio-remove-btn"
                        aria-label={`Remover ${label}`}
                        disabled={busyId === item.id}
                        onClick={(e) => void remove(item, e)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className={`ks-bio-preview-aside${showPreview ? " is-open" : ""}`}>
          <BioLivePreview items={items} />
        </aside>
      </div>
    </div>
  );
}
