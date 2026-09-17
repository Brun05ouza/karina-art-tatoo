/** Pipeline de imagem no navegador: HEIC → resize → JPEG → presign → PUT Supabase. */

export type UploadStage =
  | "idle"
  | "reading"
  | "converting"
  | "compressing"
  | "preview"
  | "presigning"
  | "uploading"
  | "done"
  | "error";

export type PreparedImage = {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  bytes: number;
  contentType: "image/jpeg";
};

export type UploadedImage = {
  imageUrl: string;
  imageKey: string;
  width: number;
  height: number;
  bytes: number;
};

const MAX_EDGE = 2000;
const MAX_BYTES = 2 * 1024 * 1024;
const QUALITIES = [0.86, 0.78, 0.68, 0.58] as const;

const HEIC_MIME = /image\/hei(c|f)/i;
const HEIC_EXT = /\.hei(c|f)$/i;

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function isHeicFile(file: File): boolean {
  if (HEIC_MIME.test(file.type)) return true;
  if (HEIC_EXT.test(file.name)) return true;
  // Alguns iOS entregam type vazio com nome .HEIC
  if (!file.type && /\.heic$/i.test(file.name)) return true;
  return false;
}

async function loadLibheif(): Promise<{ HeifDecoder: new () => HeifDecoder }> {
  // Bundle WASM embutido (~1,4 MB) — só carrega sob demanda
  const mod = await import("libheif-js/libheif-wasm/libheif-bundle.mjs");
  const libheif = (mod as { default?: unknown }).default ?? mod;
  if (typeof libheif === "function") {
    const result = (libheif as () => unknown)();
    return (result && typeof (result as Promise<unknown>).then === "function"
      ? await (result as Promise<{ HeifDecoder: new () => HeifDecoder }>)
      : result) as { HeifDecoder: new () => HeifDecoder };
  }
  return libheif as { HeifDecoder: new () => HeifDecoder };
}

type HeifImage = {
  get_width: () => number;
  get_height: () => number;
  is_primary?: () => boolean;
  display: (
    imageData: ImageData,
    callback: (data: ImageData | null) => void,
  ) => void;
};

type HeifDecoder = {
  decode: (data: ArrayBuffer | Uint8Array) => HeifImage[];
};

async function heicToCanvas(file: File): Promise<HTMLCanvasElement> {
  try {
    const libheif = await loadLibheif();
    const buffer = await file.arrayBuffer();
    const decoder = new libheif.HeifDecoder();
    const images = decoder.decode(new Uint8Array(buffer));
    if (!images?.length) {
      throw new Error("empty");
    }
    const image = images.find((img) => img.is_primary?.()) ?? images[0]!;
    const width = image.get_width();
    const height = image.get_height();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    const imageData = ctx.createImageData(width, height);
    await new Promise<void>((resolve, reject) => {
      image.display(imageData, (displayData) => {
        if (!displayData) reject(new Error("display"));
        else {
          ctx.putImageData(displayData, 0, 0);
          resolve();
        }
      });
    });
    return canvas;
  } catch {
    throw new Error(
      "Não deu para abrir essa foto do iPhone. No iPhone: abra a foto → Compartilhar → Salvar em Arquivos como JPEG, ou em Ajustes → Câmera → Formatos → “Mais Compatível”. Depois tente de novo.",
    );
  }
}

async function fileToBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fallback abaixo */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("decode"));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawScaled(
  source: CanvasImageSource & { width: number; height: number },
  maxEdge: number,
): HTMLCanvasElement {
  const sw = "naturalWidth" in source && (source as HTMLImageElement).naturalWidth
    ? (source as HTMLImageElement).naturalWidth
    : source.width;
  const sh = "naturalHeight" in source && (source as HTMLImageElement).naturalHeight
    ? (source as HTMLImageElement).naturalHeight
    : source.height;
  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível preparar a imagem.");
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Falha ao comprimir a imagem."));
        else resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

/** Lê arquivo, converte HEIC se preciso, redimensiona e comprime ≤ 2 MB. */
export async function prepareImage(
  file: File,
  onStage?: (stage: UploadStage, detail?: string) => void,
): Promise<PreparedImage> {
  onStage?.("reading");

  let canvas: HTMLCanvasElement;

  if (isHeicFile(file)) {
    onStage?.("converting", "Abrindo foto do iPhone…");
    const heicCanvas = await heicToCanvas(file);
    onStage?.("compressing");
    canvas = drawScaled(heicCanvas, MAX_EDGE);
  } else {
    onStage?.("compressing");
    const bitmap = await fileToBitmap(file);
    try {
      canvas = drawScaled(bitmap as HTMLImageElement, MAX_EDGE);
    } finally {
      if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();
    }
  }

  let blob: Blob | null = null;
  let usedQ = QUALITIES[QUALITIES.length - 1]!;
  for (const q of QUALITIES) {
    usedQ = q;
    blob = await canvasToBlob(canvas, q);
    if (blob.size <= MAX_BYTES) break;
  }

  if (!blob || blob.size > MAX_BYTES) {
    throw new Error(
      `Essa foto ficou grande demais mesmo comprimida (${formatBytes(blob?.size ?? 0)}). Escolha outra ou recorte antes de enviar.`,
    );
  }

  const previewUrl = URL.createObjectURL(blob);
  onStage?.("preview", `Pronta · ${formatBytes(blob.size)} · qualidade ${Math.round(usedQ * 100)}%`);

  return {
    blob,
    previewUrl,
    width: canvas.width,
    height: canvas.height,
    bytes: blob.size,
    contentType: "image/jpeg",
  };
}

export const YOUTUBE_VIDEO_MAX_BYTES = 10 * 1024 * 1024;

export function youtubeVideoRejection(file: File): string | null {
  const name = file.name.toLowerCase();
  const mov = file.type === "video/quicktime" || name.endsWith(".mov");
  if (mov) {
    return "MOV não é aceito. No iPhone, exporte em MP4: Fotos → vídeo → Compartilhar → Salvar vídeo (Mais compatível), ou exporte pelo app que gravou.";
  }
  const webm = file.type === "video/webm" || name.endsWith(".webm");
  const mp4 = file.type === "video/mp4" || name.endsWith(".mp4");
  if (!webm && !mp4) {
    return "Use MP4 ou WebM. MOV precisa ser exportado em MP4 antes de enviar.";
  }
  if (file.size > YOUTUBE_VIDEO_MAX_BYTES) {
    return `Esse vídeo tem ${formatBytes(file.size)}. O limite é 10 MB — um teaser de 15 a 30 segundos cabe.`;
  }
  return null;
}

export async function uploadAdminBlob(
  blob: Blob,
  contentType: string,
  collection:
    | "portfolio"
    | "flash"
    | "produtos"
    | "reformulacoes"
    | "bio-avatar"
    | "bio-studio"
    | "youtube-thumb"
    | "youtube-trailer"
    | "products-hero",
  bytes?: number,
): Promise<{ url: string; key: string }> {
  const presignRes = await fetch("/api/admin/uploads/presign", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collection, contentType, bytes }),
  });
  const presign = (await presignRes.json()) as {
    error?: string;
    signedUrl?: string;
    path?: string;
    publicUrl?: string;
    token?: string;
  };
  if (!presignRes.ok || !presign.signedUrl || !presign.path || !presign.publicUrl) {
    throw new Error(presign.error || "Não foi possível preparar o envio.");
  }

  let put = await fetch(presign.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
  if (!put.ok) {
    put = await fetch(presign.signedUrl, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        ...(presign.token ? { Authorization: `Bearer ${presign.token}` } : {}),
      },
      body: blob,
    });
  }
  if (!put.ok) {
    throw new Error("O envio falhou. Verifique a conexão e tente de novo.");
  }
  return { url: presign.publicUrl, key: presign.path };
}

export async function uploadPreparedImage(
  prepared: PreparedImage,
  collection:
    | "portfolio"
    | "flash"
    | "produtos"
    | "reformulacoes"
    | "bio-avatar"
    | "bio-studio"
    | "youtube-thumb"
    | "products-hero",
  onStage?: (stage: UploadStage, detail?: string) => void,
): Promise<UploadedImage> {
  onStage?.("presigning", "Preparando envio…");

  const presignRes = await fetch("/api/admin/uploads/presign", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collection,
      contentType: prepared.contentType,
      bytes: prepared.bytes,
    }),
  });
  const presign = (await presignRes.json()) as {
    error?: string;
    signedUrl?: string;
    path?: string;
    publicUrl?: string;
    token?: string;
  };
  if (!presignRes.ok || !presign.signedUrl || !presign.path || !presign.publicUrl) {
    throw new Error(presign.error || "Não foi possível preparar o envio da foto.");
  }

  onStage?.("uploading", "Enviando foto…");

  // Supabase signed upload: PUT no URL com token (ou POST — tentar PUT primeiro)
  let put = await fetch(presign.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": prepared.contentType,
    },
    body: prepared.blob,
  });

  if (!put.ok) {
    put = await fetch(presign.signedUrl, {
      method: "POST",
      headers: {
        "Content-Type": prepared.contentType,
        ...(presign.token ? { Authorization: `Bearer ${presign.token}` } : {}),
      },
      body: prepared.blob,
    });
  }

  if (!put.ok) {
    const detail = await put.text().catch(() => "");
    console.error("[upload]", put.status, detail);
    throw new Error("O envio da foto falhou. Verifique a conexão e tente de novo.");
  }

  onStage?.("done", "Foto enviada");
  return {
    imageUrl: presign.publicUrl,
    imageKey: presign.path,
    width: prepared.width,
    height: prepared.height,
    bytes: prepared.bytes,
  };
}
