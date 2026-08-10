import { ArrowRight, HeartHandshake } from "lucide-react";
import { useEffect, useRef } from "react";
import { StarGlyph } from "../../app/components/StarGlyph";
import type { AboutDocument } from "../data/types";
import { SitePreviewFrame } from "./SitePreviewFrame";
import type { VisualEditorPreviewTools } from "./VisualDocumentEditor";

const NAV_LINKS = ["Início", "Sobre", "Portfólio", "Reformulações", "Flash Tattoos", "Produtos"];

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

function activeCards(cards: AboutDocument["approachCards"]) {
  return [...(cards ?? [])].filter((card) => card.active).sort((a, b) => a.order - b.order);
}

export function AboutPreview({ value, editor }: { value: AboutDocument; editor?: VisualEditorPreviewTools }) {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

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

  const approachCards = activeCards(value.approachCards);

  return (
    <SitePreviewFrame clickToActivate={Boolean(editor)}>
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
        <section ref={bindSection("Abertura")} className={editableClass(`ks-page-hero${value.heroImageUrl ? "" : " ks-page-hero-no-image"}`, "Abertura", editor)}>
          <EditButton section="Abertura" editor={editor} />
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
            <div className="ks-page-hero-image" aria-hidden="true" />
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

        <section ref={bindSection("Biografia")} className={editableClass("ks-section ks-two-col ks-section-cream ks-about-main", "Biografia", editor)}>
          <EditButton section="Biografia" editor={editor} />
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
            <a className="ks-primary-link" style={{ marginTop: "2rem" }}>Quero criar minha tattoo <ArrowRight size={16} /></a>
          </div>
        </section>

        {(editor || value.behindScenesImageUrl) ? (
          <section ref={bindSection("Bastidores")} className={editableClass("ks-section ks-about-behind-scenes", "Bastidores", editor)}>
            <EditButton section="Bastidores" editor={editor} />
            <figure className="ks-about-behind-scenes-frame">
              {value.behindScenesImageUrl ? (
                <img src={value.behindScenesImageUrl} alt="" loading="lazy" />
              ) : (
                <div className="ks-about-behind-scenes-placeholder" aria-hidden="true">
                  <img src="/assets/brand/star-karina-filled.png" alt="" />
                  <img src="/assets/brand/star-karina-outline.png" alt="" />
                </div>
              )}
              <figcaption><Filled value={value.behindScenesCaption} fallback="Uma legenda descontraída aqui." /></figcaption>
            </figure>
          </section>
        ) : null}

        <section ref={bindSection("Abordagem")} className={editableClass("ks-section ks-surface-band", "Abordagem", editor)}>
          <EditButton section="Abordagem" editor={editor} />
          <div className="ks-card-grid three">
            {(approachCards.length ? approachCards : [{ title: "", text: "" }]).map((card, index) => (
              <article className="ks-card" key={index}>
                <HeartHandshake size={18} />
                <h3><Filled value={card.title} fallback="Título" /></h3>
                <p><Filled value={card.text} fallback="Texto explicativo" /></p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </SitePreviewFrame>
  );
}
