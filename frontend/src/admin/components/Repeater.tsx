import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImage } from "../data/mediaStore";
import { ImagePicker } from "./ImagePicker";
import { AdminButton, Field, InternalLinkInput, TextArea, TextInput, Toggle } from "./Primitives";

export type RepeaterField = { key: string; label: string; type?: "text" | "textarea" | "image" | "internalLink"; hint?: string; folder?: string };

type RepeaterItem = { id: string; active: boolean; order: number; imageUrl?: string };

function WindowImageButton({
  value,
  folder,
  onChange,
}: {
  value: string;
  folder?: string;
  onChange(url: string): void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (file?: File) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const image = await uploadImage(file, folder || "home/servicos");
      onChange(image.imageUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Imagem inválida.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="ksa-window-image-actions">
      <label className={`ksa-btn ksa-btn--ghost ksa-btn--sm ${uploading ? "is-disabled" : ""}`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif"
          disabled={uploading}
          onChange={(event) => void pick(event.target.files?.[0])}
        />
        {uploading ? "Enviando…" : value ? "Trocar imagem" : "Escolher imagem"}
      </label>
      {value ? (
        <AdminButton
          type="button"
          tone="ghost"
          size="sm"
          aria-label="Remover imagem"
          onClick={() => onChange("")}
        >
          <Trash2 size={14} />
        </AdminButton>
      ) : null}
      {error ? <small className="ksa-error">{error}</small> : null}
    </div>
  );
}

/**
 * Lista editável de cards: ordem, ativo/inativo, adicionar e excluir.
 *
 * A cliente só mexe em conteúdo — não há campo de cor, fonte ou espaçamento,
 * então não é possível quebrar o layout do site a partir daqui.
 */
export function Repeater<T extends RepeaterItem>({
  items,
  fields,
  onChange,
  blank,
  addLabel = "Adicionar item",
  max,
  compact = false,
  cards = false,
  windowPreview = false,
}: {
  items: T[];
  fields: RepeaterField[];
  onChange(next: T[]): void;
  blank?: () => T;
  addLabel?: string;
  max?: number;
  compact?: boolean;
  cards?: boolean;
  /** Card de serviços: janela com prévia + botão simples de imagem + textos. */
  windowPreview?: boolean;
}) {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const imageFields = fields.filter((field) => field.type === "image");
  const contentFields = fields.filter((field) => field.type !== "image");
  const primaryImageField = imageFields[0];

  /** Reescreve `order` sequencialmente para não deixar buracos após mover/excluir. */
  const commit = (next: T[]) => onChange(next.map((item, index) => ({ ...item, order: index + 1 })));

  const patch = (id: string, changes: Partial<T>) => commit(sorted.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    const moved = next[index]!;
    next[index] = next[target]!;
    next[target] = moved;
    commit(next);
  };

  const renderContentField = (item: T, field: RepeaterField) => {
    const current = String((item as Record<string, unknown>)[field.key] ?? "");
    return (
      <Field key={field.key} label={field.label} hint={field.hint} className={cards ? `ksa-repeater-field--${field.key}` : ""}>
        {field.type === "internalLink" || field.key === "url"
          ? <InternalLinkInput ariaLabel={field.label} value={current} onChange={(next) => patch(item.id, { [field.key]: next } as Partial<T>)} />
          : field.type === "textarea"
          ? <TextArea aria-label={field.label} rows={windowPreview ? 2 : 3} value={current} onChange={(event) => patch(item.id, { [field.key]: event.target.value } as Partial<T>)} />
          : <TextInput aria-label={field.label} value={current} onChange={(event) => patch(item.id, { [field.key]: event.target.value } as Partial<T>)} />}
      </Field>
    );
  };

  return (
    <div className={`ksa-stack ${compact ? "is-compact" : ""} ${cards ? "is-card-list" : ""}`}>
      {sorted.map((item, index) => {
        const previewUrl = primaryImageField
          ? String((item as Record<string, unknown>)[primaryImageField.key] ?? "")
          : String(item.imageUrl ?? "");

        return (
          <article
            className={`ksa-mini-editor ${compact ? "is-compact" : ""} ${cards ? "is-card" : ""} ${windowPreview ? "is-window-card" : ""}`}
            key={item.id}
          >
            <div className="ksa-mini-editor-order">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Mover para cima"><ArrowUp size={15} /></button>
              <button type="button" disabled={index === sorted.length - 1} onClick={() => move(index, 1)} aria-label="Mover para baixo"><ArrowDown size={15} /></button>
            </div>

            {windowPreview && primaryImageField ? (
              <div className="ksa-window-card-media">
                <div className="ksa-window-preview" aria-label="Prévia da janela">
                  <div className="ksa-window-portal">
                    {previewUrl ? (
                      <img src={previewUrl} alt="" />
                    ) : (
                      <div className="ksa-window-preview-empty">
                        <ImagePlus size={22} />
                        <span>Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <WindowImageButton
                    value={previewUrl}
                    folder={primaryImageField.folder}
                    onChange={(url) => patch(item.id, { [primaryImageField.key]: url } as Partial<T>)}
                  />
                </div>
                <div className="ksa-window-card-fields">
                  {contentFields.map((field) => renderContentField(item, field))}
                </div>
              </div>
            ) : (
              <>
                {imageFields.map((field) => {
                  const current = String((item as Record<string, unknown>)[field.key] ?? "");
                  return (
                    <div className="ksa-repeater-image" key={field.key}>
                      <ImagePicker label={field.label} description={field.hint} folder={field.folder} value={current} onChange={(url) => patch(item.id, { [field.key]: url } as Partial<T>)} />
                    </div>
                  );
                })}
                {contentFields.map((field) => renderContentField(item, field))}
              </>
            )}

            <Toggle checked={item.active} onChange={(active) => patch(item.id, { active } as Partial<T>)} label={compact ? undefined : (item.active ? "Ativo" : "Inativo")} ariaLabel={item.active ? "Desativar item" : "Ativar item"} />

            <button type="button" className="ksa-icon-danger" aria-label="Excluir" onClick={() => commit(sorted.filter((current) => current.id !== item.id))}><Trash2 size={16} /></button>
          </article>
        );
      })}

      {blank && (!max || sorted.length < max) ? (
        <AdminButton tone="ghost" size={compact ? "sm" : "md"} className={compact ? "ksa-repeater-add" : ""} onClick={() => commit([...sorted, blank()])}><Plus size={16} />{addLabel}</AdminButton>
      ) : null}
    </div>
  );
}
