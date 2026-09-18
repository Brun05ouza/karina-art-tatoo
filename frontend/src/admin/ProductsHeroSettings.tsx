import { useEffect, useState } from "react";
import { DEFAULT_FOCAL, normalizeFocal, type FocalPoint } from "../app/focal";
import { PRODUCTS_HERO_MOLD_SRC } from "../app/products-content";
import { ApiError, EMPTY_ABOUT_MEDIA, getAdminSettings, patchAdminSettings, type AdminSettings } from "./auth/api";
import { FocalPreview } from "./gallery/FocalPreview";
import { MediaDrop } from "./gallery/MediaDrop";
import {
  prepareImage,
  uploadPreparedImage,
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
  aboutMedia: EMPTY_ABOUT_MEDIA,
};

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif";

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

export function ProductsHeroSettings() {
  const [settings, setSettings] = useState<AdminSettings>(EMPTY);
  const [focal, setFocal] = useState<FocalPoint>({ ...DEFAULT_FOCAL });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [stageDetail, setStageDetail] = useState("");

  useEffect(() => {
    let live = true;
    getAdminSettings()
      .then((next) => {
        if (!live) return;
        setSettings(next);
        setFocal(normalizeFocal(next.productsHeroFocalX, next.productsHeroFocalY));
      })
      .catch(() => {
        if (live) setError("Não foi possível carregar o hero de produtos.");
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
      setFocal(normalizeFocal(next.productsHeroFocalX, next.productsHeroFocalY));
      setStatus(ok);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
      setStage("idle");
      setStageDetail("");
    }
  }

  async function onFile(file: File) {
    setBusy(true);
    setError(null);
    setStatus(null);
    setStage("reading");
    setStageDetail("Lendo arquivo…");
    try {
      const prepared = await prepareImage(file, (next, detail) => {
        setStage(next);
        setStageDetail(detail ?? "");
      });
      setStage("uploading");
      setStageDetail("Enviando arte…");
      const uploaded = await uploadPreparedImage(prepared, "products-hero");
      URL.revokeObjectURL(prepared.previewUrl);
      await save(
        {
          productsHeroImageUrl: uploaded.imageUrl,
          productsHeroImageKey: uploaded.imageKey,
          productsHeroFocalX: 50,
          productsHeroFocalY: 50,
        },
        "Arte do hero publicada.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
      setBusy(false);
      setStage("idle");
      setStageDetail("");
    }
  }

  async function commitFocal(next: FocalPoint) {
    setFocal(next);
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const saved = await patchAdminSettings({
        productsHeroFocalX: next.x,
        productsHeroFocalY: next.y,
      });
      setSettings(saved);
      setFocal(normalizeFocal(saved.productsHeroFocalX, saved.productsHeroFocalY));
      setStatus("Enquadramento salvo.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o enquadramento.");
    } finally {
      setBusy(false);
    }
  }

  const progress =
    stage === "idle"
      ? null
      : { value: stageValue(stage), label: stageText(stage, stageDetail) };

  const hasArt = Boolean(settings.productsHeroImageUrl);

  return (
    <section className="ks-admin-youtube ks-admin-products-hero" aria-labelledby="ks-admin-products-hero-title">
      <div className="ks-admin-youtube-head">
        <div>
          <p className="ks-admin-kicker">Site público</p>
          <h2 id="ks-admin-products-hero-title">Hero de produtos</h2>
          <p>
            Só a arte entra aqui — a moldura já faz parte do site. Sem arte, o hero vira uma coluna
            só de texto.
          </p>
        </div>
      </div>

      <div className="ks-admin-youtube-cols ks-admin-products-hero-cols">
        <div className="ks-admin-youtube-col">
          <MediaDrop
            className="ks-admin-youtube-frame ks-admin-products-hero-frame"
            accept={IMAGE_ACCEPT}
            disabled={busy}
            hasMedia={hasArt}
            error={Boolean(error)}
            replaceLabel="Trocar arte"
            onFile={(file) => void onFile(file)}
            onRemove={
              hasArt
                ? () => void save({ clearProductsHeroImage: true }, "Arte removida.")
                : undefined
            }
            progress={progress}
            describedBy="ks-admin-products-hero-help"
            empty={
              <>
                <span className="ks-admin-youtube-ratio">1:1</span>
                <strong>Arte do hero</strong>
                <span>Clique ou arraste uma imagem quadrada</span>
              </>
            }
          >
            {hasArt ? (
              <div className="ks-admin-products-mold ks-products-mold">
                <div className="ks-admin-products-mold-art">
                  <FocalPreview
                    src={settings.productsHeroImageUrl}
                    value={focal}
                    onChange={setFocal}
                    onCommit={(next) => void commitFocal(next)}
                    disabled={busy}
                  />
                </div>
                <img
                  className="ks-admin-products-mold-frame"
                  src={PRODUCTS_HERO_MOLD_SRC}
                  alt=""
                  width={800}
                  height={800}
                  draggable={false}
                />
              </div>
            ) : null}
          </MediaDrop>
          {hasArt ? (
            <div className="ks-admin-products-hero-focal-actions">
              <button
                type="button"
                className="ks-gallery-drop-btn ks-gallery-drop-btn--ghost"
                disabled={busy}
                onClick={() => void commitFocal({ ...DEFAULT_FOCAL })}
              >
                Centralizar enquadramento
              </button>
              <span className="ks-focal-meta" aria-live="polite">
                {focal.x}% · {focal.y}%
              </span>
            </div>
          ) : null}
        </div>

        <div className="ks-admin-youtube-col">
          <p className="ks-admin-muted ks-admin-youtube-help" id="ks-admin-products-hero-help">
            Envie uma <strong>imagem quadrada da arte</strong> (JPEG, PNG ou WebP). O site coloca
            dentro da moldura com a perspectiva. Arraste na prévia para escolher o enquadramento.
            Ideal ~800×800 px. Máx. 800 KB após compressão.
          </p>
        </div>
      </div>

      {status ? <p className="ks-admin-youtube-status" role="status">{status}</p> : null}
      {error ? <p className="ks-admin-field-error" role="alert">{error}</p> : null}
    </section>
  );
}
