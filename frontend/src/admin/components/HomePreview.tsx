import { ArrowRight, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HoverProcessMedia } from "../../app/components/HoverProcessMedia";
import { StarGlyph } from "../../app/components/StarGlyph";
// Módulo compartilhado com o site: a prévia consulta a mesma coleção salva no
// banco, sem importar o App.tsx (que traria GSAP e Lenis).
import { usePortfolioItems, type PortfolioWork } from "../../app/portfolio-works";
import type { HomeCard, HomeDocument } from "../data/types";
import { SitePreviewFrame } from "./SitePreviewFrame";
import type { VisualEditorPreviewTools } from "./VisualDocumentEditor";

/** Mesmos itens de app/components/Header.tsx. */
const NAV_LINKS = ["Início", "Sobre", "Portfólio", "Reformulações", "Flash Tattoos", "Produtos"];

/** Poster do vídeo de processo do primeiro card de Serviços, igual ao site. */
const PROCESS_POSTER_URL = "/assets/process/art-process-poster.jpg";
const SERVICE_CARD_IMAGES: Record<string, string> = {
  "service-1": PROCESS_POSTER_URL,
  "service-2": "/assets/hero-home.png",
  "service-3": "/assets/hero-home.png",
  "service-4": PROCESS_POSTER_URL,
};

function serviceImage(card: HomeCard) {
  return card.imageUrl ?? SERVICE_CARD_IMAGES[card.id] ?? "";
}

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
 */

/** Marca campo vazio sem deixar buraco. A classe é declarada dentro do iframe. */
function Filled({ value, fallback }: { value: unknown; fallback: string }) {
  const text = value == null ? "" : String(value).trim();
  if (text) return <>{text}</>;
  return <em className="ksa-empty">{fallback}</em>;
}

function editableClass(base: string, section: string, editor?: VisualEditorPreviewTools) {
  if (!editor) return base;
  return `${base} ksa-editable-section${editor.activeSection === section ? " is-active" : ""}`;
}

function EditButton({ section, editor }: { section: string; editor?: VisualEditorPreviewTools }) {
  if (!editor) return null;
  return <button type="button" className="ksa-preview-edit-button" onClick={() => editor.onSelectSection(section)}>Editar {section}</button>;
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

export function HomePreview({ value, editor }: { value: HomeDocument; editor?: VisualEditorPreviewTools }) {
  const trailerRef = useRef<HTMLVideoElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [soundEnabled, setSoundEnabled] = useState(false);
  const portfolioItems = usePortfolioItems(false);

  const bindSection = (section: string) => (node: HTMLElement | null) => {
    sectionRefs.current[section] = node;
  };

  useEffect(() => {
    if (!editor?.activeSection) return;

    const frame = window.requestAnimationFrame(() => {
      sectionRefs.current[editor.activeSection]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [editor?.activeSection, editor?.focusToken]);

  const toggleTrailerSound = () => {
    const nextSoundEnabled = !soundEnabled;
    setSoundEnabled(nextSoundEnabled);

    if (trailerRef.current) {
      trailerRef.current.muted = !nextSoundEnabled;
      if (nextSoundEnabled) void trailerRef.current.play();
    }
  };

  const steps = [...(value.processSteps ?? [])].filter((step) => step.active).sort((a, b) => a.order - b.order);
  const services = activeSorted(value.serviceCards);
  const collections = activeSorted(value.collectionCards);
  const manualPortfolioItems = (value.portfolioIds ?? [])
    .map((id) => portfolioItems.find((item) => item.id === id))
    .filter((item): item is PortfolioWork => Boolean(item));
  const automaticPortfolioItems = portfolioItems.filter((item) => item.featured);
  const displayedPortfolioItems = (value.portfolioMode === "manual" ? manualPortfolioItems : automaticPortfolioItems).slice(0, 6);

  return (
    <SitePreviewFrame clickToActivate={Boolean(editor)}>
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
          <section ref={bindSection("Hero")} className={editableClass("ks-home-hero", "Hero", editor)}>
            <EditButton section="Hero" editor={editor} />
            {value.heroImageUrl ? <img className="ks-home-hero-bg" src={value.heroImageUrl} alt="" aria-hidden="true" /> : null}
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

          <section ref={bindSection("Processo criativo")} className={editableClass("ks-editorial-split", "Processo criativo", editor)}>
            <EditButton section="Processo criativo" editor={editor} />
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
              {/* A janela com o retrato mora dentro do bloco da foto, igual ao
                  site: no desktop ela fica centrada na divisória, no mobile no
                  canto inferior da foto. */}
              <div className="ks-editorial-split-portal" aria-hidden="true">
                <div className="ks-editorial-split-portal-card">
                  <div className="ks-window-portal">
                    {value.processPortraitUrl ? <img src={value.processPortraitUrl} alt="" /> : null}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <StarBreak align="right" light />

          <section ref={bindSection("Serviços")} className={editableClass("ks-services-section", "Serviços", editor)}>
            <EditButton section="Serviços" editor={editor} />
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
                        {/* Igual ao site: o primeiro card traz o vídeo de processo
                            (poster + dica de hover) e os seguintes são numerados
                            a partir de 01. A mídia do card ainda não é editável
                            no painel, então a regra é espelhada daqui. */}
                        {serviceImage(card) && index === 0 ? (
                          <div className="ks-hover-process-media">
                            <img className="ks-hover-process-poster" src={serviceImage(card)} alt={card.title} draggable="false" />
                            <span className="ks-hover-process-hint">Ver processo</span>
                          </div>
                        ) : serviceImage(card) ? (
                          <img src={serviceImage(card)} alt={card.title} draggable="false" />
                        ) : (
                          <div className="ks-numbered-placeholder" aria-hidden="true"><span>{pad(index)}</span></div>
                        )}
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

          <section ref={bindSection("Portfólio")} className={editableClass("ks-mural-section", "Portfólio", editor)}>
            <EditButton section="Portfólio" editor={editor} />
            <div className="ks-section-title">
              <span className="ks-label-caps ks-gold"><Filled value={value.portfolioEyebrow} fallback="portfólio" /></span>
              <h2 className="ks-headline-lg"><Filled value={value.portfolioTitle} fallback="Título do portfólio" /></h2>
              <p className="ks-body-lg ks-muted"><Filled value={value.portfolioText} fallback="Texto do portfólio" /></p>
            </div>
            {/* Mesma seleção da home publicada: dados do banco, modo automático
                por destaque ou a ordem escolhida manualmente. */}
            <div className="ks-mural-grid">
              {displayedPortfolioItems.map((work) => (
                <div className={`ks-mural-item ${"processVideo" in work && work.processVideo ? "ks-mural-item-featured" : "ks-mural-item-image"}`} key={work.id || work.title}>
                  <a className="ks-mural-item-link">
                    <div className="ks-mural-item-media">
                      {"processVideo" in work && work.processVideo ? (
                        <HoverProcessMedia poster={work.processVideo.poster} videoSrc={work.processVideo.src} alt={work.alt} loading="lazy" />
                      ) : (
                        <img src={work.img} alt={work.alt} loading="lazy" />
                      )}
                    </div>
                    <div className="ks-mural-item-caption">
                      <span>{work.label}</span>
                      <strong>{work.title}</strong>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </section>

          <StarBreak align="right" />

          <section ref={bindSection("Coleções")} className={editableClass("ks-section ks-products-preview ks-section-cream", "Coleções", editor)}>
            <EditButton section="Coleções" editor={editor} />
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
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="ks-numbered-placeholder" aria-hidden="true"><span>{pad(index + 1)}</span></div>
                  )}
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
            <section ref={bindSection("YouTube")} className={editableClass("ks-youtube-feature", "YouTube", editor)}>
              <EditButton section="YouTube" editor={editor} />
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

                  {value.youtubeTrailerUrl ? (
                    <div className="ks-youtube-feature-trailer">
                      <div className="ks-youtube-feature-trailer-meta" aria-hidden="true">
                        <span>Trailer</span>
                        <span>00:17</span>
                      </div>
                      <video
                        ref={trailerRef}
                        autoPlay
                        muted={!soundEnabled}
                        loop
                        playsInline
                        preload="metadata"
                        poster={value.youtubeThumbUrl}
                        aria-label="Trailer vertical do primeiro Tattoo Vlog da Karina Sarte"
                      >
                        <source src={value.youtubeTrailerUrl} type="video/mp4" />
                      </video>
                      <button
                        type="button"
                        className="ks-youtube-feature-sound"
                        onClick={toggleTrailerSound}
                        aria-pressed={soundEnabled}
                        aria-label={soundEnabled ? "Desativar som do trailer" : "Ativar som do trailer"}
                      >
                        {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                        <span>{soundEnabled ? "Som ativado" : "Ativar som"}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          <section ref={bindSection("Chamada final")} className={editableClass("ks-cta-band", "Chamada final", editor)}>
            <EditButton section="Chamada final" editor={editor} />
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
