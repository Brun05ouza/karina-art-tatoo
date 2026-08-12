import { Trash2, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AdminButton } from "./Primitives";
import { dismissUploadJob, enqueueVideoUpload, useUploadJobs, type UploadTarget } from "../uploads/uploadQueue";

/**
 * O upload em si roda na fila global (uploads/uploadQueue.ts), não aqui — isso
 * é o que deixa a admin sair desta tela sem perder o vídeo que está subindo
 * (o card no canto da tela continua acompanhando, e há um passo de reformulações
 * de "aplicar quando terminar" que casa o resultado com este mesmo item ao voltar).
 *
 * `target` identifica o item/campo que está recebendo o vídeo. Se o job
 * terminar enquanto este formulário ainda estiver aberto, o resultado é
 * aplicado na hora, sem precisar navegar pra lugar nenhum.
 */
export function VideoPicker({
  value,
  onChange,
  label = "Vídeo",
  description,
  folder = "admin/uploads",
  target,
}: {
  value?: string;
  onChange(url: string, key: string): void;
  label?: string;
  description?: string;
  folder?: string;
  target: UploadTarget;
}) {
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const localUrl = useRef<string | null>(null);
  const appliedRef = useRef(false);
  const jobs = useUploadJobs();
  const job = jobId ? jobs.find((item) => item.id === jobId) : undefined;

  useEffect(() => {
    if (!localUrl.current) setPreview(value || "");
  }, [value]);

  useEffect(
    () => () => {
      if (localUrl.current) URL.revokeObjectURL(localUrl.current);
    },
    [],
  );

  useEffect(() => {
    if (!job || appliedRef.current) return;

    if (job.stage === "done" && job.result) {
      appliedRef.current = true;
      setPreview(job.result.url);
      onChange(job.result.url, job.result.key);
      dismissUploadJob(job.id);
      setJobId(null);
    } else if (job.stage === "error") {
      appliedRef.current = true;
      setError(job.errorMessage || "Vídeo inválido.");
      setPreview(value || "");
      dismissUploadJob(job.id);
      setJobId(null);
    }
  }, [job, onChange, value]);

  const pick = (file?: File) => {
    if (!file) return;
    if (localUrl.current) URL.revokeObjectURL(localUrl.current);
    const localPreview = URL.createObjectURL(file);
    localUrl.current = localPreview;
    setPreview(localPreview);
    setError("");
    appliedRef.current = false;
    setJobId(enqueueVideoUpload(file, folder, target));
  };

  const inProgress = Boolean(job && job.stage !== "done" && job.stage !== "error");
  const actionLabel = inProgress ? "Enviando em segundo plano…" : preview ? "Substituir" : "Selecionar";

  return (
    <div className="ksa-image-picker">
      <span className="ksa-label">{label}</span>
      {description && <small className="ksa-hint ksa-image-picker-description">{description}</small>}
      <div className="ksa-image-picker-box">
        {preview ? <video src={preview} muted loop playsInline /> : <div className="ksa-image-placeholder"><Video size={28} /><span>Escolher vídeo</span></div>}
        <label className="ksa-image-action">
          {!inProgress && <input type="file" accept="video/mp4,video/webm,video/quicktime,.mov" onChange={(event) => pick(event.target.files?.[0])} />}
          {actionLabel}
        </label>
        {preview && !inProgress && (
          <AdminButton
            type="button"
            tone="ghost"
            size="sm"
            className="ksa-image-remove"
            aria-label="Remover vídeo"
            title="Remover vídeo"
            onClick={() => {
              setPreview("");
              onChange("", "");
            }}
          >
            <Trash2 size={15} />
          </AdminButton>
        )}
      </div>
      <small className="ksa-hint">
        {inProgress
          ? "Acompanhe o progresso no card no canto da tela — pode continuar editando ou sair desta página."
          : "MP4, WebM ou MOV · MOV é convertido automaticamente · até 20 MB no bucket."}
      </small>
      {error && <small className="ksa-error">{error}</small>}
    </div>
  );
}
