import { adminFetch } from "../auth/adminApi";

const acceptedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);
const acceptedVideoTypes = new Set(["video/mp4", "video/webm"]);
const movVideoTypes = new Set(["video/quicktime", "video/x-quicktime"]);
const heicImageTypes = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);
const maxStoredImageBytes = 2 * 1024 * 1024;
const maxHeicSourceBytes = 20 * 1024 * 1024;
const maxStoredVideoBytes = 20 * 1024 * 1024;
const maxMovSourceBytes = 150 * 1024 * 1024;
const imageTypesByExtension: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
};

type PresignResponse = { objectKey: string; publicUrl: string; uploadUrl: string; requiredHeaders: Record<string, string> };

function getExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function getImageContentType(file: File) {
  return file.type || imageTypesByExtension[getExtension(file)] || "";
}

function isHeicImage(file: File) {
  const extension = getExtension(file);
  return heicImageTypes.has(getImageContentType(file)) || extension === "heic" || extension === "heif";
}

function isMovVideo(file: File) {
  return movVideoTypes.has(file.type) || getExtension(file) === "mov";
}

function loadImageFromBlob(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Falha ao preparar a imagem convertida."));
    };
    image.src = objectUrl;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Falha ao compactar a imagem."));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function compressJpegBlob(blob: Blob) {
  const image = await loadImageFromBlob(blob);
  const maxSide = 2000;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Falha ao preparar a imagem convertida.");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const qualitySteps = [0.86, 0.78, 0.68, 0.58];
  let bestBlob = blob;

  for (const quality of qualitySteps) {
    const nextBlob = await canvasToJpegBlob(canvas, quality);
    bestBlob = nextBlob;
    if (nextBlob.size <= maxStoredImageBytes) return nextBlob;
  }

  return bestBlob;
}

type HeifImage = {
  get_width(): number;
  get_height(): number;
  display(imageData: ImageData, callback: (result: ImageData | null) => void): void;
};
type HeifModule = { HeifDecoder: new () => { decode(data: Uint8Array): HeifImage[] } };

/**
 * Decodifica via libheif-js (build WASM da libheif atual) em vez de deixar o
 * navegador tentar renderizar o HEIC — só o Safari sabe fazer isso nativamente.
 *
 * Fotos de iPhone com HDR ligado (padrão desde o iOS 16/17) gravam uma faixa
 * auxiliar de "gain map" (marca "tmap" no cabeçalho do arquivo). A libheif
 * embutida na lib anterior (heic2any, sem atualização desde 2020) não conhece
 * essa extensão e falhava com "ERR_LIBHEIF format not supported" nelas.
 */
async function decodeHeicToCanvas(file: File) {
  const imported = await import("libheif-js/wasm-bundle");
  const libheif = ((imported as { default?: unknown }).default ?? imported) as HeifModule;
  const buffer = new Uint8Array(await file.arrayBuffer());
  const decoder = new libheif.HeifDecoder();
  const primary = decoder.decode(buffer)[0];
  if (!primary) throw new Error("Nenhuma imagem encontrada no arquivo HEIC.");

  const width = primary.get_width();
  const height = primary.get_height();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Falha ao preparar a imagem convertida.");

  canvas.width = width;
  canvas.height = height;
  const imageData = context.createImageData(width, height);

  await new Promise<void>((resolve, reject) => {
    primary.display(imageData, (result) => {
      if (!result) reject(new Error("Falha ao decodificar o HEIC."));
      else resolve();
    });
  });

  context.putImageData(imageData, 0, 0);
  return canvas;
}

async function convertHeicToJpeg(file: File) {
  if (file.size > maxHeicSourceBytes) throw new Error("O HEIC precisa ter no máximo 20 MB para conversão.");
  const name = file.name.replace(/\.(heic|heif)$/i, "") || "imagem";

  try {
    const canvas = await decodeHeicToCanvas(file);
    const rawJpeg = await canvasToJpegBlob(canvas, 0.92);
    const blob = await compressJpegBlob(rawJpeg);

    return new File([blob], `${name}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch (cause) {
    // Último recurso: só funciona no Safari, que decodifica HEIC nativamente
    // num <img>. Cobre um HEIC futuro que nem a libheif atual entenda ainda.
    try {
      const fallbackBlob = await compressJpegBlob(file);

      return new File([fallbackBlob], `${name}.jpg`, {
        type: "image/jpeg",
        lastModified: file.lastModified,
      });
    } catch {
      console.warn("Falha ao converter HEIC", cause);
      throw new Error("Não consegui converter esse HEIC. Tente exportar como JPG ou PNG.");
    }
  }
}

async function normalizeImageForUpload(file: File) {
  if (!isHeicImage(file)) return file;
  return convertHeicToJpeg(file);
}

type FFmpegInstance = {
  loaded: boolean;
  on(event: "progress", callback: (data: { progress: number }) => void): void;
  load(options: { coreURL: string; wasmURL: string }): Promise<void>;
  writeFile(name: string, data: Uint8Array): Promise<void>;
  readFile(name: string): Promise<Uint8Array>;
  deleteFile(name: string): Promise<void>;
  exec(args: string[]): Promise<number>;
};

let ffmpegInstance: FFmpegInstance | null = null;
// Callback do job que está rodando NA VEZ. Só existe um listener "progress" na
// vida inteira da instância (registrado uma única vez, abaixo) — antes disso,
// cada chamada a convertMovToMp4 registrava um listener novo e nunca removia
// o antigo, então converter um segundo vídeo alimentava a barra do primeiro
// com o progresso do segundo, parecendo que ele tinha "reiniciado".
let currentProgressCallback: ((progress: number) => void) | null = null;

/**
 * Carrega o núcleo do ffmpeg.wasm uma única vez por sessão (arquivos
 * self-hosted em /ffmpeg/, copiados de @ffmpeg/core pelo script
 * scripts/copy-ffmpeg-core.mjs — ver ali o porquê de não ir pro git).
 */
async function getFFmpeg() {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { toBlobURL } = await import("@ffmpeg/util");

  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg() as unknown as FFmpegInstance;
    ffmpegInstance.on("progress", ({ progress }) => {
      currentProgressCallback?.(Math.min(1, Math.max(0, progress)));
    });
  }

  if (!ffmpegInstance.loaded) {
    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL("/ffmpeg/ffmpeg-core.js", "text/javascript"),
      toBlobURL("/ffmpeg/ffmpeg-core.wasm", "application/wasm"),
    ]);
    await ffmpegInstance.load({ coreURL, wasmURL });
  }

  return ffmpegInstance;
}

/**
 * Reencodifica MOV (QuickTime) pra MP4 no navegador via ffmpeg.wasm.
 *
 * iPhone grava vídeo em .mov, às vezes em HEVC — que a maioria dos
 * navegadores (fora o Safari) não reproduz. Reduzimos pra 720p também
 * porque o clipe é só uma prévia de antes/depois, não precisa da resolução
 * original, e um .mov de iPhone pode passar de 100 MB.
 */
// ffmpeg.wasm só processa um exec() por vez (uma instância = uma thread de
// trabalho); chamar duas conversões ao mesmo tempo corromperia input.mov/
// output.mp4 de uma na outra. Essa fila garante que a segunda conversão
// espera a primeira acabar, mesmo se pedidas em paralelo (dois vídeos
// escolhidos em sequência) — é o que permite a fila de upload da tela tratar
// os dois como "em processo" sem se preocupar com essa restrição.
let ffmpegQueue: Promise<unknown> = Promise.resolve();

function runOnFFmpegQueue<T>(task: () => Promise<T>): Promise<T> {
  const run = ffmpegQueue.then(task, task);
  ffmpegQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function convertMovToMp4(file: File, onProgress?: (progress: number) => void, onStart?: () => void) {
  if (file.size > maxMovSourceBytes) throw new Error("O vídeo precisa ter no máximo 150 MB para conversão.");
  return runOnFFmpegQueue(() => convertMovToMp4Now(file, onProgress, onStart));
}

async function convertMovToMp4Now(file: File, onProgress?: (progress: number) => void, onStart?: () => void) {
  const name = file.name.replace(/\.mov$/i, "") || "video";
  const inputName = "input.mov";
  const outputName = "output.mp4";

  const ffmpeg = await getFFmpeg();
  onStart?.();
  currentProgressCallback = onProgress ?? null;

  try {
    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    await ffmpeg.exec([
      "-i", inputName,
      "-vf", "scale='min(1280,iw)':-2",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "28",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      outputName,
    ]);
    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });

    return new File([blob], `${name}.mp4`, { type: "video/mp4", lastModified: file.lastModified });
  } catch (cause) {
    console.warn("Falha ao converter MOV", cause);
    throw new Error("Não consegui converter esse vídeo. Tente exportar como MP4.");
  } finally {
    currentProgressCallback = null;
    await Promise.all([ffmpeg.deleteFile(inputName).catch(() => {}), ffmpeg.deleteFile(outputName).catch(() => {})]);
  }
}

/**
 * Sobe o arquivo pro Supabase Storage (via URL assinada) e registra no Neon.
 * `folder` organiza o bucket por seção — ex.: "home/hero", "sobre/bastidores".
 */
async function upload(file: File, folder: string, contentType = file.type): Promise<{ url: string; key: string }> {
  const presign = await adminFetch<PresignResponse>("/api/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ contentType, folder }),
  });

  const putResponse = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: presign.requiredHeaders,
    body: file,
  });
  if (!putResponse.ok) throw new Error("Falha ao enviar o arquivo.");

  // Cataloga no Neon; se isso falhar, o arquivo já está no bucket e a URL
  // pública funciona igual — só não aparece na lista de mídia.
  await adminFetch("/api/media", {
    method: "POST",
    body: JSON.stringify({ objectKey: presign.objectKey, contentType }),
  }).catch(() => {});

  return { url: presign.publicUrl, key: presign.objectKey };
}

export async function uploadImage(file: File, folder = "site") {
  const contentType = getImageContentType(file);
  if (!acceptedImageTypes.has(contentType)) throw new Error("Use uma imagem JPG, PNG, WebP, AVIF ou HEIC.");

  const uploadFile = await normalizeImageForUpload(file);
  const uploadContentType = getImageContentType(uploadFile);
  if (uploadFile.size > maxStoredImageBytes) {
    throw new Error(
      isHeicImage(file)
        ? "A imagem convertida ficou acima de 2 MB. Tente um HEIC menor ou exporte em JPG."
        : "A imagem precisa ter no máximo 2 MB.",
    );
  }

  const { url, key } = await upload(uploadFile, folder, uploadContentType);
  return { imageUrl: url, imageKey: key };
}

export type VideoUploadCallbacks = {
  /** 0–1, só chamado durante a conversão MOV→MP4. */
  onProgress?: (progress: number) => void;
  /** "queued" enquanto espera a vez na fila do ffmpeg (ver mediaStore convertMovToMp4); "converting" quando começa a rodar; "uploading" no envio pro bucket. */
  onStageChange?: (stage: "queued" | "converting" | "uploading") => void;
};

export async function uploadVideo(file: File, folder = "site", callbacks?: VideoUploadCallbacks) {
  const isMov = isMovVideo(file);
  if (!acceptedVideoTypes.has(file.type) && !isMov) throw new Error("Use um vídeo MP4, WebM ou MOV.");

  let uploadFile = file;
  if (isMov) {
    callbacks?.onStageChange?.("queued");
    uploadFile = await convertMovToMp4(file, callbacks?.onProgress, () => callbacks?.onStageChange?.("converting"));
  }

  if (uploadFile.size > maxStoredVideoBytes) {
    throw new Error(
      isMov
        ? "O vídeo convertido ficou acima de 20 MB. Tente um trecho mais curto."
        : "O vídeo precisa ter no máximo 20 MB.",
    );
  }

  callbacks?.onStageChange?.("uploading");
  const { url, key } = await upload(uploadFile, folder);
  return { videoUrl: url, videoKey: key };
}
