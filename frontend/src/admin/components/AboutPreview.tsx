import { ArrowRight, HeartHandshake } from "lucide-react";
import type { AboutDocument } from "../data/types";
import { SitePreviewFrame } from "./SitePreviewFrame";
import { StarGlyph } from "../../app/components/StarGlyph";

const NAV_LINKS = ["Início", "Sobre", "Portfólio", "Reformulações", "Flash Tattoos", "Produtos"];

function FeatureStrip({ cards = [] }: { cards?: { title: string; text: string }[] }) {
  if (cards.length === 0) return null;

  return (
    <section className="ks-section ks-surface-band">
      <div className="ks-card-grid three">
        {cards.map((card, index) => (
          <article className="ks-card" key={index}>
            <HeartHandshake size={18} />
            <h3><Filled value={card.title} fallback="Título" /></h3>
            <p><Filled value={card.text} fallback="Texto explicativo" /></p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Filled({ value, fallback }: { value: unknown; fallback: string }) {
  const text = value == null ? "" : String(value).trim();
  if (text) return <>{text}</>;
  return <em className="ksa-empty">{fallback}</em>;
}

export function AboutPreview({ value }: { value: AboutDocument }) {
  return (
    <SitePreviewFrame>
      <div className="ks-grain" aria-hidden="true" />
      <header className="ks-header">
        <span className="ks-logo"><StarGlyph size={8} color="#2E173A" /> Karina Sarte</span>
        <nav className="ks-desktop-nav">
          {NAV_LINKS.map((label, index) => (
            <a key={label} className={`ks-nav-item${index === 1 ? " active" : ""}`}>{label}</a>
          ))}
          <a className="ks-nav-cta">Quero um orçamento</a>
        </nav>
      </header>

      <div className="ks-route-content">
        <section className={`ks-page-hero${value.heroImageUrl ? "" : " ks-page-hero-no-image"}`}>
          {value.heroImageUrl ? (
            <img
              className="ks-page-hero-image"
              src={value.heroImageUrl}
              alt=""
              aria-hidden="true"
              loading="eager"
              style={{ objectPosition: "center 36%" }}
            />
          ) : (
            <div className="ks-page-hero-image ks-numbered-placeholder" aria-hidden="true">
              <span>Imagem de fundo</span>
            </div>
          )}
          <div className="ks-page-hero-shade" aria-hidden="true" />
          <div className="ks-page-hero-content">
            <span className="ks-label-caps ks-muted">
              <Filled value={value.eyebrow} fallback="Apresentação" />
            </span>
            <h1 className="ks-display-xl">
              <Filled value={value.title} fallback="Sobre a Karina Sarte" />
            </h1>
            <p className="ks-body-lg">
              <Filled value={value.intro} fallback="Tatuadora e artista visual." />
            </p>
            <a className="ks-primary-link" style={{ marginTop: "1rem" }}>Quero criar minha tattoo <ArrowRight size={16} /></a>
          </div>
        </section>

        <section className="ks-section ks-two-col ks-section-cream ks-about-main">
          <div className="ks-preview-image">
            {value.imageUrl ? (
              <img src={value.imageUrl} alt="" loading="lazy" />
            ) : (
              <div className="ks-numbered-placeholder" aria-hidden="true" style={{ width: "100%", height: "100%", aspectRatio: "3/4" }}>
                <span>Foto</span>
              </div>
            )}
          </div>
          <div className="ks-stack">
            <blockquote className="ks-about-me-quote">
              “<Filled value={value.quote} fallback="Em cada traço, coloco intenção..." />”
            </blockquote>
            <p className="ks-body-lg ks-muted" style={{ whiteSpace: "pre-line" }}>
              <Filled value={value.biography} fallback="Sua história e experiência aqui." />
            </p>

            <div style={{ marginTop: "2rem" }}>
              <h3 className="ks-headline-sm"><Filled value={value.approachTitle} fallback="Um processo próximo e cuidadoso" /></h3>
              <p className="ks-body-lg ks-muted" style={{ marginTop: "1rem", whiteSpace: "pre-line" }}>
                <Filled value={value.approachText} fallback="Como você atende e guia a cliente." />
              </p>
            </div>
            
            <a className="ks-primary-link" style={{ marginTop: "2rem" }}>Quero criar minha tattoo <ArrowRight size={16} /></a>
          </div>
        </section>
        {value.behindScenesImageUrl && (
          <section className="ks-section ks-about-behind-scenes">
            <figure className="ks-about-behind-scenes-frame">
              <img src={value.behindScenesImageUrl} alt="" loading="lazy" />
              <figcaption><Filled value={value.behindScenesCaption} fallback="Uma legenda descontraída aqui." /></figcaption>
            </figure>
          </section>
        )}
        <FeatureStrip cards={value.approachCards} />
      </div>
    </SitePreviewFrame>
  );
}
