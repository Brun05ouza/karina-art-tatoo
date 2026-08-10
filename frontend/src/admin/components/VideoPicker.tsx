import { Trash2, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadVideo } from "../data/mediaStore";
import { AdminButton } from "./Primitives";

export function VideoPicker({ value, onChange, label = "Vídeo", description, folder = "admin/uploads" }: { value?: string; onChange(url: string, key: string): void; label?: string; description?: string; folder?: string }) {
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const localUrl = useRef<string | null>(null);

  useEffect(() => { if (!localUrl.current) setPreview(value || ""); }, [value]);
  useEffect(() => () => { if (localUrl.current) URL.revokeObjectURL(localUrl.current); }, []);

  const pick = async (file?: File) => {
    if (!file) return;
    if (localUrl.current) URL.revokeObjectURL(localUrl.current);
    const localPreview = URL.createObjectURL(file);
    localUrl.current = localPreview;
    setPreview(localPreview);
    setError("");
    setUploading(true);
    try {
      const video = await uploadVideo(file, folder);
      setPreview(video.videoUrl);
      onChange(video.videoUrl, video.videoKey);
    } catch (cause) {
      setPreview(value || "");
      setError(cause instanceof Error ? cause.message : "Vídeo inválido.");
    } finally {
      setUploading(false);
    }
  };

  return <div className="ksa-image-picker"><span className="ksa-label">{label}</span>{description && <small className="ksa-hint ksa-image-picker-description">{description}</small>}<div className="ksa-image-picker-box">{preview ? <video src={preview} muted loop playsInline /> : <div className="ksa-image-placeholder"><Video size={28} /><span>Escolher vídeo</span></div>}<label className="ksa-image-action">{!uploading && <input type="file" accept="video/mp4,video/webm" onChange={(event) => void pick(event.target.files?.[0])} />}{uploading ? "Enviando…" : preview ? "Substituir" : "Selecionar"}</label>{preview && !uploading && <AdminButton type="button" tone="ghost" size="sm" className="ksa-image-remove" aria-label="Remover vídeo" title="Remover vídeo" onClick={() => { setPreview(""); onChange("", ""); }}><Trash2 size={15} /></AdminButton>}</div><small className="ksa-hint">MP4 ou WebM · até 20 MB.</small>{error && <small className="ksa-error">{error}</small>}</div>;
}
