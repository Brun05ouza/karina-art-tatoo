import { useEffect, useState, type FormEvent } from "react";
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
  const [values, setValues] = useState<ItemFormValues>(() =>
    initial ? fromItem(initial, config) : emptyValues(config),
  );
  const [prepared, setPrepared] = useState<PreparedImage | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [stageDetail, setStageDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (prepared?.previewUrl) URL.revokeObjectURL(prepared.previewUrl);
    };
  }, [prepared]);

  function setField<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    if (prepared?.previewUrl) URL.revokeObjectURL(prepared.previewUrl);
    setPrepared(null);
    try {
      const next = await prepareImage(file, (s, detail) => {
        setStage(s);
        setStageDetail(detail ?? "");
      });
      setPrepared(next);
      setStage("preview");
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Não foi possível preparar a foto.");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.title.trim()) {
      setError("Escreva um título.");
      return;
    }
    if (!editing && !prepared) {
      setError("Escolha uma foto para este item.");
      return;
    }

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
      onSaved();
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || stage === "converting" || stage === "compressing" || stage === "uploading" || stage === "presigning";

  return (
    <form className="ks-admin-form ks-gallery-form" onSubmit={(e) => void onSubmit(e)} noValidate>
      <div className="ks-gallery-upload">
        <label className="ks-gallery-file">
          <span className="ks-gallery-file-label">
            {editing ? "Trocar foto (opcional)" : "Foto"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,.heic,.heif,image/heic,image/heif"
            capture="environment"
            disabled={busy}
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
          <span className="ks-gallery-file-btn">
            {prepared || initial ? "Escolher outra foto" : "Escolher foto"}
          </span>
        </label>

        {(prepared?.previewUrl || initial?.image_url) && (
          <div className="ks-gallery-preview">
            <img
              src={prepared?.previewUrl || initial!.image_url}
              alt=""
              width={prepared?.width || 800}
              height={prepared?.height || 800}
            />
            {prepared ? (
              <p>
                {prepared.width}×{prepared.height} · {formatBytes(prepared.bytes)}
              </p>
            ) : null}
          </div>
        )}

        {stage !== "idle" && stage !== "done" && stage !== "preview" ? (
          <p className="ks-gallery-stage" role="status">
            {stageDetail ||
              (stage === "converting"
                ? "Abrindo foto do iPhone…"
                : stage === "compressing"
                  ? "Ajustando tamanho…"
                  : stage === "presigning" || stage === "uploading"
                    ? "Enviando…"
                    : "Processando…")}
          </p>
        ) : null}
      </div>

      {config.fields.includes("title") ? (
        <label className="ks-admin-field">
          <span>Título</span>
          <input
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            required
            disabled={busy}
            maxLength={120}
          />
        </label>
      ) : null}

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
            placeholder='Ex.: a partir de R$ 300'
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
        <label className="ks-admin-field">
          <span>Descrição da imagem (acessibilidade)</span>
          <input
            value={values.alt_text}
            onChange={(e) => setField("alt_text", e.target.value)}
            disabled={busy}
            maxLength={200}
            placeholder="Breve descrição do que aparece na foto"
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

      {error ? (
        <p className="ks-admin-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="ks-gallery-form-actions">
        <button type="submit" className="ks-admin-btn" disabled={busy}>
          {busy ? "Salvando…" : editing ? "Salvar alterações" : "Adicionar"}
        </button>
        <button type="button" className="ks-admin-btn ks-admin-btn--secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
