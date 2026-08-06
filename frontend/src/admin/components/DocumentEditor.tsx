import { Save } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { DocumentStore } from "../data/repository";
import { useDocument } from "../hooks/useDocument";
import { useDirtyGuard } from "../hooks/useDirtyGuard";
import { useToast } from "../hooks/useToast";
import { ImagePicker } from "./ImagePicker";
import { AdminButton, CollapsibleBlock, Field, SelectField, TextArea, TextInput, Toggle } from "./Primitives";
import { ErrorState, LoadingState } from "./States";

export type DocumentField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "toggle" | "image";
  options?: string[];
  hint?: string;
  placeholder?: string;
  rows?: number;
  full?: boolean;
};

export type DocumentBlock<T = never> = {
  title: string;
  summary?: string;
  fields?: DocumentField[];
  /** Conteúdo extra renderizado dentro do bloco, depois dos campos simples
   *  (usado para listas de cards — ver Repeater). */
  render?: (value: T, update: (patch: Partial<T>) => void) => ReactNode;
};

type DocumentEditorProps<T> = {
  store: DocumentStore<T>;
  blocks: DocumentBlock<T>[];
  children?: (value: T, update: (patch: Partial<T>) => void) => ReactNode;
  /** Prévia ao vivo exibida ao lado do formulário. Recebe o valor em edição,
   *  ainda não salvo, então reflete cada tecla digitada. */
  preview?: (value: T) => ReactNode;
};

export function DocumentEditor<T extends Record<string, unknown>>({ store, blocks, children, preview }: DocumentEditorProps<T>) {
  const { value, setValue, loading, error, reload, save } = useDocument(store);
  const { dirty, setDirty } = useDirtyGuard();
  const { show } = useToast();
  /**
   * Alterações pendentes DESTE documento. O `dirty` do guarda é compartilhado com
   * a tela inteira — em páginas que também têm uma coleção (Reformulações), editar
   * um item acenderia a barra de salvar dos textos, que não tem nada a salvar.
   */
  const [documentDirty, setDocumentDirty] = useState(false);

  if (loading) return <LoadingState />;
  if (error || !value) return <ErrorState message={error || "Conteúdo indisponível."} onRetry={reload} />;

  const update = (patch: Partial<T>) => {
    setValue((current) => current ? ({ ...current, ...patch }) : current);
    setDocumentDirty(true);
    setDirty(true);
  };

  const submit = async () => {
    try {
      await save(value);
      setDocumentDirty(false);
      setDirty(false);
      show("Alterações salvas nos rascunhos.");
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "Não foi possível salvar.", "error");
    }
  };

  const editor = <div className="ksa-document-editor">{blocks.map((block) => <CollapsibleBlock key={block.title} title={block.title} summary={block.summary}><div className="ksa-grid-2">{(block.fields ?? []).map((field) => {
    const current = value[field.key];
    if (field.type === "image") return <div key={field.key} className="is-full"><ImagePicker label={field.label} value={String(current || "")} onChange={(url) => update({ [field.key]: url } as Partial<T>)} /></div>;
    if (field.type === "toggle") return <Field key={field.key} className={field.full ? "is-full" : ""} label={field.label} hint={field.hint}><Toggle checked={Boolean(current)} onChange={(checked) => update({ [field.key]: checked } as Partial<T>)} label={Boolean(current) ? "Ativo" : "Inativo"} /></Field>;
    if (field.type === "textarea") return <Field key={field.key} className={field.full ? "is-full" : ""} label={field.label} hint={field.hint}><TextArea rows={field.rows ?? 3} value={String(current ?? "")} placeholder={field.placeholder} onChange={(event) => update({ [field.key]: event.target.value } as Partial<T>)} /></Field>;
    if (field.type === "select") return <Field key={field.key} className={field.full ? "is-full" : ""} label={field.label} hint={field.hint}><SelectField value={String(current ?? "")} onChange={(event) => update({ [field.key]: event.target.value } as Partial<T>)}>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</SelectField></Field>;
    return <Field key={field.key} className={field.full ? "is-full" : ""} label={field.label} hint={field.hint}><TextInput value={String(current ?? "")} placeholder={field.placeholder} onChange={(event) => update({ [field.key]: event.target.value } as Partial<T>)} /></Field>;
  })}</div>{block.render?.(value, update)}</CollapsibleBlock>)}{children?.(value, update)}<div className={`ksa-save-bar ksa-document-save ${documentDirty ? "is-dirty" : "is-saved"}`}><span aria-live="polite"><i aria-hidden="true" />{documentDirty ? "Alterações não salvas" : "Tudo salvo"}</span><AdminButton onClick={() => void submit()} disabled={!documentDirty}><Save size={17} />Salvar alterações</AdminButton></div></div>;

  if (!preview) return editor;

  return <div className="ksa-editor-layout">{editor}<aside className="ksa-preview-sticky"><span className="ksa-eyebrow">Prévia ao vivo{dirty ? " · não salvo" : ""}</span>{preview(value)}</aside></div>;
}
