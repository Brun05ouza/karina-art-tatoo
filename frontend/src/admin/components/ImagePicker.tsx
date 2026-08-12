import { ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadImage } from "../data/mediaStore";
import { AdminButton } from "./Primitives";

type ImagePickerProps = {
  value?: string;
  onChange(url: string, key: string): void;
  label?: string;
  description?: string;
  folder?: string;
  compositionHint?: boolean;
};

function canPreviewLocally(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return !["heic", "heif"].includes(extension || "") && !file.type.toLowerCase().includes("hei");
}

export function ImagePicker({
  value,
  onChange,
  label = "Imagem",
  description,
  folder = "admin/uploads",
  compositionHint = false,
}: ImagePickerProps) {
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const localUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!localUrl.current) setPreview(value || "");
  }, [value]);

  useEffect(
    () => () => {
      if (localUrl.current) URL.revokeObjectURL(localUrl.current);
    },
    [],
  );

  const pick = async (file?: File) => {
    if (!file) return;

    if (localUrl.current) URL.revokeObjectURL(localUrl.current);
    localUrl.current = null;

    // Prévia local imediata enquanto o upload roda — exceto HEIC/HEIF, porque
    // alguns navegadores não exibem esse formato antes da conversão para JPG.
    if (canPreviewLocally(file)) {
      const localPreview = URL.createObjectURL(file);
      localUrl.current = localPreview;
      setPreview(localPreview);
    } else {
      setPreview(value || "");
    }
    setError("");
    setUploading(true);

    try {
      const image = await uploadImage(file, folder);
      setPreview(image.imageUrl);
      onChange(image.imageUrl, image.imageKey);
    } catch (cause) {
      setPreview(value || "");
      setError(cause instanceof Error ? cause.message : "Imagem inválida.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="ksa-image-picker">
      <span className="ksa-label">{label}</span>
      {description && <small className="ksa-hint ksa-image-picker-description">{description}</small>}
      <div className="ksa-image-picker-box">
        {preview ? (
          <img src={preview} alt="Prévia selecionada" />
        ) : (
          <div className="ksa-image-placeholder">
            <ImagePlus size={28} />
            <span>Escolher imagem</span>
          </div>
        )}
        <label className="ksa-image-action">
          {!uploading && (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif"
              onChange={(event) => void pick(event.target.files?.[0])}
            />
          )}
          {uploading ? "Enviando…" : preview ? "Substituir" : "Selecionar"}
        </label>
        {preview && !uploading && (
          <AdminButton
            type="button"
            tone="ghost"
            size="sm"
            className="ksa-image-remove"
            aria-label="Remover imagem"
            title="Remover imagem"
            onClick={() => {
              setPreview("");
              onChange("", "");
            }}
          >
            <Trash2 size={15} />
          </AdminButton>
        )}
        {compositionHint && (
          <div className="ksa-image-guidance" aria-hidden="true">
            <span>Dica de composição</span>
            <strong>Prefira imagens com espaço livre na esquerda.</strong>
            <small>Esse respiro ajuda o texto da seção da página a encaixar sem ficar comido.</small>
          </div>
        )}
      </div>
      <small className="ksa-hint">
        JPG, PNG, WebP, AVIF ou HEIC · HEIC vira JPG automaticamente · até 2 MB no bucket.
      </small>
      {error && <small className="ksa-error">{error}</small>}
    </div>
  );
}
