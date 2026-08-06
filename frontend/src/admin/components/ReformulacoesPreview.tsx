import { ArrowRight } from "lucide-react";
import { BrandStar } from "../../app/components/BrandStar";
import { StarGlyph } from "../../app/components/StarGlyph";
import type { ReformulationCard, ReformulationItem, ReformulationsDocument } from "../data/types";
import { PreviewHeroStars, PreviewStarBreak } from "./PreviewParts";
import { SitePreviewFrame } from "./SitePreviewFrame";

/**
 * Prévia da página /reformulacoes.
 *
 * O markup e as classes vêm de ReformulacoesPage em frontend/src/app/App.tsx, e o
 * CSS é o próprio kah-sarte.css (ver SitePreviewFrame). Ao mudar a página real,
 * replique aqui.
 *
 * Recebe as duas fontes de conteúdo da tela: `doc` (os textos das seções) e
 * `items` (os casos antes/depois), ambos no estado em edição — então a prévia
 * reflete cada tecla digitada, antes de salvar.
 *
 * A observação interna de cada caso NÃO é renderizada de propósito: ela existe
 * para uso da Karina e não é publicada.
 */

/** Mesma regra de App.tsx: alterna as duas variantes de estrela por índice. */
const variantePorIndice = (index: number) => (index % 2 === 0 ? 2 : 3) as 2 | 3;

/** Reproduz MiniCard de App.tsx. */
function MiniCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <article className="ks-card">
      <span className="ks-label-caps ks-gold">{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

/** Reproduz ReformulacaoPhoto de App.tsx, incluindo o estado sem foto. */
function Foto({ label, src, index }: { label: "Antes" | "Depois"; src?: string; index: number }) {
  return (
    <figure className="ks-reformulacao-photo">
      <span className="ks-reformulacao-photo-label">{label}</span>
      {src ? (
        <img src={src} alt={`Tattoo ${label.toLowerCase()} da reformulação`} loading="lazy" />
      ) : (
        <div className="ks-reformulacao-photo-placeholder" aria-label={`Espaço para a foto de ${label.toLowerCase()}`}>
          <BrandStar variant={variantePorIndice(index)} size={120} className="ks-reformulacao-photo-star" />
          <span>Adicionar foto</span>
        </div>
      )}
    </figure>
  );
}

/** Cards ativos, na ordem, já com a numeração que a página real deriva do índice. */
const cardsAtivos = (cards: ReformulationCard[]) =>
  [...cards]
    .filter((card) => card.active)
    .sort((a, b) => a.order - b.order)
    .map((card, index) => ({ ...card, number: String(index + 1).padStart(2, "0") }));

export function ReformulacoesPreview({ doc, items }: { doc: ReformulationsDocument; items: ReformulationItem[] }) {
  // Mesma regra de publicação das outras prévias.
  const casos = items
    .filter((item) => item.active && item.status !== "Oculto")
    .sort((a, b) => a.order - b.order);

  const possibilidades = cardsAtivos(doc.possibilityCards);
  const pontos = [...doc.panelPoints].filter((point) => point.active).sort((a, b) => a.order - b.order);

  return (
    <SitePreviewFrame>
      <div className="ks-grain" aria-hidden="true" />
      <header className="ks-header">
        <span className="ks-logo"><StarGlyph size={8} color="#2E173A" /> Karina Sarte</span>
        <nav className="ks-desktop-nav">
          <a className="ks-nav-item">Início</a>
          <a className="ks-nav-item">Sobre</a>
          <a className="ks-nav-item">Portfólio</a>
          <a className="ks-nav-item active">Reformulações</a>
          <a className="ks-nav-item">Flash Tattoos</a>
          <a className="ks-nav-cta">Quero um orçamento</a>
        </nav>
      </header>

      <div className="ks-route-content">
        <div className="ks-page-sections ks-page-sections-reformulacoes">
          <section className="ks-page-hero">
            <img className="ks-page-hero-image" src={doc.heroImageUrl} alt="" aria-hidden="true" loading="eager" />
            <div className="ks-page-hero-shade" aria-hidden="true" />
            <PreviewHeroStars />
            <div className="ks-page-hero-content">
              <span className="ks-label-caps ks-muted">{doc.heroEyebrow}</span>
              <h1 className="ks-display-xl">{doc.heroTitle}</h1>
              <p className="ks-body-lg">{doc.heroText}</p>
              <a className="ks-primary-link">{doc.heroButton}<ArrowRight size={16} /></a>
            </div>
          </section>

          <section className="ks-section ks-section-cream ks-reformulacoes-intro">
            <BrandStar variant={3} size={260} className="ks-reformulacoes-intro-star" />
            <div className="ks-reformulacoes-intro-grid">
              <div className="ks-reformulacoes-intro-heading">
                <span className="ks-label-caps ks-gold">{doc.introEyebrow}</span>
                <h2 className="ks-headline-lg">{doc.introTitle}</h2>
                <p className="ks-body-lg ks-muted">{doc.introText}</p>
              </div>
              <div className="ks-reformulacoes-intro-panel">
                <span className="ks-label-caps">{doc.panelEyebrow}</span>
                <p>{doc.panelTextOne}</p>
                <p>{doc.panelTextTwo}</p>
                <div className="ks-reformulacoes-intro-points" aria-label="Pontos avaliados na reformulação">
                  {pontos.map((ponto) => (
                    <span key={ponto.id}>{ponto.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <PreviewStarBreak align="right" />

          <section className="ks-section ks-reformulacoes-portfolio">
            <div className="ks-section-title">
              <span className="ks-label-caps ks-gold">{doc.portfolioEyebrow}</span>
              <h2 className="ks-headline-lg">{doc.portfolioTitle}</h2>
              <p className="ks-body-lg ks-muted">{doc.portfolioText}</p>
            </div>

            {casos.length > 0 ? (
              <div className="ks-reformulacoes-grid">
                {casos.map((caso, index) => (
                  <article className="ks-reformulacao-case" key={caso.id}>
                    <header className="ks-reformulacao-case-header">
                      <span className="ks-label-caps">{caso.category}</span>
                      <h3>{caso.title || "Caso sem título"}</h3>
                    </header>
                    <div className="ks-reformulacao-compare">
                      <Foto label="Antes" src={caso.beforeImageUrl} index={index} />
                      <span className="ks-reformulacao-arrow" aria-hidden="true">
                        <ArrowRight size={18} />
                      </span>
                      <Foto label="Depois" src={caso.afterImageUrl} index={index} />
                    </div>
                    {/*
                      A página real mostra a mesma nota em todos os casos — os textos de Problema e
                      Solução ainda não são publicados. Mostrá-los aqui faria a prévia prometer algo
                      que o site não exibe.
                    */}
                    {doc.caseNote ? <p className="ks-reformulacao-case-note">{doc.caseNote}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="ks-body-lg ks-muted" style={{ textAlign: "center" }} role="status">
                Nenhum caso publicado ainda.
              </p>
            )}
          </section>

          <PreviewStarBreak align="left" />

          <section className="ks-section ks-surface-band">
            <div className="ks-section-title">
              <span className="ks-label-caps ks-gold">{doc.possibilitiesEyebrow}</span>
              <h2 className="ks-headline-lg">{doc.possibilitiesTitle}</h2>
              <p className="ks-body-lg ks-muted">{doc.possibilitiesText}</p>
            </div>
            <div className="ks-card-grid three">
              {possibilidades.map((card) => (
                <MiniCard key={card.id} number={card.number} title={card.title} text={card.text} />
              ))}
            </div>
          </section>

          <section className="ks-cta-band">
            <h2 className="ks-headline-md">{doc.ctaTitle}</h2>
            <p className="ks-body-lg ks-muted">{doc.ctaText}</p>
            <a className="ks-primary-link">{doc.ctaButton}<ArrowRight size={16} /></a>
          </section>
        </div>
      </div>
    </SitePreviewFrame>
  );
}
