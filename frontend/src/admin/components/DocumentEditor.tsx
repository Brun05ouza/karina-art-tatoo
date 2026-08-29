import { Save } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { DocumentStore } from "../data/repository";
import { useDocument } from "../hooks/useDocument";
import { useDirtyGuard } from "../hooks/useDirtyGuard";
import { useToast } from "../hooks/useToast";
import { ImagePicker } from "./ImagePicker";
import { AdminButton, CollapsibleBlock, Field, InternalLinkInput, SelectField, TextArea, TextInput, Toggle } from "./Primitives";
import { ErrorState, LoadingState } from "./States";

export type DocumentField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "toggle" | "image" | "internalLink";
  options?: string[];
  hint?: string;
  placeholder?: string;
  folder?: string;
  imageKey?: string;
  compositionHint?: boolean;
  rows?: number;
  full?: boolean;
};

export type DocumentBlock<T = never> = {
  /** Chave estável para ocultar/exibir a seção no site público. */
  id: string;
  title: string;
  summary?: string;
  fields?: DocumentField[];
  /** Conteúdo extra renderizado dentro do bloco, depois dos campos simples
   *  (usado para listas de cards — ver Repeater). */
  render?: (value: T, update: (patch: Partial<T>) => void) => ReactNode;
  /** Se false, a seção não ganha o interruptor de ocultar. Default: true. */
  hideable?: boolean;
};

type DocumentEditorProps<T> = {
  store: DocumentStore<T>;
  blocks: DocumentBlock<T>[];
  children?: (value: T, update: (patch: Partial<T>) => void) => ReactNode;
};

export function DocumentEditor<T extends Record<string, unknown>>({ store, blocks, children }: DocumentEditorProps<T>) {
  const { value, setValue, loading, error, reload, save } = useDocument(store);
  const { setDirty } = useDirtyGuard();
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

  const isInternalLinkField = (field: DocumentField) => {
    const key = field.key.toLowerCase();
    if (field.type === "internalLink") return true;
    if (field.type || !key.endsWith("url")) return false;
    if (key.includes("image") || key.includes("video") || key.includes("thumb") || key.includes("trailer") || key.includes("youtube")) return false;
    return key.includes("button") || field.label.toLowerCase().includes("link");
  };

  const editor = (
    <div className="ksa-document-editor">
      <div className="ksa-document-guide">
        <div>
          <span className="ksa-eyebrow">Roteiro da página</span>
          <h2>Escolha uma seção para editar</h2>
          <p>Os blocos seguem a mesma ordem em que aparecem no site. Abra só o trecho que quer ajustar.</p>
        </div>
        <strong>{blocks.length.toString().padStart(2, "0")} seções</strong>
      </div>

      <div className="ksa-block-stack">
        {blocks.map((block, index) => (
          <CollapsibleBlock key={block.title} title={block.title} summary={block.summary} index={index + 1}>
            <div className="ksa-grid-2">
              {(block.fields ?? []).map((field) => {
                const current = value[field.key];

                if (field.type === "image") {
                  return (
                    <div key={field.key} className="is-full">
                      <ImagePicker label={field.label} folder={field.folder} value={String(current || "")} compositionHint={field.compositionHint} onChange={(url, key) => update({ [field.key]: url, ...(field.imageKey ? { [field.imageKey]: key } : {}) } as Partial<T>)} />
                    </div>
                  );
                }

                if (field.type === "toggle") {
                  return (
                    <Field key={field.key} className={field.full ? "is-full" : ""} label={field.label} hint={field.hint}>
                      <Toggle checked={Boolean(current)} onChange={(checked) => update({ [field.key]: checked } as Partial<T>)} label={Boolean(current) ? "Ativo" : "Inativo"} />
                    </Field>
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <Field key={field.key} className={field.full ? "is-full" : ""} label={field.label} hint={field.hint}>
                      <TextArea rows={field.rows ?? 3} value={String(current ?? "")} placeholder={field.placeholder} onChange={(event) => update({ [field.key]: event.target.value } as Partial<T>)} />
                    </Field>
                  );
                }

                if (field.type === "select") {
                  return (
                    <Field key={field.key} className={field.full ? "is-full" : ""} label={field.label} hint={field.hint}>
                      <SelectField value={String(current ?? "")} onChange={(event) => update({ [field.key]: event.target.value } as Partial<T>)}>
                        {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                      </SelectField>
                    </Field>
                  );
                }

                if (isInternalLinkField(field)) {
                  return (
                    <Field key={field.key} className={field.full ? "is-full" : ""} label={field.label} hint={field.hint}>
                      <InternalLinkInput value={String(current ?? "")} onChange={(next) => update({ [field.key]: next } as Partial<T>)} />
                    </Field>
                  );
                }

                return (
                  <Field key={field.key} className={field.full ? "is-full" : ""} label={field.label} hint={field.hint}>
                    <TextInput value={String(current ?? "")} placeholder={field.placeholder} onChange={(event) => update({ [field.key]: event.target.value } as Partial<T>)} />
                  </Field>
                );
              })}
            </div>
            {block.render?.(value, update)}
          </CollapsibleBlock>
        ))}
      </div>

      {children?.(value, update)}

      <div className={`ksa-save-bar ksa-document-save ${documentDirty ? "is-dirty" : "is-saved"}`}>
        <span aria-live="polite"><i aria-hidden="true" />{documentDirty ? "Alterações não salvas" : "Tudo salvo"}</span>
        <AdminButton onClick={() => void submit()} disabled={!documentDirty}><Save size={17} />Salvar alterações</AdminButton>
      </div>
    </div>
  );

  return editor;
}
