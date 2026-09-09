import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { CollectionConfig } from "./collections";
import type { GalleryItem } from "../auth/api";
import {
  formatBytes,
  prepareImage,
  uploadPreparedImage,
  type PreparedImage,
  type UploadStage,
} from "./upload";

export type ItemFormValues = {
  title: string;
  category: string;
  price: string;
  link: string;
  status: string;
  alt_text: string;
  published: boolean;
};

const emptyValues = (cfg: CollectionConfig): ItemFormValues => ({
  title: "",
  category: "",
  price: "",
  link: "",
  status: cfg.statusOptions?.[0]?.value ?? "disponivel",
  alt_text: "",
  published: true,
});

function fromItem(item: GalleryItem, cfg: CollectionConfig): ItemFormValues {
  return {
    title: item.title,
    category: item.category ?? "",
    price: item.price ?? "",
    link: item.link ?? "",
    status: item.status ?? cfg.statusOptions?.[0]?.value ?? "disponivel",
    alt_text: item.alt_text ?? "",
    published: item.published,
  };
}

function stageProgress(stage: UploadStage): number {
  switch (stage) {
    case "reading":
    case "converting":
      return 22;
    case "compressing":
      return 48;
    case "presigning":
      return 68;
    case "uploading":
      return 88;
    case "preview":
    case "done":
      return 100;
    default:
      return 0;
  }
}

function stageLabel(stage: UploadStage, detail: string): string {
  if (detail) return detail;
  if (stage === "converting") return "Abrindo foto do iPhone…";
  if (stage === "compressing") return "Ajustando tamanho…";
  if (stage === "presigning" || stage === "uploading") return "Enviando…";
  if (stage === "reading") return "Lendo foto…";
  return "Processando…";
}

type FieldErrors = { title?: string; image?: string; form?: string };

type Props = {
  config: CollectionConfig;
  initial?: GalleryItem | null;
  onCancel: () => void;
  onSaved: () => void;
  save: (payload: {
    values: ItemFormValues;
    image?: { imageUrl: string; imageKey: string };
  }) => Promise<void>;
};

export function ItemForm({ config, initial, onCancel, onSaved, save }: Props) {
  const editing = Boolean(initial);
  const fileId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<ItemFormValues>(() =>
    initial ? fromItem(initial, config) : emptyValues(config),
  );
  const [prepared, setPrepared] = useState<PreparedImage | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [stageDetail, setStageDetail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const previewSrc = prepared?.previewUrl || initial?.image_url || "";
  const processing =
    stage === "reading" ||
    stage === "converting" ||
    stage === "compressing" ||
    stage === "presigning" ||
    stage === "uploading";
  const busy = submitting || processing;

  useEffect(() => {
    return () => {
      if (prepared?.previewUrl) URL.revokeObjectURL(prepared.previewUrl);
    };
  }, [prepared]);

  function setField<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (key === "title") setErrors((e) => ({ ...e, title: undefined }));
  }

  async function onFile(file: File | null) {
    if (!file || busy) return;
    setErrors((e) => ({ ...e, image: undefined, form: undefined }));
    if (prepared?.previewUrl) URL.revokeObjectURL(prepared.previewUrl);
    setPrepared(null);
    try {
      const next = await prepareImage(file, (s, detail) => {
        setStage(s);
        setStageDetail(detail ?? "");
      });
      setPrepared(next);
      setStage("preview");
      setStageDetail("");
    } catch (err) {
      setStage("error");
      setErrors({
        image: err instanceof Error ? err.message : "Não foi possível preparar a foto.",
      });
    }
  }

  function clearPrepared() {
    if (busy) return;
    if (prepared?.previewUrl) URL.revokeObjectURL(prepared.previewUrl);
    setPrepared(null);
    setStage("idle");
    setStageDetail("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;

    const nextErrors: FieldErrors = {};
    if (!values.title.trim()) nextErrors.title = "Escreva um título.";
    if (!editing && !prepared) nextErrors.image = "Escolha uma foto para este item.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      let image: { imageUrl: string; imageKey: string } | undefined;
      if (prepared) {
        const uploaded = await uploadPreparedImage(prepared, config.id, (s, detail) => {
          setStage(s);
          setStageDetail(detail ?? "");
        });
        image = { imageUrl: uploaded.imageUrl, imageKey: uploaded.imageKey };
      }
      await save({ values, image });
      setStage("done");
      onSaved();
    } catch (err) {
      setStage("error");
      setErrors({
        form: err instanceof Error ? err.message : "Não foi possível salvar.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const progress = stageProgress(stage);

  return (
    <form className="ks-admin-form ks-gallery-form" onSubmit={(e) => void onSubmit(e)} noValidate>
      <div className="ks-gallery-form-layout">
        <div className="ks-gallery-photo-col">
          <div
            className={`ks-gallery-drop${previewSrc ? " has-preview" : ""}${dragOver ? " is-drag" : ""}${errors.image ? " has-error" : ""}`}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0] ?? null;
              void onFile(file);
            }}
          >
            <input
              ref={inputRef}
              id={fileId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,.heic,.heif,image/heic,image/heif"
              capture="environment"
              disabled={busy}
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />

            {previewSrc ? (
              <>
                <img className="ks-gallery-drop-img" src={previewSrc} alt="" />
                <div className="ks-gallery-drop-actions">
                  <label htmlFor={fileId} className="ks-gallery-drop-btn">
                    Trocar foto
                  </label>
                  {prepared ? (
                    <button type="button" className="ks-gallery-drop-btn ks-gallery-drop-btn--ghost" onClick={clearPrepared} disabled={busy}>
                      Remover
                    </button>
                  ) : null}
                </div>
                {prepared ? (
                  <p className="ks-gallery-drop-meta">
                    {prepared.width}×{prepared.height} · {formatBytes(prepared.bytes)}
                  </p>
                ) : null}
              </>
            ) : (
              <label htmlFor={fileId} className="ks-gallery-drop-empty">
                <img src="/assets/brand/star-karina-outline.webp" alt="" className="ks-gallery-drop-star" />
                <strong>Adicionar foto</strong>
                <span>Toque para escolher ou arraste a imagem aqui</span>
                <span className="ks-gallery-drop-hint">JPEG, PNG, WebP ou HEIC · até ~2 MB</span>
              </label>
            )}

            {processing ? (
              <div className="ks-gallery-drop-progress" role="status" aria-live="polite">
                <div className="ks-gallery-drop-progress-bar" style={{ width: `${progress}%` }} />
                <p>{stageLabel(stage, stageDetail)}</p>
              </div>
            ) : null}
          </div>
          {errors.image ? (
            <p className="ks-admin-field-error" role="alert">
              {errors.image}
            </p>
          ) : null}
        </div>

        <div className="ks-gallery-fields-col">
          {config.fields.includes("title") ? (
            <label className={`ks-admin-field ks-admin-field--title${errors.title ? " has-error" : ""}`}>
              <span>Título</span>
              <input
                value={values.title}
                onChange={(e) => setField("title", e.target.value)}
                required
                disabled={busy}
                maxLength={120}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title ? <span className="ks-admin-field-error">{errors.title}</span> : null}
            </label>
          ) : null}

          <div className="ks-gallery-fields-support">
            {config.fields.includes("category") ? (
              <label className="ks-admin-field">
                <span>Categoria</span>
                <input
                  value={values.category}
                  onChange={(e) => setField("category", e.target.value)}
                  disabled={busy}
                  maxLength={60}
                  placeholder="Ex.: Botânica"
                />
              </label>
            ) : null}

            {config.fields.includes("price") ? (
              <label className="ks-admin-field">
                <span>Preço</span>
                <input
                  value={values.price}
                  onChange={(e) => setField("price", e.target.value)}
                  disabled={busy}
                  maxLength={40}
                  placeholder="Ex.: a partir de R$ 300"
                />
              </label>
            ) : null}

            {config.fields.includes("link") ? (
              <label className="ks-admin-field">
                <span>Link</span>
                <input
                  type="url"
                  value={values.link}
                  onChange={(e) => setField("link", e.target.value)}
                  disabled={busy}
                  placeholder="https://…"
                />
              </label>
            ) : null}

            {config.fields.includes("status") && config.statusOptions ? (
              <label className="ks-admin-field">
                <span>Status</span>
                <select
                  value={values.status}
                  onChange={(e) => setField("status", e.target.value)}
                  disabled={busy}
                >
                  {config.statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {config.fields.includes("alt_text") ? (
              <label className="ks-admin-field ks-admin-field--muted">
                <span>Texto alternativo</span>
                <input
                  value={values.alt_text}
                  onChange={(e) => setField("alt_text", e.target.value)}
                  disabled={busy}
                  maxLength={200}
                  placeholder="Opcional — descrição para acessibilidade"
                />
              </label>
            ) : null}

            {config.fields.includes("published") ? (
              <label className="ks-gallery-check">
                <input
                  type="checkbox"
                  checked={values.published}
                  onChange={(e) => setField("published", e.target.checked)}
                  disabled={busy}
                />
                <span>Publicado no site</span>
              </label>
            ) : null}
          </div>

          {errors.form ? (
            <p className="ks-admin-field-error" role="alert">
              {errors.form}
            </p>
          ) : null}

          <div className="ks-gallery-form-actions">
            <button type="submit" className="ks-admin-btn" disabled={busy}>
              {busy ? "Salvando…" : editing ? "Salvar alterações" : "Adicionar"}
            </button>
            <button
              type="button"
              className="ks-admin-btn ks-admin-btn--secondary"
              onClick={onCancel}
              disabled={busy}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
