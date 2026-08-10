import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StarGlyph } from "../../app/components/StarGlyph";
import type { PortfolioItem, PortfolioPageDocument } from "../data/types";
import { PreviewHeroStars } from "./PreviewParts";
import { SitePreviewFrame } from "./SitePreviewFrame";
import type { VisualEditorPreviewTools } from "./VisualDocumentEditor";

function editableClass(base: string, section: string, editor?: VisualEditorPreviewTools) {
  if (!editor) return base;
  return `${base} ksa-editable-section${editor.activeSection === section ? " is-active" : ""}`;
}

function EditButton({ section, editor }: { section: string; editor?: VisualEditorPreviewTools }) {
  if (!editor) return null;
  return <button type="button" className="ksa-preview-edit-button" onClick={() => editor.onSelectSection(section)}>Editar {section}</button>;
}

export function PortfolioPreview({ doc, items, editor }: { doc: PortfolioPageDocument; items: PortfolioItem[]; editor?: VisualEditorPreviewTools }) {
  const [activeCategory, setActiveCategory] = useState("Todos");
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

  const publishedItems = items.filter((item) => item.active && item.status !== "Oculto");

  const categories = [
    "Todos",
    ...Array.from(new Set(publishedItems.map((item) => item.category).filter(Boolean))),
  ];

  const filteredItems =
    activeCategory === "Todos"
      ? publishedItems
      : publishedItems.filter((item) => item.category === activeCategory);

  return (
    <SitePreviewFrame clickToActivate={Boolean(editor)}>
      <header className="ks-header">
        <a className="ks-logo">
          <StarGlyph size={8} color="#2E173A" />
          <span>Karina Sarte</span>
        </a>
        <nav className="ks-desktop-nav">
          <a className="ks-nav-item">Início</a>
          <a className="ks-nav-item">Sobre</a>
          <a className="ks-nav-item active">Portfólio</a>
          <a className="ks-nav-item">Reformulações</a>
          <a className="ks-nav-item">Flash Tattoos</a>
          <a className="ks-nav-cta">Quero um orçamento</a>
        </nav>
      </header>

      <div className="ks-route-content">
        <section ref={bindSection("Hero")} className={editableClass(`ks-page-hero${!doc.heroImageUrl ? " ks-page-hero-no-image" : ""}`, "Hero", editor)}>
          <EditButton section="Hero" editor={editor} />
          {doc.heroImageUrl && (
            <img className="ks-page-hero-image" src={doc.heroImageUrl} alt="" aria-hidden="true" loading="eager" />
          )}
          {doc.heroImageUrl && <div className="ks-page-hero-shade" aria-hidden="true" />}
          <PreviewHeroStars />
          <div className="ks-page-hero-content">
            {doc.heroKicker && <span className="ks-label-caps ks-muted">{doc.heroKicker}</span>}
            <h1 className="ks-display-xl">{doc.heroTitle}</h1>
            <p className="ks-body-lg">{doc.heroText}</p>
          </div>
        </section>

        <section ref={bindSection("Trabalhos")} className={editableClass("ks-section", "Trabalhos", editor)}>
          <EditButton section="Trabalhos" editor={editor} />
          <div className="ks-filter-row">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredItems.length > 0 ? (
            <div className="ks-image-grid">
              {filteredItems.map((item, index) => (
                <article className="ks-image-card" key={item.id}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} loading={index < 2 ? "eager" : "lazy"} />
                  ) : (
                    <div className="ks-numbered-placeholder"><span>{String(item.order).padStart(2, "0")}</span></div>
                  )}
                  <img
                    className="ks-brand-star ks-brand-star-light ks-card-starfield"
                    src="/assets/brand/star-karina-outline.png"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                  <div className="ks-image-card-overlay">
                    <span className="ks-label-caps">{item.category}</span>
                    <h3>{item.title || "Trabalho sem título"}</h3>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="ks-body-lg ks-muted" style={{ textAlign: "center" }} role="status">
              Ainda não há trabalhos publicados nesta categoria.
            </p>
          )}

          <section className="ks-cta-band">
            <h2 className="ks-headline-md">Gostei desse estilo, quero um orçamento</h2>
            <p className="ks-body-lg ks-muted">Envie sua ideia e referências para construirmos uma proposta personalizada.</p>
            <a className="ks-primary-link">Quero um orçamento <ArrowRight size={16} /></a>
          </section>
        </section>
      </div>
    </SitePreviewFrame>
  );
}
