import { ArrowRight, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BrandStar } from "./BrandStar";
import { BioLinkAction, bioActionIcon } from "./BioLinkAction";
import { useFlashItems, useFlashPageContent } from "../flash-content";
import { useLinkBioContent, type LinkBioButton } from "../link-bio-content";
import { isPageVisible } from "../section-visibility";
import { useWhatsappPhone, whatsappHref } from "../site-settings";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DEFAULT_WA_MESSAGE =
  "Olá Karina, vim pelo seu link da bio e queria fazer um orçamento de tattoo.";

const STAR_ASSETS = [
  "/assets/brand/star-karina-filled.webp",
  "/assets/brand/star-karina-outline.webp",
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

function flashWa(title: string, phone: string) {
  return whatsappHref(`Olá Karina, vim pelo link da bio e quero o flash "${title}".`, phone);
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
  const phone = useWhatsappPhone();
  const reduceMotion = useReducedMotion();
  const flashPage = useFlashPageContent();
  const flashItems = useFlashItems();
  const flashPageVisible = isPageVisible(flashPage);
  const defaultWaUrl = whatsappHref(DEFAULT_WA_MESSAGE, phone);

  if (!content.loaded) {
    return <section className="ks-link-bio-page ks-link-bio-page--lilac ks-link-bio-page--boot" aria-hidden="true" />;
  }

  const primaryCta =
    [...content.buttons]
      .filter((item) => item.active && isWhatsappButton(item))
      .sort((a, b) => a.order - b.order)[0] ?? null;

  const primaryLabel = primaryCta?.label || content.finalButton || "Solicitar orçamento";
  const primaryUrl =
    primaryCta?.url && isExternalLink(primaryCta.url) ? primaryCta.url : defaultWaUrl;

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
              {bioActionIcon("whatsapp")}
            </span>
            <span>{primaryLabel}</span>
            <ArrowRight size={16} />
          </motion.a>

          <div className="ks-link-bio-links">
            {secondaryLinks.map((button, index) => (
              <motion.div key={button.id} {...fadeUp(0.12 + index * 0.04)}>
                <BioLinkAction button={button} />
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
                          <img src={item.imageUrl} alt={item.title} loading="lazy" decoding="async" />
                        ) : (
                          <span className="ks-bio-flash-card__placeholder" aria-hidden="true">
                            <Sparkles size={22} />
                          </span>
                        )}
                      </div>
                      <div className="ks-bio-flash-card__body">
                        <span className="ks-bio-status">{item.status}</span>
                        <strong>{item.title}</strong>
                        <a href={flashWa(item.title, phone)} target="_blank" rel="noopener noreferrer">
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
                {bioActionIcon("whatsapp")}
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
