import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { CollectionConfig } from "./collections";
import type { GalleryItem } from "../auth/api";
import { DEFAULT_FOCAL, type FocalPoint } from "../../app/focal";
import { FocalPreview } from "./FocalPreview";
import { MediaDrop } from "./MediaDrop";
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

export type ItemFormSavePayload = {
  values: ItemFormValues;
  image?: { imageUrl: string; imageKey: string };
  afterImage?: { imageUrl: string; imageKey: string };
  focal: FocalPoint;
  afterFocal: FocalPoint;
};

const emptyValues = (cfg: CollectionConfig): ItemFormValues => ({
  title: "",
  category: "",
  price: "",
  link: "",
  status: cfg.statusOptions?.[0]?.value ?? "disponivel",
  alt_text: "",
  published: cfg.imageMode === "before-after" ? false : true,
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

type FieldErrors = { title?: string; image?: string; afterImage?: string; form?: string };

type SlotState = {
  prepared: PreparedImage | null;
  stage: UploadStage;
  stageDetail: string;
  focal: FocalPoint;
};

type Props = {
  config: CollectionConfig;
  initial?: GalleryItem | null;
  onCancel: () => void;
  onSaved: () => void;
  save: (payload: ItemFormSavePayload) => Promise<void>;
};

function PhotoSlot({
  label,
  previewSrc,
  focal,
  onFocalChange,
  prepared,
  stage,
  stageDetail,
  error,
  busy,
  onFile,
  onClearPrepared,
  emptyTitle,
}: {
  label?: string;
  previewSrc: string;
  focal: FocalPoint;
  onFocalChange: (next: FocalPoint) => void;
  prepared: PreparedImage | null;
  stage: UploadStage;
  stageDetail: string;
  error?: string;
  busy: boolean;
  onFile: (file: File | null) => void;
  onClearPrepared?: () => void;
  emptyTitle: string;
}) {
  const processing =
    stage === "reading" ||
    stage === "converting" ||
    stage === "compressing" ||
    stage === "presigning" ||
    stage === "uploading";
  const progress = stageProgress(stage);

  return (
    <div className="ks-gallery-photo-slot">
      {label ? <p className="ks-gallery-photo-slot-label">{label}</p> : null}
      <MediaDrop
        className="ks-gallery-drop"
        accept="image/jpeg,image/png,image/webp,image/avif,.heic,.heif,image/heic,image/heif"
        capture="environment"
        disabled={busy}
        hasMedia={Boolean(previewSrc)}
        error={Boolean(error)}
        replaceLabel="Trocar foto"
        onFile={(file) => void onFile(file)}
        onRemove={prepared ? onClearPrepared : undefined}
        progress={processing ? { value: progress, label: stageLabel(stage, stageDetail) } : null}
        empty={
          <>
            <img src="/assets/brand/star-karina-outline.webp" alt="" className="ks-gallery-drop-star" />
            <strong>{emptyTitle}</strong>
            <span>Toque para escolher ou arraste a imagem aqui</span>
            <span className="ks-gallery-drop-hint">JPEG, PNG, WebP ou HEIC · até ~800 KB</span>
          </>
        }
      >
        <FocalPreview
          src={previewSrc}
          value={focal}
          onChange={onFocalChange}
          disabled={busy}
          naturalWidth={prepared?.width}
          naturalHeight={prepared?.height}
        />
        {prepared ? (
          <p className="ks-gallery-drop-meta">
            {prepared.width}×{prepared.height} · {formatBytes(prepared.bytes)}
          </p>
        ) : null}
      </MediaDrop>
      {error ? (
        <p className="ks-admin-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ItemForm({ config, initial, onCancel, onSaved, save }: Props) {
  const editing = Boolean(initial);
  const beforeAfter = config.imageMode === "before-after";
  const [values, setValues] = useState<ItemFormValues>(() =>
    initial ? fromItem(initial, config) : emptyValues(config),
  );
  const [before, setBefore] = useState<SlotState>(() => ({
    prepared: null,
    stage: "idle",
    stageDetail: "",
    focal: initial
      ? { x: initial.focal_x ?? 50, y: initial.focal_y ?? 50 }
      : { ...DEFAULT_FOCAL },
  }));
  const [after, setAfter] = useState<SlotState>(() => ({
    prepared: null,
    stage: "idle",
    stageDetail: "",
    focal: initial
      ? { x: initial.after_focal_x ?? 50, y: initial.after_focal_y ?? 50 }
      : { ...DEFAULT_FOCAL },
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const beforePreview = before.prepared?.previewUrl || initial?.image_url || "";
  const afterPreview = after.prepared?.previewUrl || initial?.after_image_url || "";
  const hasAfter = Boolean(after.prepared || initial?.after_image_url);
  const processing =
    before.stage === "reading" ||
    before.stage === "converting" ||
    before.stage === "compressing" ||
    before.stage === "presigning" ||
    before.stage === "uploading" ||
    after.stage === "reading" ||
    after.stage === "converting" ||
    after.stage === "compressing" ||
    after.stage === "presigning" ||
    after.stage === "uploading";
  const busy = submitting || processing;

  useEffect(() => {
    return () => {
      if (before.prepared?.previewUrl) URL.revokeObjectURL(before.prepared.previewUrl);
      if (after.prepared?.previewUrl) URL.revokeObjectURL(after.prepared.previewUrl);
    };
  }, [before.prepared, after.prepared]);

  function setField<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (key === "title") setErrors((e) => ({ ...e, title: undefined }));
  }

  async function onSlotFile(
    slot: "before" | "after",
    file: File | null,
  ) {
    if (!file || busy) return;
    const setSlot = slot === "before" ? setBefore : setAfter;
    const errorKey = slot === "before" ? "image" : "afterImage";
    setErrors((e) => ({ ...e, [errorKey]: undefined, form: undefined }));

    setSlot((prev) => {
      if (prev.prepared?.previewUrl) URL.revokeObjectURL(prev.prepared.previewUrl);
      return { ...prev, prepared: null, focal: { ...DEFAULT_FOCAL }, stage: "reading", stageDetail: "" };
    });

    try {
      const next = await prepareImage(file, (s, detail) => {
        setSlot((prev) => ({ ...prev, stage: s, stageDetail: detail ?? "" }));
      });
      setSlot((prev) => ({
        ...prev,
        prepared: next,
        stage: "preview",
        stageDetail: "",
        focal: { ...DEFAULT_FOCAL },
      }));
    } catch (err) {
      setSlot((prev) => ({ ...prev, stage: "error" }));
      setErrors({
        [errorKey]: err instanceof Error ? err.message : "Não foi possível preparar a foto.",
      });
    }
  }

  function clearPrepared(slot: "before" | "after") {
    if (busy) return;
    const setSlot = slot === "before" ? setBefore : setAfter;
    setSlot((prev) => {
      if (prev.prepared?.previewUrl) URL.revokeObjectURL(prev.prepared.previewUrl);
      const focal =
        slot === "before"
          ? initial
            ? { x: initial.focal_x ?? 50, y: initial.focal_y ?? 50 }
            : { ...DEFAULT_FOCAL }
          : initial
            ? { x: initial.after_focal_x ?? 50, y: initial.after_focal_y ?? 50 }
            : { ...DEFAULT_FOCAL };
      return { prepared: null, stage: "idle", stageDetail: "", focal };
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;

    const nextErrors: FieldErrors = {};
    if (!values.title.trim()) nextErrors.title = "Escreva um título.";
    if (!editing && !before.prepared) {
      nextErrors.image = beforeAfter
        ? "Escolha a foto do antes."
        : "Escolha uma foto para este item.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const canPublish = beforeAfter ? hasAfter || Boolean(after.prepared) : true;
    const publishValues: ItemFormValues =
      beforeAfter && values.published && !canPublish
        ? { ...values, published: false }
        : values;

    setErrors({});
    setSubmitting(true);
    try {
      let image: { imageUrl: string; imageKey: string } | undefined;
      let afterImage: { imageUrl: string; imageKey: string } | undefined;

      if (before.prepared) {
        const uploaded = await uploadPreparedImage(before.prepared, config.id, (s, detail) => {
          setBefore((prev) => ({ ...prev, stage: s, stageDetail: detail ?? "" }));
        });
        image = { imageUrl: uploaded.imageUrl, imageKey: uploaded.imageKey };
      }
      if (beforeAfter && after.prepared) {
        const uploaded = await uploadPreparedImage(after.prepared, config.id, (s, detail) => {
          setAfter((prev) => ({ ...prev, stage: s, stageDetail: detail ?? "" }));
        });
        afterImage = { imageUrl: uploaded.imageUrl, imageKey: uploaded.imageKey };
      }

      await save({
        values: publishValues,
        image,
        afterImage,
        focal: before.focal,
        afterFocal: after.focal,
      });
      setBefore((prev) => ({ ...prev, stage: "done" }));
      setAfter((prev) => ({ ...prev, stage: "done" }));
      onSaved();
    } catch (err) {
      setBefore((prev) => ({ ...prev, stage: "error" }));
      setAfter((prev) => ({ ...prev, stage: "error" }));
      setErrors({
        form: err instanceof Error ? err.message : "Não foi possível salvar.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const fieldsBlock: ReactNode = (
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
              placeholder={beforeAfter ? "Ex.: Cobertura" : "Ex.: Botânica"}
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
          <label
            className={`ks-gallery-flag${values.published ? " is-on" : ""}${
              beforeAfter && !hasAfter ? " is-blocked" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={values.published}
              onChange={(e) => {
                if (beforeAfter && e.target.checked && !hasAfter) {
                  setErrors({
                    form: "Para publicar, envie as fotos de antes e depois.",
                  });
                  return;
                }
                setField("published", e.target.checked);
              }}
              disabled={busy || (beforeAfter && !hasAfter && !values.published)}
            />
            <span className="ks-gallery-flag-switch" aria-hidden="true" />
            <span className="ks-gallery-flag-copy">
              <strong>Publicado no site</strong>
              <span>
                {beforeAfter && !hasAfter
                  ? "Rascunho — falta a foto do depois"
                  : values.published
                    ? "Visível na galeria pública"
                    : "Oculto — só no painel"}
              </span>
            </span>
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
  );

  return (
    <form className="ks-admin-form ks-gallery-form" onSubmit={(e) => void onSubmit(e)} noValidate>
      <div className={`ks-gallery-form-layout${beforeAfter ? " is-before-after" : ""}`}>
        {beforeAfter ? (
          <div className="ks-gallery-photo-pair">
            <PhotoSlot
              label="Antes"
              emptyTitle="Foto do antes"
              previewSrc={beforePreview}
              focal={before.focal}
              onFocalChange={(focal) => setBefore((prev) => ({ ...prev, focal }))}
              prepared={before.prepared}
              stage={before.stage}
              stageDetail={before.stageDetail}
              error={errors.image}
              busy={busy}
              onFile={(file) => void onSlotFile("before", file)}
              onClearPrepared={() => clearPrepared("before")}
            />
            <PhotoSlot
              label="Depois"
              emptyTitle="Foto do depois"
              previewSrc={afterPreview}
              focal={after.focal}
              onFocalChange={(focal) => setAfter((prev) => ({ ...prev, focal }))}
              prepared={after.prepared}
              stage={after.stage}
              stageDetail={after.stageDetail}
              error={errors.afterImage}
              busy={busy}
              onFile={(file) => void onSlotFile("after", file)}
              onClearPrepared={() => clearPrepared("after")}
            />
          </div>
        ) : (
          <div className="ks-gallery-photo-col">
            <PhotoSlot
              emptyTitle="Adicionar foto"
              previewSrc={beforePreview}
              focal={before.focal}
              onFocalChange={(focal) => setBefore((prev) => ({ ...prev, focal }))}
              prepared={before.prepared}
              stage={before.stage}
              stageDetail={before.stageDetail}
              error={errors.image}
              busy={busy}
              onFile={(file) => void onSlotFile("before", file)}
              onClearPrepared={before.prepared ? () => clearPrepared("before") : undefined}
            />
          </div>
        )}
        {fieldsBlock}
      </div>
    </form>
  );
}
