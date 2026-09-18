import { useEffect, useState } from "react";
import { DEFAULT_FOCAL, normalizeFocal, type FocalPoint } from "../app/focal";
import {
  ApiError,
  EMPTY_ABOUT_MEDIA,
  getAdminSettings,
  patchAdminSettings,
  type AboutMediaBundle,
  type AboutMediaSlot,
  type AboutMediaSlotId,
  type AdminSettings,
} from "./auth/api";
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

const PAGE_SLOTS: { id: AboutMediaSlotId; label: string; hint: string }[] = [
  { id: "image", label: "Foto da biografia", hint: "Retrato na seção da artista" },
  { id: "behindScenesImage", label: "Bastidores", hint: "Foto da seção de bastidores" },
];

const TOUR_SLOTS: { id: AboutMediaSlotId; label: string; hint: string }[] = [
  { id: "studioInviteImage", label: "Capa do estúdio", hint: "Convite / capa da seção (separada da Entrada)" },
  { id: "studioTour0", label: "Entrada", hint: "Passo 1 do tour" },
  { id: "studioTour1", label: "Espaço", hint: "Passo 2 do tour" },
  { id: "studioTour2", label: "Processo", hint: "Passo 3 do tour" },
  { id: "studioTour3", label: "Vista", hint: "Passo 4 do tour" },
];

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

function readSlot(media: AboutMediaBundle, id: AboutMediaSlotId): AboutMediaSlot {
  if (id === "heroImage") return media.heroImage;
  if (id === "image") return media.image;
  if (id === "behindScenesImage") return media.behindScenesImage;
  if (id === "studioInviteImage") return media.studioInviteImage;
  const index = Number(id.slice("studioTour".length));
  return media.studioTourSteps[index] ?? { url: "", key: "", focalX: 50, focalY: 50 };
}

function AboutMediaSlotCard({
  slotId,
  label,
  hint,
  slot,
  busy,
  uploading,
  stage,
  stageDetail,
  error,
  sectionHidden,
  onFile,
  onClear,
  onFocalCommit,
  onSectionHiddenChange,
}: {
  slotId: AboutMediaSlotId;
  label: string;
  hint: string;
  slot: AboutMediaSlot;
  busy: boolean;
  uploading: boolean;
  stage: UploadStage;
  stageDetail: string;
  error: string | null;
  sectionHidden?: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
  onFocalCommit: (next: FocalPoint) => void;
  onSectionHiddenChange?: (hidden: boolean) => void;
}) {
  const [focal, setFocal] = useState<FocalPoint>(() => normalizeFocal(slot.focalX, slot.focalY));
  useEffect(() => {
    setFocal(normalizeFocal(slot.focalX, slot.focalY));
  }, [slot.focalX, slot.focalY, slot.url]);

  const hasMedia = Boolean(slot.url);
  const progress =
    uploading && stage !== "idle"
      ? { value: stageValue(stage), label: stageText(stage, stageDetail) }
      : null;

  return (
    <div className={`ks-admin-about-slot${sectionHidden ? " is-section-hidden" : ""}`}>
      <div className="ks-admin-about-slot-head">
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <MediaDrop
        className="ks-admin-youtube-frame ks-admin-about-frame"
        accept={IMAGE_ACCEPT}
        disabled={busy}
        hasMedia={hasMedia}
        error={Boolean(error)}
        replaceLabel="Trocar foto"
        onFile={onFile}
        onRemove={hasMedia ? onClear : undefined}
        progress={progress}
        describedBy={`ks-admin-about-${slotId}-help`}
        empty={
          <>
            <span className="ks-admin-youtube-ratio">foto</span>
            <strong>{label}</strong>
            <span>Clique ou arraste</span>
          </>
        }
      >
        {hasMedia ? (
          <FocalPreview
            src={slot.url}
            value={focal}
            onChange={setFocal}
            onCommit={(next) => onFocalCommit(next)}
            disabled={busy}
          />
        ) : null}
      </MediaDrop>
      {hasMedia ? (
        <div className="ks-admin-products-hero-focal-actions">
          <button
            type="button"
            className="ks-gallery-drop-btn ks-gallery-drop-btn--ghost"
            disabled={busy}
            onClick={() => onFocalCommit({ ...DEFAULT_FOCAL })}
          >
            Centralizar
          </button>
          <span className="ks-focal-meta" aria-live="polite">
            {focal.x}% · {focal.y}%
          </span>
        </div>
      ) : null}
      {onSectionHiddenChange ? (
        <label className={`ks-gallery-flag ks-admin-about-hide-flag${sectionHidden ? " is-on" : ""}`}>
          <input
            type="checkbox"
            checked={Boolean(sectionHidden)}
            disabled={busy}
            onChange={(e) => onSectionHiddenChange(e.target.checked)}
          />
          <span className="ks-gallery-flag-switch" aria-hidden="true" />
          <span className="ks-gallery-flag-copy">
            <strong>Ocultar seção no site</strong>
            <span>A foto continua salva; só some da /sobre.</span>
          </span>
        </label>
      ) : null}
      <p className="ks-admin-muted ks-admin-youtube-help" id={`ks-admin-about-${slotId}-help`}>
        Sem foto customizada, o site usa a imagem padrão do código.
      </p>
    </div>
  );
}

export function AboutSettings() {
  const [settings, setSettings] = useState<AdminSettings>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busySlot, setBusySlot] = useState<AboutMediaSlotId | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [stageDetail, setStageDetail] = useState("");

  useEffect(() => {
    let live = true;
    getAdminSettings()
      .then((next) => {
        if (!live) return;
        setSettings({
          ...next,
          aboutMedia: {
            ...(next.aboutMedia ?? EMPTY_ABOUT_MEDIA),
            hiddenSections: next.aboutMedia?.hiddenSections ?? [],
          },
        });
      })
      .catch(() => {
        if (live) setError("Não foi possível carregar as fotos do Sobre.");
      });
    return () => {
      live = false;
    };
  }, []);

  async function save(
    patch: Parameters<typeof patchAdminSettings>[0],
    ok: string,
    slotId: AboutMediaSlotId | "bastidores",
  ) {
    setBusySlot(slotId === "bastidores" ? "behindScenesImage" : slotId);
    setError(null);
    setStatus(null);
    try {
      const next = await patchAdminSettings(patch);
      setSettings({
        ...next,
        aboutMedia: {
          ...(next.aboutMedia ?? EMPTY_ABOUT_MEDIA),
          hiddenSections: next.aboutMedia?.hiddenSections ?? [],
        },
      });
      setStatus(ok);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    } finally {
      setBusySlot(null);
      setStage("idle");
      setStageDetail("");
    }
  }

  async function onFile(slotId: AboutMediaSlotId, file: File) {
    setBusySlot(slotId);
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
      setStageDetail("Enviando foto…");
      const uploaded = await uploadPreparedImage(prepared, "about");
      URL.revokeObjectURL(prepared.previewUrl);
      await save(
        {
          aboutMediaSlot: {
            id: slotId,
            url: uploaded.imageUrl,
            key: uploaded.imageKey,
            focalX: 50,
            focalY: 50,
          },
        },
        "Foto publicada.",
        slotId,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
      setBusySlot(null);
      setStage("idle");
      setStageDetail("");
    }
  }

  const media = settings.aboutMedia ?? EMPTY_ABOUT_MEDIA;
  const anyBusy = busySlot != null;
  const bastidoresHidden = (media.hiddenSections ?? []).includes("bastidores");

  return (
    <section className="ks-admin-youtube ks-admin-about-media" aria-labelledby="ks-admin-about-title">
      <div className="ks-admin-youtube-head">
        <div>
          <p className="ks-admin-kicker">Site público</p>
          <h2 id="ks-admin-about-title">Fotos da página Sobre</h2>
          <p>
            Só as imagens editáveis — o hero e os textos da /sobre continuam no código. A capa do
            estúdio e a foto Entrada do tour são slots separados.
          </p>
        </div>
      </div>

      <div className="ks-admin-about-block">
        <h3 className="ks-admin-about-block-title">Fotos da página</h3>
        <div className="ks-admin-about-grid">
          {PAGE_SLOTS.map((item) => (
            <AboutMediaSlotCard
              key={item.id}
              slotId={item.id}
              label={item.label}
              hint={item.hint}
              slot={readSlot(media, item.id)}
              busy={anyBusy}
              uploading={busySlot === item.id}
              stage={stage}
              stageDetail={stageDetail}
              error={busySlot === item.id ? error : null}
              sectionHidden={item.id === "behindScenesImage" ? bastidoresHidden : undefined}
              onFile={(file) => void onFile(item.id, file)}
              onClear={() => void save({ clearAboutMediaSlot: item.id }, "Foto removida — volta ao padrão.", item.id)}
              onFocalCommit={(next) =>
                void save(
                  {
                    aboutMediaSlot: {
                      id: item.id,
                      focalX: next.x,
                      focalY: next.y,
                    },
                  },
                  "Enquadramento salvo.",
                  item.id,
                )
              }
              onSectionHiddenChange={
                item.id === "behindScenesImage"
                  ? (hidden) =>
                      void save(
                        { aboutHiddenSection: { id: "bastidores", hidden } },
                        hidden ? "Seção Bastidores oculta no site." : "Seção Bastidores visível no site.",
                        "bastidores",
                      )
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      <div className="ks-admin-about-block ks-admin-about-block--tour">
        <header className="ks-admin-about-tour-head">
          <p className="ks-admin-about-tour-kicker">5 fotos · capa + passos</p>
          <h3 className="ks-admin-about-block-title">Tour do estúdio</h3>
          <p className="ks-admin-about-tour-lead">
            Capa do convite e as quatro fotos do passeio (Entrada, Espaço, Processo, Vista). Cada
            passo tem rótulo próprio — a capa não substitui a Entrada.
          </p>
        </header>
        <div className="ks-admin-about-grid">
          {TOUR_SLOTS.map((item) => (
            <AboutMediaSlotCard
              key={item.id}
              slotId={item.id}
              label={item.label}
              hint={item.hint}
              slot={readSlot(media, item.id)}
              busy={anyBusy}
              uploading={busySlot === item.id}
              stage={stage}
              stageDetail={stageDetail}
              error={busySlot === item.id ? error : null}
              onFile={(file) => void onFile(item.id, file)}
              onClear={() => void save({ clearAboutMediaSlot: item.id }, "Foto removida — volta ao padrão.", item.id)}
              onFocalCommit={(next) =>
                void save(
                  {
                    aboutMediaSlot: {
                      id: item.id,
                      focalX: next.x,
                      focalY: next.y,
                    },
                  },
                  "Enquadramento salvo.",
                  item.id,
                )
              }
            />
          ))}
        </div>
      </div>

      {status ? <p className="ks-admin-youtube-status" role="status">{status}</p> : null}
      {error ? <p className="ks-admin-field-error" role="alert">{error}</p> : null}
    </section>
  );
}
