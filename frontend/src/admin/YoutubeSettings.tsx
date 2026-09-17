import { useEffect, useState } from "react";
import { ApiError, getAdminSettings, patchAdminSettings, type AdminSettings } from "./auth/api";
import { MediaDrop } from "./gallery/MediaDrop";
import {
  prepareImage,
  uploadAdminBlob,
  uploadPreparedImage,
  youtubeVideoRejection,
  type UploadStage,
} from "./gallery/upload";

const EMPTY: AdminSettings = {
  whatsappPhone: "",
  whatsappPhoneDisplay: "",
  developmentMode: false,
  youtubeVisible: true,
  youtubeUrl: "",
  youtubeThumbUrl: "",
  youtubeThumbKey: "",
  youtubeTrailerUrl: "",
  youtubeTrailerKey: "",
  productsHeroImageUrl: "",
  productsHeroImageKey: "",
  productsHeroFocalX: 50,
  productsHeroFocalY: 50,
};

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif";
const VIDEO_ACCEPT = "video/mp4,video/webm,.mp4,.webm,.mov";

function stageValue(stage: UploadStage): number {
  if (stage === "reading" || stage === "converting") return 22;
  if (stage === "compressing") return 48;
  if (stage === "presigning") return 68;
  if (stage === "uploading") return 88;
  if (stage === "preview" || stage === "done") return 100;
  return 0;
}

function stageText(stage: UploadStage, detail: string): string {
  if (detail) return detail;
  if (stage === "converting") return "Abrindo foto do iPhone…";
  if (stage === "compressing") return "Ajustando tamanho…";
  if (stage === "presigning" || stage === "uploading") return "Enviando…";
  if (stage === "reading") return "Lendo arquivo…";
  return "Processando…";
}

export function YoutubeSettings() {
  const [settings, setSettings] = useState<AdminSettings>(EMPTY);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<"thumb" | "trailer" | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [stageDetail, setStageDetail] = useState("");

  useEffect(() => {
    let live = true;
    getAdminSettings()
      .then((next) => {
        if (!live) return;
        setSettings(next);
        setUrl(next.youtubeUrl);
      })
      .catch(() => {
        if (live) setError("Não foi possível carregar o vídeo da home.");
      });
    return () => {
      live = false;
    };
  }, []);

  async function save(patch: Parameters<typeof patchAdminSettings>[0], ok: string) {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const next = await patchAdminSettings(patch);
      setSettings(next);
      setUrl(next.youtubeUrl);
      setStatus(ok);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
      setActive(null);
      setStage("idle");
      setStageDetail("");
    }
  }

  function progressFor(frame: "thumb" | "trailer") {
    if (active !== frame || stage === "idle") return null;
    return { value: stageValue(stage), label: stageText(stage, stageDetail) };
  }

  async function onThumb(file: File) {
    setBusy(true);
    setActive("thumb");
    setError(null);
    setStatus(null);
    let prepared: Awaited<ReturnType<typeof prepareImage>> | null = null;
    try {
      prepared = await prepareImage(file, (next, detail) => {
        setStage(next);
        setStageDetail(detail ?? "");
      });
      setStage("uploading");
      setStageDetail("Enviando thumb…");
      const uploaded = await uploadPreparedImage(prepared, "youtube-thumb");
      URL.revokeObjectURL(prepared.previewUrl);
      prepared = null;
      await save(
        { youtubeThumbUrl: uploaded.imageUrl, youtubeThumbKey: uploaded.imageKey },
        "Thumb publicada.",
      );
    } catch (err) {
      if (prepared) URL.revokeObjectURL(prepared.previewUrl);
      setError(err instanceof Error ? err.message : "Não foi possível enviar a thumb.");
      setBusy(false);
      setActive(null);
      setStage("idle");
    }
  }

  async function onTrailer(file: File) {
    const rejection = youtubeVideoRejection(file);
    if (rejection) {
      setError(rejection);
      setStatus(null);
      return;
    }
    setBusy(true);
    setActive("trailer");
    setStage("uploading");
    setStageDetail("Enviando teaser…");
    setError(null);
    setStatus(null);
    try {
      const contentType = file.type === "video/webm" || file.name.toLowerCase().endsWith(".webm")
        ? "video/webm"
        : "video/mp4";
      const uploaded = await uploadAdminBlob(file, contentType, "youtube-trailer", file.size);
      await save(
        { youtubeTrailerUrl: uploaded.url, youtubeTrailerKey: uploaded.key },
        "Teaser publicado.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o vídeo.");
      setBusy(false);
      setActive(null);
      setStage("idle");
    }
  }

  return (
    <section className="ks-admin-youtube" aria-labelledby="ks-admin-youtube-title">
      <div className="ks-admin-youtube-head">
        <div>
          <p className="ks-admin-kicker">Site público</p>
          <h2 id="ks-admin-youtube-title">Vídeo da home</h2>
          <p>Thumb à esquerda, teaser à direita, como na home. Sem os dois, a seção fica oculta.</p>
        </div>
        <button
          type="button"
          className={`ks-construction-switch${settings.youtubeVisible ? " is-on" : ""}`}
          role="switch"
          aria-checked={settings.youtubeVisible}
          aria-labelledby="ks-admin-youtube-title"
          disabled={busy}
          onClick={() =>
            void save(
              { youtubeVisible: !settings.youtubeVisible },
              settings.youtubeVisible ? "Seção oculta." : "Seção visível.",
            )
          }
        >
          <span className="ks-construction-switch-knob" aria-hidden="true" />
          <span className="ks-construction-switch-label">{settings.youtubeVisible ? "Visível" : "Oculta"}</span>
        </button>
      </div>

      <div className="ks-admin-youtube-cols">
        <div className="ks-admin-youtube-col">
          <MediaDrop
            className="ks-admin-youtube-frame ks-admin-youtube-frame--thumb"
            accept={IMAGE_ACCEPT}
            disabled={busy}
            hasMedia={Boolean(settings.youtubeThumbUrl)}
            error={active === "thumb" && Boolean(error)}
            replaceLabel="Trocar"
            onFile={(file) => void onThumb(file)}
            onRemove={
              settings.youtubeThumbUrl
                ? () => void save({ clearYoutubeThumb: true }, "Thumb removida.")
                : undefined
            }
            progress={progressFor("thumb")}
            empty={
              <>
                <span className="ks-admin-youtube-ratio">16:9</span>
                <strong>Thumb</strong>
                <span>Clique ou arraste a imagem</span>
              </>
            }
          >
            <img src={settings.youtubeThumbUrl} alt="" />
          </MediaDrop>

          <label className="ks-admin-field">
            <span>Link do YouTube</span>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://youtu.be/…"
              inputMode="url"
              disabled={busy}
              aria-describedby="ks-admin-youtube-link-help"
            />
            <span id="ks-admin-youtube-link-help" className="ks-admin-muted">
              Destino do clique na thumb e do botão Ver vídeo completo. Não é o arquivo do vídeo.
            </span>
          </label>
          <button
            type="button"
            className="ks-admin-btn"
            disabled={busy || url.trim() === settings.youtubeUrl}
            onClick={() => void save({ youtubeUrl: url.trim() }, url.trim() ? "Link salvo." : "Link removido.")}
          >
            Salvar link
          </button>
        </div>

        <div className="ks-admin-youtube-col">
          <MediaDrop
            className="ks-admin-youtube-frame ks-admin-youtube-frame--phone"
            accept={VIDEO_ACCEPT}
            disabled={busy}
            hasMedia={Boolean(settings.youtubeTrailerUrl)}
            error={active === "trailer" && Boolean(error)}
            replaceLabel="Trocar"
            onFile={(file) => void onTrailer(file)}
            onRemove={
              settings.youtubeTrailerUrl
                ? () => void save({ clearYoutubeTrailer: true }, "Teaser removido.")
                : undefined
            }
            progress={progressFor("trailer")}
            describedBy="ks-admin-youtube-trailer-help"
            empty={
              <>
                <span className="ks-admin-youtube-ratio">9:16</span>
                <strong>Teaser</strong>
                <span>Clique ou arraste o vídeo</span>
              </>
            }
          >
            <video
              src={settings.youtubeTrailerUrl}
              muted
              playsInline
              loop
              autoPlay
              poster={settings.youtubeThumbUrl || undefined}
            />
          </MediaDrop>
          <p className="ks-admin-muted ks-admin-youtube-help" id="ks-admin-youtube-trailer-help">
            MP4 ou WebM, até 10 MB. MOV do iPhone precisa ser exportado em MP4.
          </p>
        </div>
      </div>

      {status ? <p className="ks-admin-youtube-status" role="status">{status}</p> : null}
      {error ? <p className="ks-admin-field-error" role="alert">{error}</p> : null}
    </section>
  );
}
