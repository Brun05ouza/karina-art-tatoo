import { ArrowRight, Play } from "lucide-react";
import { StarGlyph } from "../../app/components/StarGlyph";
import type { HomeCard, HomeDocument } from "../data/types";
import { SitePreviewFrame } from "./SitePreviewFrame";

/** Mesmos itens de app/components/Header.tsx. */
const NAV_LINKS = ["Início", "Sobre", "Portfólio", "Reformulações", "Flash Tattoos", "Produtos"];

/**
 * Prévia da Home.
 *
 * O markup e as classes abaixo são os mesmos de frontend/src/app/App.tsx, e o
 * CSS vem do próprio kah-sarte.css (ver SitePreviewFrame). Ao mexer nas seções
 * da home, replique a mudança aqui.
 *
 * Diferenças que permanecem, por construção:
 * - as animações de entrada (motion/GSAP) não rodam; a prévia mostra o estado
 *   final, que é como a seção fica depois de revelada;
 * - os itens de Portfólio são numerados como placeholder enquanto a curadoria
 *   não vem do banco.
 */

/** Marca campo vazio sem deixar buraco. A classe é declarada dentro do iframe. */
function Filled({ value, fallback }: { value: unknown; fallback: string }) {
  const text = value == null ? "" : String(value).trim();
  if (text) return <>{text}</>;
  return <em className="ksa-empty">{fallback}</em>;
}

function activeSorted(cards: HomeCard[]) {
  return [...(cards ?? [])].filter((card) => card.active).sort((a, b) => a.order - b.order);
}

const pad = (index: number) => String(index).padStart(2, "0");

/** O site quebra o título do hero em uma span por palavra (para o reveal do
 *  GSAP), e isso afeta o espaçamento — por isso replicamos a estrutura. */
function HeroTitle({ title }: { title: string }) {
  const words = title.trim() ? title.trim().split(/\s+/) : [];
  if (words.length === 0) {
    return <h1 className="ks-display-xl ks-home-hero-title"><em className="ksa-empty">Título principal</em></h1>;
  }
  return (
    <h1 className="ks-display-xl ks-home-hero-title">
      {words.map((word, index) => (
        <span className="ks-home-hero-word-wrap" key={`${word}-${index}`}>
          <span className="ks-home-hero-word">{word}</span>
        </span>
      ))}
    </h1>
  );
}

function StarBreak({ align, light }: { align: "left" | "right"; light?: boolean }) {
  const assets = ["/assets/brand/star-karina-filled.png", "/assets/brand/star-karina-outline.png"];
  return (
    <div className={`ks-section-star-break ks-section-star-break-${align}${light ? " ks-section-star-break-light" : ""}`} aria-hidden="true">
      <div className="ks-section-star-break-field">
        {[0, 1, 0, 1].map((asset, index) => (
          <img key={index} className={`ks-section-star-break-star star-${index + 1}`} src={assets[asset]} alt="" />
        ))}
      </div>
    </div>
  );
}

export function HomePreview({ value }: { value: HomeDocument }) {
  const steps = [...(value.processSteps ?? [])].filter((step) => step.active).sort((a, b) => a.order - b.order);
  const services = activeSorted(value.serviceCards);
  const collections = activeSorted(value.collectionCards);

  return (
    <SitePreviewFrame>
      {/* Cromo presente em todas as páginas do site: grão, cabeçalho fixo e o
          botão flutuante de WhatsApp. Não é editável, entra só por fidelidade. */}
      <div className="ks-grain" aria-hidden="true" />
      <header className="ks-header">
        <span className="ks-logo"><StarGlyph size={8} color="#2E173A" /> Karina Sarte</span>
        <nav className="ks-desktop-nav">
          {NAV_LINKS.map((label, index) => (
            <a key={label} className={`ks-nav-item${index === 0 ? " active" : ""}`}>{label}</a>
          ))}
          <a className="ks-nav-cta">Quero um orçamento</a>
        </nav>
      </header>

      <div className="ks-route-content">
        <div className="ks-home-flow">
          <section className="ks-home-hero">
            {value.heroImageUrl ? <img className="ks-home-hero-bg" src={value.heroImageUrl} alt="" aria-hidden="true" /> : null}
            <img className="ks-home-hero-eye" src="/assets/brand/eye-purple.png" alt="" aria-hidden="true" />
            <div className="ks-home-hero-content">
              <span className="ks-label-caps"><Filled value={value.heroEyebrow} fallback="texto superior" /></span>
              <HeroTitle title={String(value.heroTitle ?? "")} />
              <p className="ks-body-lg"><Filled value={value.heroText} fallback="Texto de apoio do hero" /></p>
              {/* PrimaryLink/TextLink do site incluem uma seta; sem ela a
                  largura do botão não bate com a do site. */}
              <div className="ks-actions">
                <a className="ks-primary-link"><Filled value={value.heroButton} fallback="Botão principal" /><ArrowRight size={16} /></a>
                {value.heroSecondaryButton ? <a className="ks-text-link">{value.heroSecondaryButton}<ArrowRight size={14} /></a> : null}
              </div>
            </div>
          </section>

          <StarBreak align="right" />

          <section className="ks-editorial-split">
            <div className="ks-editorial-split-text">
              <span className="ks-label-caps ks-gold"><Filled value={value.processEyebrow} fallback="processo criativo" /></span>
              <h2 className="ks-headline-lg"><Filled value={value.processTitle} fallback="Título do processo criativo" /></h2>
              <p className="ks-body-lg ks-muted"><Filled value={value.processText} fallback="Texto do processo criativo" /></p>
              {steps.length > 0 ? (
                <div className="ks-editorial-process" aria-label="Fluxo de criação">
                  {steps.map((step) => <span key={step.id}>{step.label}</span>)}
                </div>
              ) : null}
              <a className="ks-primary-link"><Filled value={value.processButton} fallback="Botão" /><ArrowRight size={16} /></a>
            </div>
            <div className="ks-editorial-split-media">
              {value.processImageUrl ? <img src={value.processImageUrl} alt="" /> : null}
            </div>
          </section>

          <StarBreak align="right" light />

          <section className="ks-services-section">
            <div className="ks-section-title">
              <span className="ks-label-caps ks-gold"><Filled value={value.servicesEyebrow} fallback="serviços" /></span>
              <h2 className="ks-headline-lg"><Filled value={value.servicesTitle} fallback="Título dos serviços" /></h2>
              <p className="ks-body-lg ks-muted"><Filled value={value.servicesText} fallback="Texto dos serviços" /></p>
            </div>
            <div className="ks-services-grid">
              {services.map((card, index) => (
                <div className="ks-service-grid-item" key={card.id}>
                  <a className="ks-service-card">
                    <div className="ks-service-card-media">
                      <div className="ks-window-portal">
                        <div className="ks-numbered-placeholder" aria-hidden="true"><span>{pad(index)}</span></div>
                      </div>
                    </div>
                    <div className="ks-service-card-body">
                      <h3>{card.title}</h3>
                      <p>{card.text}</p>
                      <span className="ks-service-card-link">{card.cta}</span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </section>

          <StarBreak align="left" light />

          <section className="ks-mural-section">
            <div className="ks-section-title">
              <span className="ks-label-caps ks-gold"><Filled value={value.portfolioEyebrow} fallback="portfólio" /></span>
              <h2 className="ks-headline-lg"><Filled value={value.portfolioTitle} fallback="Título do portfólio" /></h2>
              <p className="ks-body-lg ks-muted"><Filled value={value.portfolioText} fallback="Texto do portfólio" /></p>
            </div>
            <div className="ks-mural-grid">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div className={`ks-mural-item ${index === 0 ? "ks-mural-item-featured" : "ks-mural-item-image"}`} key={index}>
                  <a className="ks-mural-item-link">
                    <div className="ks-mural-item-media">
                      <div className="ks-numbered-placeholder" aria-hidden="true"><span>{pad(index + 1)}</span></div>
                    </div>
                    <div className="ks-mural-item-caption">
                      <span>{value.portfolioMode === "manual" ? "Seleção manual" : "Seleção automática"}</span>
                      <strong>Trabalho {pad(index + 1)}</strong>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </section>

          <StarBreak align="right" />

          <section className="ks-section ks-products-preview ks-section-cream">
            <div className="ks-products-header">
              <span className="ks-label-caps ks-gold"><Filled value={value.collectionsEyebrow} fallback="coleções" /></span>
              <h2 className="ks-headline-lg"><Filled value={value.collectionsTitle} fallback="Título das coleções" /></h2>
              <p className="ks-body-lg ks-muted" style={{ marginTop: 16, maxWidth: 640 }}>
                <Filled value={value.collectionsText} fallback="Texto das coleções" />
              </p>
            </div>
            <div className="ks-products-grid">
              {collections.map((card, index) => (
                <a className="ks-product-visual-card" key={card.id}>
                  <div className="ks-numbered-placeholder" aria-hidden="true"><span>{pad(index + 1)}</span></div>
                  <div className="ks-product-visual-overlay">
                    <span className="ks-label-caps">{pad(index + 1)}</span>
                    <h3>{card.title}</h3>
                    <p className="ks-product-visual-hover-text">{card.text}</p>
                    <span className="ks-product-visual-cta">{card.cta}</span>
                  </div>
                </a>
              ))}
            </div>
            <div className="ks-center-action" style={{ marginTop: "clamp(28px, 4vw, 48px)" }}>
              <span className="ks-primary-link special"><Filled value={value.collectionsButton} fallback="Botão" /><ArrowRight size={16} /></span>
            </div>
          </section>

          <StarBreak align="left" />

          {value.youtubeActive ? (
            <section className="ks-youtube-feature">
              <div className="ks-youtube-feature-grid">
                <div className="ks-youtube-feature-content">
                  <span className="ks-label-caps ks-gold"><Filled value={value.youtubeEyebrow} fallback="youtube" /></span>
                  <h2 className="ks-headline-lg ks-youtube-feature-title">
                    <span><Filled value={value.youtubeTitle} fallback="Título do YouTube" /></span>
                  </h2>
                  <p className="ks-body-lg ks-muted"><Filled value={value.youtubeText} fallback="Texto do YouTube" /></p>
                  {/* No site o ícone vem antes do texto neste botão. */}
                  <a className="ks-primary-link ks-youtube-feature-cta"><Play size={16} fill="currentColor" /><Filled value={value.youtubeButton} fallback="Botão" /></a>
                  <span className="ks-youtube-feature-meta">{value.youtubeMeta}</span>
                </div>
                <div className="ks-youtube-feature-media">
                  <a className="ks-youtube-feature-thumb">
                    {value.youtubeThumbUrl ? <img src={value.youtubeThumbUrl} alt="" /> : null}
                    <span>Assistir no YouTube <ArrowRight size={15} /></span>
                  </a>
                </div>
              </div>
            </section>
          ) : null}

          <section className="ks-cta-band">
            <img className="ks-cta-band-artwork" src="/assets/brand/eye-heart.png" alt="" aria-hidden="true" />
            <h2 className="ks-headline-md"><Filled value={value.ctaTitle} fallback="Título da chamada final" /></h2>
            <p className="ks-body-lg ks-muted"><Filled value={value.ctaText} fallback="Texto da chamada final" /></p>
            <a className="ks-primary-link"><Filled value={value.ctaButton} fallback="Botão" /><ArrowRight size={16} /></a>
          </section>
        </div>
      </div>
    </SitePreviewFrame>
  );
}
