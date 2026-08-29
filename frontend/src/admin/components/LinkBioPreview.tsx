import { ArrowRight, Images, LinkIcon, ShoppingBag, Sparkles, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import fontsCss from "../../styles/fonts.css?inline";
import siteCss from "../../styles/kah-sarte.css?inline";
import { useFlashItems, useFlashPageContent } from "../../app/flash-content";
import { isPageVisible } from "../../app/section-visibility";
import type { LinkBioDocument, LinkButton } from "../data/types";

const FRAME_DOC = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>
${fontsCss}
${siteCss}
html, body {
  background: #000;
  height: 720px;
  margin: 0;
  max-height: 720px;
  overflow-x: hidden;
  overflow-y: scroll;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  width: 390px;
  -webkit-overflow-scrolling: touch;
}
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: block;
  width: 6px;
}
html::-webkit-scrollbar-thumb,
body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.28);
  border-radius: 999px;
}
a, button { pointer-events: none; }
.ks-link-bio-page {
  height: auto !important;
  max-height: none !important;
  min-height: 720px !important;
  overflow: visible !important;
  width: 390px;
}
.ks-link-bio-shell { max-width: 390px; }
.ks-link-bio-shell .ks-link-bio-card { min-height: auto; }
</style>
</head><body></body></html>`;

function isWhatsappButton(button: LinkButton) {
  const icon = button.icon.toLowerCase();
  const label = button.label.toLowerCase();
  return (
    icon.includes("whatsapp") ||
    icon.includes("message") ||
    icon.includes("zap") ||
    label.includes("orçamento") ||
    label.includes("orcamento")
  );
}

function isFlashLink(button: LinkButton) {
  return button.url.includes("flash") || button.label.toLowerCase().includes("flash");
}

export function LinkBioPreview({ value }: { value: LinkBioDocument }) {
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    return () => setBody(null);
  }, []);

  return (
    <div className="ksa-link-bio-preview">
      <iframe
        title="Prévia da bio"
        srcDoc={FRAME_DOC}
        scrolling="yes"
        onLoad={(event) => setBody(event.currentTarget.contentDocument?.body ?? null)}
      />
      {body ? createPortal(<LinkBioPreviewBody value={value} />, body) : null}
    </div>
  );
}

function LinkBioPreviewBody({ value }: { value: LinkBioDocument }) {
  const flashPage = useFlashPageContent();
  const flashItems = useFlashItems();
  const flashPageVisible = isPageVisible(flashPage);

  const primaryCta =
    [...(value.buttons || [])]
      .filter((item) => item.active && isWhatsappButton(item))
      .sort((a, b) => a.order - b.order)[0] ?? null;

  const primaryLabel = primaryCta?.label || value.finalButton || "Solicitar orçamento";

  const secondaryLinks = [...(value.buttons || [])]
    .filter((item) => item.active && !isWhatsappButton(item))
    .filter((item) => flashPageVisible || !isFlashLink(item))
    .sort((a, b) => a.order - b.order);

  const styleChips = [...(value.styleChips || [])]
    .filter((item) => item.active && item.label?.trim())
    .sort((a, b) => a.order - b.order);

  const testimonials = [...(value.testimonials || [])]
    .filter((item) => item.active && item.text?.trim())
    .sort((a, b) => a.order - b.order);

  const flashCards = flashItems
    .filter((item) => item.status.toLowerCase() !== "reservado")
    .slice(0, 3);

  const backgroundUrl = value.backgroundUrl || "";
  const studioImage = value.studioImageUrl || "/assets/studio/studio-5.jpeg";
  const previewQuote = testimonials[0]?.text || "";

  return (
    <section
      className="ks-link-bio-page"
      aria-label="Prévia Link da bio"
      data-has-photo={backgroundUrl ? "true" : "false"}
    >
      <div className="ks-link-bio-backdrop" aria-hidden="true">
        {backgroundUrl ? <img className="ks-link-bio-backdrop__img" src={backgroundUrl} alt="" /> : null}
        <div className="ks-link-bio-backdrop__fade" />
      </div>

      <img className="ks-link-bio-star star-1" src="/assets/brand/star-karina-filled.png" alt="" aria-hidden="true" />
      <img className="ks-link-bio-star star-2" src="/assets/brand/star-karina-outline.png" alt="" aria-hidden="true" />
      <img className="ks-link-bio-star star-3" src="/assets/brand/star-karina-filled.png" alt="" aria-hidden="true" />

      <div className="ks-link-bio-shell">
        <div className="ks-link-bio-card">
          <div className="ks-link-bio-profile">
            <div className="ks-link-bio-avatar-wrap">
              {value.avatarUrl ? (
                <img className="ks-link-bio-avatar" src={value.avatarUrl} alt="" />
              ) : (
                <span className="ks-link-bio-avatar ks-link-bio-avatar-placeholder" aria-hidden="true">
                  <Sparkles size={26} />
                </span>
              )}
            </div>
            <span className="ks-label-caps">{value.eyebrow || "Link da bio"}</span>
            <h1>{value.name || "Karina Sarte"}</h1>
            <p className="ks-link-bio-subtitle">{value.bio || "Tatuagem autoral · Teresópolis, RJ"}</p>
          </div>

          <span className="ks-link-bio-action is-primary ks-link-bio-primary-cta">
            <span className="ks-link-bio-action-icon">
              <WhatsAppGlyph />
            </span>
            <span>{primaryLabel}</span>
            <ArrowRight size={16} />
          </span>

          <div className="ks-link-bio-links">
            {secondaryLinks.map((button) => (
              <span className="ks-link-bio-action" key={button.id}>
                <span className="ks-link-bio-action-icon">{iconFor(button.icon)}</span>
                <span>{button.label}</span>
                <ArrowRight size={16} />
              </span>
            ))}
          </div>

          {value.footerLabel ? (
            <span className="ks-link-bio-site-link">
              {value.footerLabel} <ArrowRight size={14} />
            </span>
          ) : null}

          {styleChips.length > 0 ? (
            <div className="bio-style-tags" aria-label={value.stylesLabel || "Linguagem visual"}>
              {value.stylesLabel ? <span className="bio-style-tags__label">{value.stylesLabel}</span> : null}
              {value.stylesTitle ? <p className="bio-style-tags__title">{value.stylesTitle}</p> : null}
              {value.stylesText ? <p className="bio-style-tags__support">{value.stylesText}</p> : null}
              <div className="bio-style-tags__grid">
                {styleChips.map((chip) => (
                  <span className="bio-style-tags__chip" key={chip.id}>
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {flashPageVisible ? (
            <section className="ks-bio-block">
              <span className="ks-bio-block__label">{value.flashLabel || "flash tattoos"}</span>
              <h2 className="ks-bio-block__title">{value.flashTitle || "Flashs disponíveis"}</h2>
              <p className="ks-bio-block__text">{value.flashText}</p>
              <div className="ks-bio-snap">
                {(flashCards.length > 0
                  ? flashCards
                  : [
                      { id: "p1", title: "Floral lunar", status: "Disponível", imageUrl: "" },
                      { id: "p2", title: "Ornamental", status: "Disponível", imageUrl: "" },
                    ]
                ).map((item) => (
                  <article className="ks-bio-flash-card" key={item.id}>
                    <div className="ks-bio-flash-card__media">
                      {"imageUrl" in item && item.imageUrl ? (
                        <img src={item.imageUrl} alt="" />
                      ) : (
                        <span className="ks-bio-flash-card__placeholder" aria-hidden="true">
                          <Sparkles size={22} />
                        </span>
                      )}
                    </div>
                    <div className="ks-bio-flash-card__body">
                      <span className="ks-bio-status">{item.status || "Disponível"}</span>
                      <strong>{item.title}</strong>
                      <span>
                        Quero esse flash <ArrowRight size={14} />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
              <span className="ks-bio-block__cta">
                {value.flashCta || "Ver todos os flashs"} <ArrowRight size={14} />
              </span>
            </section>
          ) : null}

          {previewQuote ? (
            <section className="ks-bio-block">
              <span className="ks-bio-block__label">{value.testimonialsLabel || "depoimentos"}</span>
              <h2 className="ks-bio-block__title">{value.testimonialsTitle || "Quem já passou por aqui"}</h2>
              <div className="ks-bio-quote-carousel">
                <div className="ks-bio-quote-carousel__stage">
                  <blockquote className="ks-bio-quote ks-bio-quote--carousel">
                    <span aria-hidden="true">✦</span>
                    <p>“{previewQuote}”</p>
                  </blockquote>
                </div>
                <div className="ks-bio-quote-carousel__dots">
                  {testimonials.map((item, index) => (
                    <button key={item.id} type="button" className={index === 0 ? "is-active" : ""} />
                  ))}
                </div>
              </div>
              <span className="ks-bio-block__cta">
                {value.testimonialsCta || "Quero viver essa experiência também"} <ArrowRight size={14} />
              </span>
            </section>
          ) : null}

          <section className="ks-bio-block ks-bio-studio">
            <div className="ks-bio-studio__media">
              <img src={studioImage} alt="" />
              <img className="ks-bio-studio__star" src="/assets/brand/star-karina-filled.png" alt="" aria-hidden="true" />
            </div>
            <span className="ks-bio-block__label">{value.studioLabel || "meu studio"}</span>
            <h2 className="ks-bio-block__title">{value.studioTitle || "Um espaço para criar com calma"}</h2>
            <p className="ks-bio-block__text">{value.studioText}</p>
            <span className="ks-bio-block__cta">
              {value.studioButton || "Conhecer o studio"} <ArrowRight size={14} />
            </span>
          </section>

          <section className="ks-bio-final-cta">
            <img className="ks-bio-final-cta__star a" src="/assets/brand/star-karina-outline.png" alt="" aria-hidden="true" />
            <img className="ks-bio-final-cta__star b" src="/assets/brand/star-karina-filled.png" alt="" aria-hidden="true" />
            <h2>{value.finalTitle || "Vamos criar sua próxima tattoo?"}</h2>
            <p>{value.finalText}</p>
            <span className="ks-link-bio-action is-primary">
              <span className="ks-link-bio-action-icon">
                <WhatsAppGlyph />
              </span>
              <span>{value.finalButton || primaryLabel}</span>
              <ArrowRight size={16} />
            </span>
          </section>
        </div>
      </div>
    </section>
  );
}

function iconFor(icon: string) {
  const normalized = icon.toLowerCase();
  if (normalized.includes("whatsapp") || normalized.includes("message") || normalized.includes("zap")) return <WhatsAppGlyph />;
  if (normalized.includes("tiktok")) return <TikTokGlyph />;
  if (normalized.includes("instagram") || normalized.includes("insta")) return <InstagramGlyph />;
  if (normalized.includes("youtube")) return <Youtube size={18} />;
  if (normalized.includes("image")) return <Images size={18} />;
  if (normalized.includes("spark")) return <Sparkles size={18} />;
  if (normalized.includes("shop")) return <ShoppingBag size={18} />;
  return <LinkIcon size={18} />;
}

function TikTokGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 3c.35 2.4 1.75 4.05 4.05 4.2v3.25c-1.34.13-2.52-.3-3.98-1.18v6.08c0 7.72-8.42 10.14-11.8 4.6-2.17-3.56-.84-9.8 6.12-10.05v3.43c-.44.07-.91.18-1.34.33-1.29.44-2.02 1.26-1.82 2.7.39 2.76 5.45 3.57 5.03-1.82V3h3.74Z" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.81 4.81 0 0 0 12 7.2Zm0 7.92A3.12 3.12 0 1 1 15.12 12 3.12 3.12 0 0 1 12 15.12Z" />
      <path d="M17.52 2.4H6.48A4.08 4.08 0 0 0 2.4 6.48v11.04A4.08 4.08 0 0 0 6.48 21.6h11.04a4.08 4.08 0 0 0 4.08-4.08V6.48A4.08 4.08 0 0 0 17.52 2.4Zm2.4 15.12a2.4 2.4 0 0 1-2.4 2.4H6.48a2.4 2.4 0 0 1-2.4-2.4V6.48a2.4 2.4 0 0 1 2.4-2.4h11.04a2.4 2.4 0 0 1 2.4 2.4Z" />
      <circle cx="17.76" cy="6.24" r="1.08" />
    </svg>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.522 5.851L.054 23.25a.75.75 0 0 0 .916.916l5.453-1.474A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.964-1.363l-.357-.214-3.685.997.985-3.594-.234-.371A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}
