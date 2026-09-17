import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { Link } from "react-router";
import { BioLinkAction, bioActionIcon } from "./BioLinkAction";
import { useFlashItems, useFlashPageContent } from "../flash-content";
import { useLinkBioContent, type LinkBioButton } from "../link-bio-content";
import { isPageVisible } from "../section-visibility";
import { useWhatsappPhone, whatsappHref } from "../site-settings";
import { focalStyle } from "../focal";

const DEVELOPER_PORTFOLIO = "https://brunosouza.dev.br";
function isWhatsappButton(button: LinkBioButton) {
  return button.kind === "whatsapp" || /^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)(\/|$)/i.test(button.url);
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

/** Reveal por scroll: uma vez, depois desconecta. Sem listener de scroll. */
function useBioScrollReveal(active: boolean, reduceMotion: boolean) {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const root = rootRef.current;
    if (!root) return;

    const nodes = root.querySelectorAll<HTMLElement>("[data-bio-reveal]");
    if (!nodes.length) return;

    const scrollRoot = document.getElementById("ks-scroll-root");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      },
      {
        root: scrollRoot instanceof Element ? scrollRoot : null,
        threshold: 0.16,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [active, reduceMotion]);

  return rootRef as RefObject<HTMLSectionElement>;
}

export function LinkBioLanding() {
  const content = useLinkBioContent();
  const phone = useWhatsappPhone();
  const reduceMotion = Boolean(useReducedMotion());
  const flashPage = useFlashPageContent();
  const flashItems = useFlashItems();
  const flashPageVisible = isPageVisible(flashPage);
  const pageRef = useBioScrollReveal(content.loaded, reduceMotion);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const primaryCta =
    [...content.buttons]
      .filter((item) => item.active && isWhatsappButton(item))
      .sort((a, b) => a.order - b.order)[0] ?? null;

  const primaryLabel = primaryCta?.label || content.finalButton || "Solicitar orçamento";
  const primaryUrl = primaryCta?.url;

  const secondaryLinks = [...content.buttons]
    .filter((item) => item.active && item.id !== primaryCta?.id)
    .filter((item) => flashPageVisible || !isFlashLink(item))
    .sort((a, b) => a.order - b.order);

  const flashes = flashItems
    .filter((item) => item.active && ["disponivel", "disponível"].includes(item.status.toLowerCase()))
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      status: "Disponível",
      imageUrl: item.imageUrl || "",
    }));

  const showFlashSection = flashPageVisible && flashes.length > 0;

  const styleChips = [...content.styleChips]
    .filter((item) => item.active && item.label.trim())
    .sort((a, b) => a.order - b.order);

  const testimonials = [...content.testimonials]
    .filter((item) => item.active && item.text.trim())
    .sort((a, b) => a.order - b.order)
    .map((item) => item.text);

  const studioImage = content.studioImageUrl || "/assets/studio/processo.jpeg";
  const coverImage = content.backgroundUrl || "/assets/projeto-destaque.jpeg";

  return (
    <section
      ref={pageRef}
      className={`ks-link-bio-page ks-link-bio-page--lilac ks-bio-refined${reduceMotion ? " is-reduced-motion" : ""}`}
      aria-label="Link da bio Karina Sarte"
    >
      <div className="ks-link-bio-shell">
        <div className="ks-link-bio-card">
          <div className="ks-link-bio-atmosphere" aria-hidden="true">
            <span className="ks-link-bio-star star-1" />
            <span className="ks-link-bio-star star-2" />
            <span className="ks-link-bio-star star-3" />
            <span className="ks-link-bio-star star-4" />
            <span className="ks-link-bio-star star-5" />
            <span className="ks-link-bio-star star-6" />
            <span className="ks-link-bio-star star-7" />
            <span className="ks-link-bio-star star-8" />
          </div>
          <div className="bio-cover" aria-hidden="true">
            <img src={coverImage} alt="" />
            <span>arte que vive na pele</span>
          </div>
          <div className="ks-link-bio-profile">
            <div className="ks-link-bio-avatar-wrap">
              {content.avatarUrl ? (
                <img
                  className="ks-link-bio-avatar"
                  src={content.avatarUrl}
                  alt={content.name || "Karina Sarte"}
                  width={112}
                  height={112}
                  style={focalStyle(content.avatarFocalX, content.avatarFocalY)}
                />
              ) : (
                <span className="ks-link-bio-avatar ks-link-bio-avatar-placeholder" aria-hidden="true">
                  <Sparkles size={26} />
                </span>
              )}
            </div>

            <h1>{content.name || "Karina Sarte"}</h1>
            <p className="ks-link-bio-subtitle">{content.bio || "Tatuagem autoral · Teresópolis, RJ"}</p>
          </div>

          {!content.loaded && <div className="bio-loading" role="status"><span />Carregando meus links…</div>}
          {content.linksError && <div className="bio-load-error" role="status"><p>Não foi possível carregar os links.</p><button type="button" onClick={content.retry}>Tentar novamente</button></div>}
          {primaryCta && <BioLinkAction button={primaryCta} className="ks-link-bio-primary-cta ks-bio-enter" />}

          <div className="ks-link-bio-links">
            {secondaryLinks.map((button, index) => (
              <div
                key={button.id}
                className="ks-bio-enter"
                style={{ "--ks-bio-enter-delay": `${60 + index * 60}ms` } as CSSProperties}
              >
                <BioLinkAction button={button} />
              </div>
            ))}
          </div>

          {(content.footerLabel || content.footerUrl) && (
            <div className="ks-bio-enter" style={{ "--ks-bio-enter-delay": "180ms" } as CSSProperties}>
              {isExternalLink(content.footerUrl) ? (
                <a className="ks-link-bio-site-link" href={content.footerUrl} target="_blank" rel="noopener noreferrer">
                  {content.footerLabel || "Site completo"} <ArrowRight size={14} />
                </a>
              ) : (
                <Link className="ks-link-bio-site-link" to={content.footerUrl || "/"}>
                  {content.footerLabel || "Site completo"} <ArrowRight size={14} />
                </Link>
              )}
            </div>
          )}

          {styleChips.length > 0 ? (
            <div className="bio-style-tags" data-bio-reveal aria-label={content.stylesLabel || "Linguagem visual"}>

              {content.stylesTitle ? <h2 className="bio-style-tags__title">{content.stylesTitle}</h2> : null}
              {content.stylesText ? <p className="bio-style-tags__support">{content.stylesText}</p> : null}
              <div className="bio-style-tags__grid">
                {styleChips.map((chip, index) => (
                  <button
                    type="button"
                    aria-pressed={selectedStyle === chip.label}
                    onClick={() => setSelectedStyle((current) => current === chip.label ? null : chip.label)}
                    key={chip.id}
                    className="bio-style-tags__chip"
                    style={{ "--ks-chip-delay": `${index * 55}ms`, "--ks-chip-twinkle": `${1.8 + (index % 5) * 0.7}s` } as CSSProperties}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <div className="bio-style-selection" aria-live="polite">
                {selectedStyle ? <><span><Check size={14} /> Sua inspiração: {selectedStyle}</span>{primaryCta && <a href={whatsappHref(`Olá Karina, vim pela bio e gostaria de conversar sobre uma tattoo no estilo ${selectedStyle}.`, phone)} target="_blank" rel="noopener noreferrer">Conversar sobre essa ideia <ArrowRight size={14} /></a>}</> : <span>Toque no estilo que combina com você.</span>}
              </div>
            </div>
          ) : null}

          {showFlashSection ? (
            <section className="ks-bio-block" data-bio-reveal aria-labelledby="bio-flash-title">

              <h2 id="bio-flash-title" className="ks-bio-block__title">
                {content.flashTitle}
              </h2>
              <p className="ks-bio-block__text">{content.flashText}</p>
              <div className="ks-bio-snap" aria-label="Flash tattoos disponíveis">
                {flashes.map((item) => (
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
              <p className="ks-bio-snap-hint">Deslize para ver mais</p>
              <Link className="ks-bio-block__cta" to="/flash-tattoos">
                {content.flashCta} <ArrowRight size={14} />
              </Link>
            </section>
          ) : null}

          {testimonials.length > 0 ? (
            <section className="ks-bio-block ks-bio-block--quotes" data-bio-reveal aria-labelledby="bio-quotes-title">
              <div className="bio-quotes-panel__media" aria-hidden="true">
                <img src={coverImage} alt="" />
              </div>
              <div className="bio-quotes-panel__body">
                <p className="bio-quotes-panel__eyebrow">{content.testimonialsLabel || "Depoimentos"}</p>
                <h2 id="bio-quotes-title" className="ks-bio-block__title">
                  {content.testimonialsTitle}
                </h2>
                <BioQuotesCarousel quotes={testimonials} reduceMotion={reduceMotion} />
                {primaryCta && (
                  <a className="ks-bio-block__cta" href={primaryUrl} target="_blank" rel="noopener noreferrer">
                    {content.testimonialsCta} <ArrowRight size={14} />
                  </a>
                )}
              </div>
            </section>
          ) : null}

          <section className="ks-bio-block ks-bio-studio" data-bio-reveal aria-labelledby="bio-studio-title">
            <div className="ks-bio-studio__media">
              <img
                src={studioImage}
                alt="Studio Karina Sarte"
                loading="lazy"
                style={focalStyle(content.studioFocalX, content.studioFocalY)}
              />
            </div>

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

          {primaryCta && <section className="ks-bio-final-cta" data-bio-reveal aria-labelledby="bio-final-title">
            <h2 id="bio-final-title">{content.finalTitle}</h2>
            <p>{content.finalText}</p>
            <a className="ks-link-bio-action is-primary" href={primaryUrl} target="_blank" rel="noopener noreferrer">
              <span className="ks-link-bio-action-icon">{bioActionIcon("whatsapp")}</span>
              <span>{content.finalButton || primaryLabel}</span>
              <ArrowRight size={16} className="ks-link-bio-action-arrow" />
            </a>
          </section>}

          <p className="ks-bio-dev-credit">
            Desenvolvido por{" "}
            <a href={DEVELOPER_PORTFOLIO} target="_blank" rel="noopener noreferrer">
              Bruno Souza
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function BioQuotesCarousel({ quotes, reduceMotion }: { quotes: string[]; reduceMotion: boolean }) {
  const [index, setIndex] = useState(0);
  const current = quotes.length ? index % quotes.length : 0;

  useEffect(() => {
    if (reduceMotion || quotes.length < 2) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      setIndex((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [quotes.length, reduceMotion]);

  if (!quotes.length) return null;

  return (
    <div className="bio-quotes" role="region" aria-roledescription="carrossel" aria-label="Depoimentos">
      <blockquote aria-live="polite" aria-atomic="true">
        <span aria-hidden="true">“</span>
        <p key={quotes[current]} className={reduceMotion ? undefined : "is-quote-enter"}>
          {quotes[current]}
        </p>
      </blockquote>
    </div>
  );
}
