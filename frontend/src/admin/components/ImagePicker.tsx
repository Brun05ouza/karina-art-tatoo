import { ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { prepareLocalImage } from "../data/mediaStore";
import { AdminButton } from "./Primitives";

export function ImagePicker({ value, onChange, label = "Imagem" }: { value?: string; onChange(url: string, key: string): void; label?: string }) {
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState("");
  const localUrl = useRef<string | null>(null);

  useEffect(() => { if (!localUrl.current) setPreview(value || ""); }, [value]);
  useEffect(() => () => { if (localUrl.current) URL.revokeObjectURL(localUrl.current); }, []);

  const pick = (file?: File) => {
    if (!file) return;
    try {
      if (localUrl.current) URL.revokeObjectURL(localUrl.current);
      const image = prepareLocalImage(file);
      localUrl.current = image.imageUrl;
      setPreview(image.imageUrl);
      setError("");
      onChange(image.imageUrl, image.imageKey);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Imagem inválida.");
    }
  };

  return <div className="ksa-image-picker"><span className="ksa-label">{label}</span><div className="ksa-image-picker-box">{preview ? <img src={preview} alt="Prévia selecionada" /> : <div className="ksa-image-placeholder"><ImagePlus size={28} /><span>Escolher imagem</span></div>}<label className="ksa-image-action"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => pick(event.target.files?.[0])} />{preview ? "Substituir" : "Selecionar"}</label>{preview && <AdminButton type="button" tone="ghost" size="sm" onClick={() => { setPreview(""); onChange("", ""); }}><Trash2 size={14} />Remover</AdminButton>}</div><small className="ksa-hint">JPG, PNG, WebP ou AVIF · recomendado 2000 px · até 2 MB.</small>{error && <small className="ksa-error">{error}</small>}</div>;
}
