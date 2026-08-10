import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BaseItem } from "../data/types";
import type { Repository } from "../data/repository";
import { useCollection } from "../hooks/useCollection";
import { useDirtyGuard } from "../hooks/useDirtyGuard";
import { useToast } from "../hooks/useToast";
import { ImagePicker } from "./ImagePicker";
import { AdminButton, AdminCard, Field, InternalLinkInput, SelectField, StatusBadge, TextArea, TextInput, Toggle } from "./Primitives";
import { FilterChips, SearchInput } from "./SearchFilter";
import { ConfirmDialog, EmptyState, ErrorState, LoadingState } from "./States";

export type CollectionField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number" | "toggle" | "image" | "internalLink" | "currency";
  options?: string[];
  allowCustom?: boolean;
  hint?: string;
  placeholder?: string;
  imageKey?: string;
  folder?: string;
  full?: boolean;
};

export type CollectionConfig<T extends BaseItem> = {
  repository: Repository<T>;
  singular: string;
  emptyItem: T;
  fields: CollectionField[];
  categories?: string[];
  quickStatuses?: string[];
  secondary?(item: T): string;
  image?(item: T): string | undefined;
  preview?: (items: T[]) => React.ReactNode;
  /**
   * Avisa a página a cada mudança na lista que a prévia deveria mostrar (itens
   * salvos + rascunho em edição). Serve para telas que combinam esta coleção com
   * um documento de textos e precisam de uma prévia única — ver ReformulacoesPage.
   */
  onPreviewItemsChange?: (items: T[]) => void;
};

export function CollectionManager<T extends BaseItem>({ config }: { config: CollectionConfig<T> }) {
  const { items, loading, error, reload, save, remove, move } = useCollection(config.repository);
  const { show } = useToast();
  const { setDirty, confirmLeave } = useDirtyGuard();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [draft, setDraft] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => items.filter((item) => {
    const haystack = [item.title, item.description, item.category, item.status].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase()) && (category === "Todos" || item.category === category);
  }), [items, query, category]);

  const filterCategories = useMemo(() => {
    if (!config.categories) return [];
    const values = new Set(["Todos", ...config.categories]);
    items.forEach((item) => {
      if (item.category) values.add(item.category);
    });
    return Array.from(values);
  }, [config.categories, items]);

  const optionsForField = (field: CollectionField) => {
    const values = new Set(field.options || []);
    items.forEach((item) => {
      const value = item[field.key];
      if (typeof value === "string" && value.trim()) values.add(value.trim());
    });
    const draftValue = draft?.[field.key];
    if (typeof draftValue === "string" && draftValue.trim()) values.add(draftValue.trim());
    return Array.from(values);
  };

  /**
   * O que a prévia recebe: os itens salvos COM o rascunho em edição aplicado
   * por cima. Sem isso a prévia só mudava depois do "Salvar alterações" — o
   * formulário trabalha num draft separado, que não estava chegando aqui.
   *
   * Item novo entra na lista (aparece só se estiver ativo/publicado, porque cada
   * prévia aplica seus próprios filtros); item existente é substituído. A
   * ordenação por `order` é reaplicada para que mexer no campo Ordem também
   * reposicione o item ao vivo.
   */
  const previewItems = useMemo(() => {
    if (!draft) return items;
    const merged = items.some((item) => item.id === draft.id)
      ? items.map((item) => (item.id === draft.id ? draft : item))
      : [...items, draft];
    return [...merged].sort((a, b) => a.order - b.order);
  }, [items, draft]);

  const notifyPreview = config.onPreviewItemsChange;
  useEffect(() => {
    notifyPreview?.(previewItems);
  }, [notifyPreview, previewItems]);

  const openNew = () => {
    if (!confirmLeave()) return;
    setDraft({ ...config.emptyItem, id: `new:${crypto.randomUUID()}`, order: items.length + 1 });
    setDirty(false);
  };

  const openEdit = (item: T) => {
    if (!confirmLeave()) return;
    setDraft({ ...item });
    setDirty(false);
  };

  const closeEditor = () => {
    if (!confirmLeave()) return;
    setDraft(null);
    // Descartar o rascunho zera as alterações pendentes: sem isso o aviso de
    // "alterações não salvas" continuava valendo para um formulário que já fechou.
    setDirty(false);
  };

  const patchDraft = (key: string, value: unknown) => {
    setDraft((current) => current ? ({ ...current, [key]: value }) : current);
    setDirty(true);
  };

  const submit = async () => {
    if (!draft?.title.trim()) {
      show(`Informe o título de ${config.singular.toLowerCase()}.`, "error");
      return;
    }
    setSaving(true);
    try {
      await save(draft);
      setDirty(false);
      setDraft(null);
      show(`${config.singular} salvo com sucesso.`);
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "Não foi possível salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateQuickly = async (item: T, patch: Partial<T>, message: string) => {
    try {
      await save({ ...item, ...patch });
      show(message);
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "Não foi possível atualizar.", "error");
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const content = (
    <>
      <AdminCard className="ksa-collection-toolbar"><div className="ksa-toolbar"><SearchInput value={query} onChange={setQuery} placeholder={`Buscar ${config.singular.toLowerCase()}…`} /><AdminButton onClick={openNew}><Plus size={17} />Adicionar {config.singular.toLowerCase()}</AdminButton></div>{config.categories && <FilterChips values={filterCategories} selected={category} onChange={setCategory} />}</AdminCard>

    {filtered.length === 0 ? <EmptyState title={`Nenhum ${config.singular.toLowerCase()} encontrado`} text={query || category !== "Todos" ? "Ajuste a busca ou os filtros." : "Adicione o primeiro item para começar."} action={<AdminButton onClick={openNew}><Plus size={17} />Adicionar</AdminButton>} /> : <div className="ksa-list">{filtered.map((item, index) => {
      const image = config.image?.(item) || item.imageUrl;
      return <article className="ksa-row" key={item.id}>
        <div className="ksa-thumb">{image ? <img src={image} alt="" /> : <span>{String(item.order).padStart(2, "0")}</span>}</div>
        <div className="ksa-row-main"><div className="ksa-row-title"><strong>{item.title}</strong><StatusBadge status={item.status || (item.active ? "Publicado" : "Oculto")} /></div><p>{config.secondary?.(item) || item.description || item.category || "Sem descrição"}</p><small>Ordem {item.order}{item.category ? ` · ${item.category}` : ""}</small></div>
        {config.quickStatuses && <SelectField aria-label={`Status de ${item.title}`} value={item.status || ""} onChange={(event) => void updateQuickly(item, { status: event.target.value } as Partial<T>, "Status atualizado.")}>{config.quickStatuses.map((status) => <option key={status}>{status}</option>)}</SelectField>}
        <div className="ksa-row-actions"><button title="Mover para cima" disabled={index === 0} onClick={() => void move(item.id, -1)}><ArrowUp size={16} /></button><button title="Mover para baixo" disabled={index === filtered.length - 1} onClick={() => void move(item.id, 1)}><ArrowDown size={16} /></button>{typeof item.publicUrl === "string" && item.publicUrl && <button title="Copiar URL" onClick={() => void navigator.clipboard.writeText(item.publicUrl as string).then(() => show("URL copiada.")).catch(() => show("Não foi possível copiar a URL.", "error"))}><Copy size={16} /></button>}<button title={item.active ? "Ocultar" : "Publicar"} onClick={() => void updateQuickly(item, { active: !item.active } as Partial<T>, item.active ? "Item ocultado." : "Item publicado.")}>{item.active ? <Eye size={16} /> : <EyeOff size={16} />}</button><button title="Editar" onClick={() => openEdit(item)}><Pencil size={16} /></button><button className="is-danger" title="Excluir" onClick={() => setDeleteTarget(item)}><Trash2 size={16} /></button></div>
      </article>;
    })}</div>}

    {draft && <div className="ksa-drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeEditor()}><aside className="ksa-editor" aria-label={`Editar ${config.singular}`}><header><div><span className="ksa-eyebrow">{draft.id.startsWith("new:") ? "Novo item" : "Editar item"}</span><h2>{draft.title || config.singular}</h2></div><button onClick={closeEditor} aria-label="Fechar"><X /></button></header><div className="ksa-editor-fields">{config.fields.map((field) => {
      const current = draft[field.key];
      if (field.type === "image") return <div className={field.full ? "is-full" : ""} key={field.key}><ImagePicker label={field.label} folder={field.folder} value={String(current || "")} onChange={(url, key) => { patchDraft(field.key, url); patchDraft(field.imageKey || "imageKey", key); }} /></div>;
      if (field.type === "toggle") return <Field label={field.label} hint={field.hint} key={field.key}><Toggle checked={Boolean(current)} onChange={(value) => patchDraft(field.key, value)} label={Boolean(current) ? "Ativo" : "Inativo"} /></Field>;
      if (field.type === "textarea") return <Field label={field.label} hint={field.hint} key={field.key}><TextArea rows={4} value={String(current ?? "")} placeholder={field.placeholder} onChange={(event) => patchDraft(field.key, event.target.value)} /></Field>;
      if (field.type === "currency") return <Field label={field.label} hint={field.hint} key={field.key}><CurrencyInput value={String(current ?? "")} placeholder={field.placeholder} onChange={(next) => patchDraft(field.key, next)} /></Field>;
      if (field.type === "select" && field.allowCustom) return <Field label={field.label} hint={field.hint} key={field.key}><ChoicePicker value={String(current ?? "")} options={optionsForField(field)} placeholder={field.placeholder || `Selecionar ${field.label.toLowerCase()}`} onChange={(next) => patchDraft(field.key, next)} /></Field>;
      if (field.type === "select") return <Field label={field.label} hint={field.hint} key={field.key}><SelectField value={String(current ?? "")} onChange={(event) => patchDraft(field.key, event.target.value)}>{field.options?.map((option) => <option key={option}>{option}</option>)}</SelectField></Field>;
      if (field.type === "internalLink" || field.key === "link" || field.key === "url") return <Field label={field.label} hint={field.hint} key={field.key}><InternalLinkInput value={String(current ?? "")} onChange={(next) => patchDraft(field.key, next)} /></Field>;
      return <Field label={field.label} hint={field.hint} key={field.key}><TextInput type={field.type === "number" ? "number" : "text"} value={String(current ?? "")} placeholder={field.placeholder} onChange={(event) => patchDraft(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)} /></Field>;
    })}</div><footer><AdminButton tone="ghost" onClick={closeEditor}>Cancelar</AdminButton><AdminButton onClick={() => void submit()} disabled={saving}>{saving ? "Salvando…" : "Salvar alterações"}</AdminButton></footer></aside></div>}

    <ConfirmDialog open={Boolean(deleteTarget)} title={`Excluir ${config.singular.toLowerCase()}?`} text={`“${deleteTarget?.title || "Este item"}” será removido do banco de dados e deixará de aparecer no site.`} onCancel={() => setDeleteTarget(null)} onConfirm={() => { if (!deleteTarget) return; void remove(deleteTarget.id).then(() => { show(`${config.singular} excluído.`); setDeleteTarget(null); }).catch((cause) => show(cause instanceof Error ? cause.message : "Não foi possível excluir.", "error")); }} />
    </>
  );

  return config.preview ? (
    <div className="ksa-editor-layout">
      <div className="ksa-editor-main">
        {content}
      </div>
      <aside className="ksa-preview-sticky">
        <span className="ksa-eyebrow">Prévia ao vivo{draft ? " · não salvo" : ""}</span>
        {config.preview(previewItems)}
      </aside>
    </div>
  ) : content;
}

function ChoicePicker({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const normalizedOptions = useMemo(() => Array.from(new Set(options.filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR")), [options]);

  const addCustom = () => {
    const next = customValue.trim();
    if (!next) return;
    onChange(next);
    setCustomValue("");
    setOpen(false);
  };

  return (
    <div className="ksa-choice-picker">
      <button type="button" className={`ksa-choice-trigger${open ? " is-open" : ""}`} onClick={() => setOpen((current) => !current)}>
        <span>
          <strong>{value || placeholder}</strong>
          <small>{value ? "Selecionado" : "Escolha uma opção ou crie uma nova"}</small>
        </span>
        <Plus size={15} />
      </button>
      {open && (
        <div className="ksa-choice-menu">
          <div className="ksa-choice-options">
            {normalizedOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={option === value ? "is-selected" : ""}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="ksa-choice-add">
            <TextInput
              value={customValue}
              placeholder="Novo valor"
              onChange={(event) => setCustomValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustom();
                }
              }}
            />
            <button type="button" className="ksa-choice-add-button" onClick={addCustom} aria-label="Adicionar opção">
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCurrencyFromDigits(digits: string) {
  const cents = Number(digits || "0");
  if (!cents) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function CurrencyInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    onChange(formatCurrencyFromDigits(digits));
  };

  return (
    <div className="ksa-currency-input">
      <span aria-hidden="true">R$</span>
      <TextInput
        inputMode="numeric"
        value={value.replace(/^R\$\s?/, "")}
        placeholder={placeholder || "0,00"}
        onChange={(event) => handleChange(event.target.value)}
      />
    </div>
  );
}
