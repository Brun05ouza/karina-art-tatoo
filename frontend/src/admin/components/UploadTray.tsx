import { AlertCircle, CheckCircle2, Trash2, Video, X } from "lucide-react";
import { useNavigate } from "react-router";
import {
  dismissUploadJob,
  setPendingEdit,
  useUploadJobs,
  type UploadJob,
} from "../uploads/uploadQueue";

const STAGE_LABEL: Record<UploadJob["stage"], string> = {
  queued: "Na fila…",
  converting: "Convertendo…",
  uploading: "Enviando…",
  done: "Concluído",
  error: "Falhou",
};

/**
 * Card flutuante com os uploads de vídeo em andamento — fica montado no
 * AdminApp (fora de qualquer rota), então continua atualizando mesmo se a
 * admin sair da tela onde escolheu o vídeo e for mexer em outra seção.
 *
 * Ao clicar num card concluído: guarda o resultado como uma "edição
 * pendente" (ver uploads/uploadQueue.ts) e leva pra tela do item — a tela
 * consome essa edição ao montar e já abre o item com o vídeo encaixado,
 * pronta pra ela conferir e clicar em Salvar alterações.
 */
export function UploadTray() {
  const jobs = useUploadJobs();
  const navigate = useNavigate();

  if (jobs.length === 0) return null;

  const openResult = (job: UploadJob) => {
    if (!job.result) return;
    setPendingEdit({
      collectionKey: job.target.collectionKey,
      itemId: job.target.itemId,
      itemTitle: job.target.itemTitle,
      patch: { [job.target.fieldKey]: job.result.url, [job.target.keyFieldKey]: job.result.key },
    });
    dismissUploadJob(job.id);
    navigate(job.target.route);
  };

  return (
    <div className="ksa-upload-tray" aria-live="polite">
      {jobs.map((job) => {
        const isDone = job.stage === "done";
        const isError = job.stage === "error";
        const percent = Math.round(job.progress * 100);

        return (
          <div
            key={job.id}
            className={`ksa-upload-card ksa-upload-card--${job.stage}`}
            role={isDone ? "button" : undefined}
            tabIndex={isDone ? 0 : undefined}
            onClick={isDone ? () => openResult(job) : undefined}
            onKeyDown={isDone ? (event) => (event.key === "Enter" || event.key === " ") && openResult(job) : undefined}
          >
            <div className="ksa-upload-card-icon">
              {isDone ? <CheckCircle2 size={18} /> : isError ? <AlertCircle size={18} /> : <Video size={18} />}
            </div>
            <div className="ksa-upload-card-body">
              <strong title={job.fileName}>{job.target.itemTitle || job.fileName}</strong>
              <small>{job.target.fieldLabel}</small>
              {isError ? (
                <small className="ksa-upload-card-error">{job.errorMessage || "Não foi possível enviar."}</small>
              ) : (
                <>
                  <div className="ksa-upload-card-bar">
                    <span style={{ width: `${isDone ? 100 : percent}%` }} />
                  </div>
                  <small>{isDone ? "Concluído · clique para revisar e salvar" : `${STAGE_LABEL[job.stage]} ${job.stage === "converting" ? `${percent}%` : ""}`}</small>
                </>
              )}
            </div>
            <button
              type="button"
              className="ksa-upload-card-dismiss"
              aria-label="Remover da lista"
              onClick={(event) => {
                event.stopPropagation();
                dismissUploadJob(job.id);
              }}
            >
              {isDone || isError ? <X size={14} /> : <Trash2 size={14} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
