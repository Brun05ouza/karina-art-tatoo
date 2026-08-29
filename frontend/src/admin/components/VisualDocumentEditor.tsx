import { RotateCcw, Save } from "lucide-react";
import { useMemo, useState } from "react";
import type { DocumentBlock, DocumentField } from "./DocumentEditor";
import { ImagePicker } from "./ImagePicker";
import { AdminButton, CollapsibleBlock, Field, InternalLinkInput, SelectField, TextArea, TextInput, Toggle } from "./Primitives";
import { ErrorState, LoadingState } from "./States";
import type { DocumentStore } from "../data/repository";
import { getHiddenSections, isPageVisible, PAGE_VISIBILITY_ID, setSectionHidden } from "../data/section-visibility";
import { useDocument } from "../hooks/useDocument";
import { useDirtyGuard } from "../hooks/useDirtyGuard";
import { useToast } from "../hooks/useToast";

type VisualDocumentEditorProps<T> = {
  store: DocumentStore<T>;
  blocks: DocumentBlock<T>[];
};

export function VisualDocumentEditor<T extends Record<string, unknown>>({ store, blocks }: VisualDocumentEditorProps<T>) {
  const { value, setValue, loading, error, reload, save } = useDocument(store);
  const { setDirty } = useDirtyGuard();
  const { show } = useToast();
  const [documentDirty, setDocumentDirty] = useState(false);
  const [activeSection, setActiveSection] = useState(blocks[0]?.id ?? "");

  const activeBlock = useMemo(
    () => blocks.find((block) => block.id === activeSection) ?? blocks[0],
    [activeSection, blocks],
  );

  if (loading) return <LoadingState />;
  if (error || !value) return <ErrorState message={error || "Conteúdo indisponível."} onRetry={reload} />;

  const hiddenSections = getHiddenSections(value);

  const update = (patch: Partial<T>) => {
    setValue((current) => (current ? { ...current, ...patch } : current));
    setDocumentDirty(true);
    setDirty(true);
  };

  const setHidden = (sectionId: string, hidden: boolean) => {
    update({ hiddenSections: setSectionHidden(hiddenSections, sectionId, hidden) } as Partial<T>);
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

  const discardChanges = async () => {
    try {
      await reload();
      setDocumentDirty(false);
      setDirty(false);
      show("Alterações descartadas.");
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "Não foi possível descartar as alterações.", "error");
    }
  };

  const pageHidden = !isPageVisible(value);

  return (
    <div className="ksa-visual-editor">
      <div className={`ksa-visual-topline${pageHidden ? " is-page-hidden" : ""}`}>
        <div>
          <span className="ksa-eyebrow">Editor</span>
          <h2>Edite por seção</h2>
          <p>Escolha uma seção na trilha abaixo. O painel mostra só os campos daquele trecho.</p>
          {documentDirty ? (
            <small className="ksa-visual-change-note">
              Mudanças em rascunho — salve quando terminar ou descarte para voltar ao último conteúdo salvo.
            </small>
          ) : null}
        </div>
        <div className="ksa-page-visibility-card">
          <div>
            <strong>Página no site</strong>
            <p>
              {pageHidden
                ? "Oculta no menu e inacessível para visitantes. O conteúdo continua aqui."
                : "Visível no menu. Desligue para esconder a página inteira do site."}
            </p>
          </div>
          <Toggle
            checked={pageHidden}
            onChange={(checked) => setHidden(PAGE_VISIBILITY_ID, checked)}
            label={pageHidden ? "Oculta" : "Visível"}
            ariaLabel="Ocultar página no menu e no site"
          />
        </div>
      </div>

      <div className="ksa-visual-rail" aria-label="Seções da página">
        {blocks.map((block, index) => (
          <button
            key={block.id}
            type="button"
            className={block.id === activeBlock?.id ? "is-active" : ""}
            onClick={() => setActiveSection(block.id)}
            title={block.title}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {block.title}
          </button>
        ))}
      </div>

      <div className="ksa-visual-workbench ksa-visual-workbench-form">
        {activeBlock ? (
          <aside className="ksa-visual-inspector">
            <CollapsibleBlock title={activeBlock.title} summary={activeBlock.summary} defaultOpen>
              <div className="ksa-grid-2">
                {(activeBlock.fields ?? []).map((field) => (
                  <FieldControl<T> key={field.key} field={field} value={value} update={update} />
                ))}
              </div>
              {activeBlock.render?.(value, update)}
            </CollapsibleBlock>
          </aside>
        ) : null}
      </div>

      <div className={`ksa-save-bar ksa-document-save ksa-visual-save ${documentDirty ? "is-dirty" : "is-saved"}`}>
        <span aria-live="polite">
          <i aria-hidden="true" />
          {documentDirty ? "Mudanças prontas para salvar" : "Tudo salvo"}
        </span>
        <div className="ksa-visual-save-actions">
          {documentDirty ? (
            <AdminButton tone="ghost" onClick={() => void discardChanges()}>
              <RotateCcw size={16} />
              Descartar
            </AdminButton>
          ) : null}
          <AdminButton onClick={() => void submit()} disabled={!documentDirty}>
            <Save size={17} />
            Salvar
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

function FieldControl<T extends Record<string, unknown>>({
  field,
  value,
  update,
}: {
  field: DocumentField;
  value: T;
  update(patch: Partial<T>): void;
}) {
  const current = value[field.key];
  const className = field.full ? "is-full" : "";

  if (field.type === "image") {
    return (
      <div className="is-full">
        <ImagePicker
          label={field.label}
          folder={field.folder}
          value={String(current || "")}
          compositionHint={field.compositionHint}
          onChange={(url, key) =>
            update({ [field.key]: url, ...(field.imageKey ? { [field.imageKey]: key } : {}) } as Partial<T>)
          }
        />
      </div>
    );
  }

  if (field.type === "toggle") {
    return (
      <Field className={className} label={field.label} hint={field.hint}>
        <Toggle
          checked={Boolean(current)}
          onChange={(checked) => update({ [field.key]: checked } as Partial<T>)}
          label={Boolean(current) ? "Ativo" : "Inativo"}
        />
      </Field>
    );
  }

  if (field.type === "textarea") {
    const rows = field.rows ?? 2;
    const wide = Boolean(field.full || rows >= 3);
    return (
      <Field className={wide ? "is-full" : ""} label={field.label} hint={field.hint}>
        <TextArea
          rows={rows}
          value={String(current ?? "")}
          placeholder={field.placeholder}
          onChange={(event) => update({ [field.key]: event.target.value } as Partial<T>)}
        />
      </Field>
    );
  }

  if (field.type === "select") {
    return (
      <Field className={className} label={field.label} hint={field.hint}>
        <SelectField value={String(current ?? "")} onChange={(event) => update({ [field.key]: event.target.value } as Partial<T>)}>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
      </Field>
    );
  }

  if (isInternalLinkField(field)) {
    return (
      <Field className={className} label={field.label} hint={field.hint}>
        <InternalLinkInput value={String(current ?? "")} onChange={(next) => update({ [field.key]: next } as Partial<T>)} />
      </Field>
    );
  }

  return (
    <Field className={className} label={field.label} hint={field.hint}>
      <TextInput
        value={String(current ?? "")}
        placeholder={field.placeholder}
        onChange={(event) => update({ [field.key]: event.target.value } as Partial<T>)}
      />
    </Field>
  );
}

function isInternalLinkField(field: DocumentField) {
  const key = field.key.toLowerCase();
  if (field.type === "internalLink") return true;
  if (field.type || !key.endsWith("url")) return false;
  if (key.includes("image") || key.includes("video") || key.includes("thumb") || key.includes("trailer") || key.includes("youtube")) return false;
  return key.includes("button") || field.label.toLowerCase().includes("link");
}
