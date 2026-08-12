import { useSyncExternalStore } from "react";
import { uploadVideo } from "../data/mediaStore";

/**
 * Fila global de upload de vídeo — vive fora de qualquer página, então um
 * upload continua (e o card no canto da tela continua atualizando) mesmo se
 * a admin sair de Reformulações e for mexer em outra seção enquanto espera.
 *
 * Antes disso o upload rodava dentro do estado local do VideoPicker: sair da
 * página desmontava o componente e o resultado do upload se perdia — ele
 * terminava em algum lugar, mas ninguém mais escutava.
 */

export type UploadTarget = {
  /** Rota do admin para onde o clique no card "concluído" deve levar. */
  route: string;
  /** Chave da coleção (ex.: "reformulacoes") — usada para casar o job com a tela certa. */
  collectionKey: string;
  itemId: string;
  itemTitle: string;
  fieldKey: string;
  fieldLabel: string;
  keyFieldKey: string;
};

export type UploadStage = "queued" | "converting" | "uploading" | "done" | "error";

export type UploadJob = {
  id: string;
  fileName: string;
  progress: number;
  stage: UploadStage;
  errorMessage?: string;
  result?: { url: string; key: string };
  target: UploadTarget;
};

type Listener = () => void;

const jobs = new Map<string, UploadJob>();
const listeners = new Set<Listener>();
let snapshot: UploadJob[] = [];

function refreshSnapshot() {
  snapshot = Array.from(jobs.values());
}

function emit() {
  listeners.forEach((listener) => listener());
}

function patchJob(id: string, patch: Partial<UploadJob>) {
  const current = jobs.get(id);
  if (!current) return;
  jobs.set(id, { ...current, ...patch });
  refreshSnapshot();
  emit();
}

export function subscribeUploadJobs(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getUploadJobsSnapshot() {
  return snapshot;
}

export function useUploadJobs(): UploadJob[] {
  return useSyncExternalStore(subscribeUploadJobs, getUploadJobsSnapshot, getUploadJobsSnapshot);
}

function isMovFile(file: File) {
  return file.type === "video/quicktime" || file.name.toLowerCase().endsWith(".mov");
}

/** Enfileira um vídeo e devolve o id do job — a UI acompanha via useUploadJobs(). */
export function enqueueVideoUpload(file: File, folder: string, target: UploadTarget): string {
  const id = crypto.randomUUID();

  jobs.set(id, {
    id,
    fileName: file.name,
    progress: 0,
    stage: isMovFile(file) ? "queued" : "uploading",
    target,
  });
  refreshSnapshot();
  emit();

  uploadVideo(file, folder, {
    onStageChange: (stage) => patchJob(id, { stage }),
    onProgress: (progress) => patchJob(id, { progress, stage: "converting" }),
  })
    .then((result) => {
      patchJob(id, { stage: "done", progress: 1, result: { url: result.videoUrl, key: result.videoKey } });
    })
    .catch((error: unknown) => {
      patchJob(id, { stage: "error", errorMessage: error instanceof Error ? error.message : "Falha ao enviar o vídeo." });
    });

  return id;
}

export function dismissUploadJob(id: string) {
  jobs.delete(id);
  refreshSnapshot();
  emit();
}

/** Existe upload em andamento (não concluído, não com erro) para esse item? Usado pelo aviso ao salvar. */
export function hasActiveJobForItem(collectionKey: string, itemId: string): boolean {
  return snapshot.some(
    (job) =>
      job.target.collectionKey === collectionKey &&
      job.target.itemId === itemId &&
      (job.stage === "queued" || job.stage === "converting" || job.stage === "uploading"),
  );
}

type PendingEdit = { collectionKey: string; itemId: string; itemTitle: string; patch: Record<string, unknown> };

// Só precisa durar até a próxima página de destino consumir — não é estado de
// UI (não precisa re-render em quem o escreve), por isso fica fora do store acima.
let pendingEdit: PendingEdit | null = null;

export function setPendingEdit(edit: PendingEdit) {
  pendingEdit = edit;
}

/** A tela de destino chama isso uma vez ao montar; devolve null se não for para ela. */
export function consumePendingEdit(collectionKey: string): PendingEdit | null {
  if (pendingEdit?.collectionKey !== collectionKey) return null;
  const value = pendingEdit;
  pendingEdit = null;
  return value;
}
