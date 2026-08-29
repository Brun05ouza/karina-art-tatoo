import { ArrowRight, Images, LinkIcon, ShoppingBag, Sparkles, Youtube } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BrandStar } from "./BrandStar";
import { useFlashItems, useFlashPageContent } from "../flash-content";
import { useLinkBioContent, type LinkBioButton } from "../link-bio-content";
import { isPageVisible } from "../section-visibility";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const WHATSAPP = "https://wa.me/5521990724477";
const DEFAULT_WA_MESSAGE =
  "Olá Karina, vim pelo seu link da bio e queria fazer um orçamento de tattoo.";
const DEFAULT_WA_URL = `${WHATSAPP}?text=${encodeURIComponent(DEFAULT_WA_MESSAGE)}`;

const STAR_ASSETS = [
  "/assets/brand/star-karina-filled.png",
  "/assets/brand/star-karina-outline.png",
] as const;

function isWhatsappButton(button: LinkBioButton) {
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

function isFlashLink(button: LinkBioButton) {
  return button.url.includes("flash") || button.label.toLowerCase().includes("flash");
}

function isExternalLink(url: string) {
  return /^(https?:|mailto:|tel:|whatsapp:)/i.test(url);
}

function flashWa(title: string) {
  return `${WHATSAPP}?text=${encodeURIComponent(
    `Olá Karina, vim pelo link da bio e quero o flash "${title}".`,
  )}`;
}

function BioStarBreak({ align = "right" }: { align?: "left" | "right" | "center" }) {
  const assets = [0, 1] as const;
  return (
    <div className={`ks-section-star-break ks-section-star-break-${align} ks-bio-star-break`} aria-hidden="true">
      <div className="ks-section-star-break-field">
        {assets.map((assetIndex, index) => (
          <img
            key={`${align}-${index}`}
            className={`ks-section-star-break-star star-${index + 1}`}
            src={STAR_ASSETS[assetIndex]}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}

export function LinkBioLanding() {
  const content = useLinkBioContent();
  const reduceMotion = useReducedMotion();
  const flashPage = useFlashPageContent();
  const flashItems = useFlashItems();
  const flashPageVisible = isPageVisible(flashPage);

  if (!content.loaded) {
    return <section className="ks-link-bio-page ks-link-bio-page--lilac ks-link-bio-page--boot" aria-hidden="true" />;
  }

  const primaryCta =
    [...content.buttons]
      .filter((item) => item.active && isWhatsappButton(item))
      .sort((a, b) => a.order - b.order)[0] ?? null;

  const primaryLabel = primaryCta?.label || content.finalButton || "Solicitar orçamento";
  const primaryUrl =
    primaryCta?.url && isExternalLink(primaryCta.url) ? primaryCta.url : DEFAULT_WA_URL;

  const secondaryLinks = [...content.buttons]
    .filter((item) => item.active && !isWhatsappButton(item))
    .filter((item) => flashPageVisible || !isFlashLink(item))
    .sort((a, b) => a.order - b.order);

  const flashes = flashItems
    .filter((item) => item.status.toLowerCase() !== "reservado")
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status || "Disponível",
      imageUrl: item.imageUrl || "",
    }));

  const flashCards = flashes;
  const showFlashSection = flashPageVisible && flashCards.length > 0;

  const styleChips = [...content.styleChips]
    .filter((item) => item.active && item.label.trim())
    .sort((a, b) => a.order - b.order);

  const testimonials = [...content.testimonials]
    .filter((item) => item.active && item.text.trim())
    .sort((a, b) => a.order - b.order)
    .map((item) => item.text);

  const studioImage = content.studioImageUrl || "/assets/studio/studio-5.jpeg";

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: EASE },
        };

  return (
    <section className="ks-link-bio-page ks-link-bio-page--lilac" aria-label="Link da bio Karina Sarte">
      <BrandStar variant={2} size={96} className="ks-link-bio-deco ks-link-bio-deco-a" />
      <BrandStar variant={3} size={56} className="ks-link-bio-deco ks-link-bio-deco-b" />

      <div className="ks-link-bio-shell">
        <motion.div className="ks-link-bio-card" {...fadeUp(0)}>
          <div className="ks-link-bio-profile">
            <motion.div
              className="ks-link-bio-avatar-wrap"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {content.avatarUrl ? (
                <img className="ks-link-bio-avatar" src={content.avatarUrl} alt={content.name || "Karina Sarte"} />
              ) : (
                <span className="ks-link-bio-avatar ks-link-bio-avatar-placeholder" aria-hidden="true">
                  <Sparkles size={26} />
                </span>
              )}
            </motion.div>
            <span className="ks-label-caps">{content.eyebrow || "Link da bio"}</span>
            <h1>{content.name || "Karina Sarte"}</h1>
            <p className="ks-link-bio-subtitle">{content.bio || "Tatuagem autoral · Teresópolis, RJ"}</p>
          </div>

          <motion.a
            className="ks-link-bio-action is-primary ks-link-bio-primary-cta"
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            {...fadeUp(0.08)}
          >
            <span className="ks-link-bio-action-icon">
              <WhatsAppGlyph />
            </span>
            <span>{primaryLabel}</span>
            <ArrowRight size={16} />
          </motion.a>

          <div className="ks-link-bio-links">
            {secondaryLinks.map((button, index) => (
              <motion.div key={button.id} {...fadeUp(0.12 + index * 0.04)}>
                <BioLinkButton button={button} />
              </motion.div>
            ))}
          </div>

          {(content.footerLabel || content.footerUrl) && (
            <motion.div {...fadeUp(0.28)}>
              {isExternalLink(content.footerUrl) ? (
                <a className="ks-link-bio-site-link" href={content.footerUrl} target="_blank" rel="noopener noreferrer">
                  {content.footerLabel || "Site completo"} <ArrowRight size={14} />
                </a>
              ) : (
                <Link className="ks-link-bio-site-link" to={content.footerUrl || "/"}>
                  {content.footerLabel || "Site completo"} <ArrowRight size={14} />
                </Link>
              )}
            </motion.div>
          )}

          {styleChips.length > 0 ? (
            <div className="bio-style-tags" aria-label={content.stylesLabel || "Linguagem visual"}>
              {content.stylesLabel ? <span className="bio-style-tags__label">{content.stylesLabel}</span> : null}
              {content.stylesTitle ? <p className="bio-style-tags__title">{content.stylesTitle}</p> : null}
              {content.stylesText ? <p className="bio-style-tags__support">{content.stylesText}</p> : null}
              <div className="bio-style-tags__grid">
                {styleChips.map((chip, index) => (
                  <motion.span
                    key={chip.id}
                    className="bio-style-tags__chip"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.2 + index * 0.04, ease: EASE }}
                  >
                    {chip.label}
                  </motion.span>
                ))}
              </div>
            </div>
          ) : null}

          {showFlashSection ? (
            <>
              <BioStarBreak align="right" />
              <section className="ks-bio-block" aria-labelledby="bio-flash-title">
                <span className="ks-bio-block__label">{content.flashLabel}</span>
                <h2 id="bio-flash-title" className="ks-bio-block__title">
                  {content.flashTitle}
                </h2>
                <p className="ks-bio-block__text">{content.flashText}</p>
                <div className="ks-bio-snap">
                  {flashCards.map((item) => (
                    <article className="ks-bio-flash-card" key={item.id}>
                      <div className="ks-bio-flash-card__media">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} loading="lazy" />
                        ) : (
                          <span className="ks-bio-flash-card__placeholder" aria-hidden="true">
                            <Sparkles size={22} />
                          </span>
                        )}
                      </div>
                      <div className="ks-bio-flash-card__body">
                        <span className="ks-bio-status">{item.status}</span>
                        <strong>{item.title}</strong>
                        <a href={flashWa(item.title)} target="_blank" rel="noopener noreferrer">
                          Quero esse flash <ArrowRight size={14} />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
                <Link className="ks-bio-block__cta" to="/flash-tattoos">
                  {content.flashCta} <ArrowRight size={14} />
                </Link>
              </section>
            </>
          ) : null}

          {testimonials.length > 0 ? (
            <>
              <BioStarBreak align="left" />
              <section className="ks-bio-block" aria-labelledby="bio-quotes-title">
                <span className="ks-bio-block__label">{content.testimonialsLabel}</span>
                <h2 id="bio-quotes-title" className="ks-bio-block__title">
                  {content.testimonialsTitle}
                </h2>
                <BioQuotesCarousel quotes={testimonials} reduceMotion={Boolean(reduceMotion)} />
                <a className="ks-bio-block__cta" href={primaryUrl} target="_blank" rel="noopener noreferrer">
                  {content.testimonialsCta} <ArrowRight size={14} />
                </a>
              </section>
            </>
          ) : null}

          <section className="ks-bio-block ks-bio-studio" aria-labelledby="bio-studio-title">
            <div className="ks-bio-studio__media">
              <img src={studioImage} alt="Studio Karina Sarte" loading="lazy" />
              <BrandStar variant={2} size={54} className="ks-bio-studio__star" />
            </div>
            <span className="ks-bio-block__label">{content.studioLabel}</span>
            <h2 id="bio-studio-title" className="ks-bio-block__title">
              {content.studioTitle}
            </h2>
            <p className="ks-bio-block__text">{content.studioText}</p>
            {isExternalLink(content.studioButtonUrl) ? (
              <a className="ks-bio-block__cta" href={content.studioButtonUrl} target="_blank" rel="noopener noreferrer">
                {content.studioButton} <ArrowRight size={14} />
              </a>
            ) : (
              <Link className="ks-bio-block__cta" to={content.studioButtonUrl || "/sobre"}>
                {content.studioButton} <ArrowRight size={14} />
              </Link>
            )}
          </section>

          <BioStarBreak align="right" />
          <section className="ks-bio-final-cta" aria-labelledby="bio-final-title">
            <BrandStar variant={3} size={36} className="ks-bio-final-cta__star a" />
            <h2 id="bio-final-title">{content.finalTitle}</h2>
            <p>{content.finalText}</p>
            <a className="ks-link-bio-action is-primary" href={primaryUrl} target="_blank" rel="noopener noreferrer">
              <span className="ks-link-bio-action-icon">
                <WhatsAppGlyph />
              </span>
              <span>{content.finalButton || primaryLabel}</span>
              <ArrowRight size={16} />
            </a>
          </section>
        </motion.div>
      </div>
    </section>
  );
}

function BioQuotesCarousel({ quotes, reduceMotion }: { quotes: string[]; reduceMotion: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || quotes.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % quotes.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [quotes.length, reduceMotion]);

  const quote = quotes[index] ?? quotes[0]!;

  return (
    <div className="ks-bio-quote-carousel" aria-live="polite">
      <div className="ks-bio-quote-carousel__stage">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={quote}
            className="ks-bio-quote ks-bio-quote--carousel"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <span aria-hidden="true">✦</span>
            <p>“{quote}”</p>
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <div className="ks-bio-quote-carousel__dots" role="tablist" aria-label="Depoimentos">
        {quotes.map((item, dotIndex) => (
          <button
            key={item}
            type="button"
            className={dotIndex === index ? "is-active" : ""}
            aria-label={`Depoimento ${dotIndex + 1}`}
            aria-selected={dotIndex === index}
            onClick={() => setIndex(dotIndex)}
          />
        ))}
      </div>
    </div>
  );
}

function BioLinkButton({ button }: { button: LinkBioButton }) {
  const inner = (
    <>
      <span className="ks-link-bio-action-icon">{bioIcon(button.icon)}</span>
      <span>{button.label}</span>
      <ArrowRight size={16} />
    </>
  );

  if (isExternalLink(button.url)) {
    return (
      <a className="ks-link-bio-action" href={button.url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link className="ks-link-bio-action" to={button.url || "/"}>
      {inner}
    </Link>
  );
}

function bioIcon(icon: string) {
  const normalized = icon.toLowerCase();
  if (normalized.includes("message") || normalized.includes("whatsapp") || normalized.includes("zap")) return <WhatsAppGlyph />;
  if (normalized.includes("tiktok")) return <TikTokGlyph />;
  if (normalized.includes("instagram") || normalized.includes("insta")) return <InstagramGlyph />;
  if (normalized.includes("youtube")) return <Youtube size={18} />;
  if (normalized.includes("image")) return <Images size={18} />;
  if (normalized.includes("spark")) return <Sparkles size={18} />;
  if (normalized.includes("shop")) return <ShoppingBag size={18} />;
  return <LinkIcon size={18} />;
}

function WhatsAppGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.522 5.851L.054 23.25a.75.75 0 0 0 .916.916l5.453-1.474A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.964-1.363l-.357-.214-3.685.997.985-3.594-.234-.371A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}

function TikTokGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.2 8.2 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1.01-.15z" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
