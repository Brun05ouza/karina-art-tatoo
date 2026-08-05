import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { BaseItem } from "../data/types";
import type { Repository } from "../data/repository";
import { useCollection } from "../hooks/useCollection";
import { useDirtyGuard } from "../hooks/useDirtyGuard";
import { useToast } from "../hooks/useToast";
import { ImagePicker } from "./ImagePicker";
import { AdminButton, AdminCard, Field, SelectField, StatusBadge, TextArea, TextInput, Toggle } from "./Primitives";
import { FilterChips, SearchInput } from "./SearchFilter";
import { ConfirmDialog, EmptyState, ErrorState, LoadingState } from "./States";

export type CollectionField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number" | "toggle" | "image";
  options?: string[];
  hint?: string;
  placeholder?: string;
  imageKey?: string;
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
      <AdminCard className="ksa-collection-toolbar"><div className="ksa-toolbar"><SearchInput value={query} onChange={setQuery} placeholder={`Buscar ${config.singular.toLowerCase()}…`} /><AdminButton onClick={openNew}><Plus size={17} />Adicionar {config.singular.toLowerCase()}</AdminButton></div>{config.categories && <FilterChips values={config.categories} selected={category} onChange={setCategory} />}</AdminCard>

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
      if (field.type === "image") return <div className={field.full ? "is-full" : ""} key={field.key}><ImagePicker label={field.label} value={String(current || "")} onChange={(url, key) => { patchDraft(field.key, url); patchDraft(field.imageKey || "imageKey", key); }} /></div>;
      if (field.type === "toggle") return <Field label={field.label} hint={field.hint} key={field.key}><Toggle checked={Boolean(current)} onChange={(value) => patchDraft(field.key, value)} label={Boolean(current) ? "Ativo" : "Inativo"} /></Field>;
      if (field.type === "textarea") return <Field label={field.label} hint={field.hint} key={field.key}><TextArea rows={4} value={String(current ?? "")} placeholder={field.placeholder} onChange={(event) => patchDraft(field.key, event.target.value)} /></Field>;
      if (field.type === "select") return <Field label={field.label} hint={field.hint} key={field.key}><SelectField value={String(current ?? "")} onChange={(event) => patchDraft(field.key, event.target.value)}>{field.options?.map((option) => <option key={option}>{option}</option>)}</SelectField></Field>;
      return <Field label={field.label} hint={field.hint} key={field.key}><TextInput type={field.type === "number" ? "number" : "text"} value={String(current ?? "")} placeholder={field.placeholder} onChange={(event) => patchDraft(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)} /></Field>;
    })}</div><footer><AdminButton tone="ghost" onClick={closeEditor}>Cancelar</AdminButton><AdminButton onClick={() => void submit()} disabled={saving}>{saving ? "Salvando…" : "Salvar alterações"}</AdminButton></footer></aside></div>}

    <ConfirmDialog open={Boolean(deleteTarget)} title={`Excluir ${config.singular.toLowerCase()}?`} text={`“${deleteTarget?.title || "Este item"}” será removido dos rascunhos locais.`} onCancel={() => setDeleteTarget(null)} onConfirm={() => { if (!deleteTarget) return; void remove(deleteTarget.id).then(() => { show(`${config.singular} excluído.`); setDeleteTarget(null); }).catch((cause) => show(cause instanceof Error ? cause.message : "Não foi possível excluir.", "error")); }} />
    </>
  );

  return config.preview ? (
    <div className="ksa-editor-layout">
      <div className="ksa-editor-main">
        {content}
      </div>
      <aside className="ksa-preview-sticky">
        <span className="ksa-eyebrow">Prévia ao vivo</span>
        {config.preview(items)}
      </aside>
    </div>
  ) : content;
}
