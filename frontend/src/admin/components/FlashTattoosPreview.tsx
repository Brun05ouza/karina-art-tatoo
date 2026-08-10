import { useEffect, useRef } from "react";
import type { FlashPageDocument, FlashTattoo } from "../data/types";
import { PreviewHeroStars } from "./PreviewParts";
import { SitePreviewFrame } from "./SitePreviewFrame";
import { StarGlyph } from "../../app/components/StarGlyph";
import { StencilCrosshair } from "../../app/components/StencilCrosshair";
import type { VisualEditorPreviewTools } from "./VisualDocumentEditor";

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function editableClass(base: string, section: string, editor?: VisualEditorPreviewTools) {
  if (!editor) return base;
  return `${base} ksa-editable-section${editor.activeSection === section ? " is-active" : ""}`;
}

function EditButton({ section, editor }: { section: string; editor?: VisualEditorPreviewTools }) {
  if (!editor) return null;
  return <button type="button" className="ksa-preview-edit-button" onClick={() => editor.onSelectSection(section)}>Editar {section}</button>;
}

export function FlashTattoosPreview({
  doc,
  items,
  editor,
}: {
  doc: FlashPageDocument;
  items: FlashTattoo[];
  editor?: VisualEditorPreviewTools;
}) {
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

  const flashes = items
    .filter((item) => item.active && item.status !== "Oculto")
    .sort((a, b) => a.order - b.order);

  return (
    <SitePreviewFrame clickToActivate={Boolean(editor)}>
      <div className="ks-grain" aria-hidden="true" />
      <header className="ks-header">
        <a className="ks-logo">
          <StarGlyph size={8} color="#2E173A" />
          <span>Karina Sarte</span>
        </a>
        <nav className="ks-desktop-nav">
          <a className="ks-nav-item">Início</a>
          <a className="ks-nav-item">Sobre</a>
          <a className="ks-nav-item">Portfólio</a>
          <a className="ks-nav-item">Reformulações</a>
          <a className="ks-nav-item active">Flash Tattoos</a>
          <a className="ks-nav-cta">Quero um orçamento</a>
        </nav>
      </header>

      <div className="ks-page-sections ks-page-sections-flash-tattoos">
        <section ref={bindSection("Hero")} className={editableClass(`ks-page-hero${!doc.heroImageUrl ? " ks-page-hero-no-image" : ""}`, "Hero", editor)}>
          <EditButton section="Hero" editor={editor} />
          {doc.heroImageUrl ? <img className="ks-page-hero-image" src={doc.heroImageUrl} alt="" aria-hidden="true" loading="eager" /> : null}
          {doc.heroImageUrl ? <div className="ks-page-hero-shade" aria-hidden="true" /> : null}
          <PreviewHeroStars />
          <div className="ks-page-hero-content">
            {doc.heroKicker ? <span className="ks-label-caps ks-muted">{doc.heroKicker}</span> : null}
            <h1 className="ks-display-xl">{doc.heroTitle}</h1>
            <p className="ks-body-lg">{doc.heroText}</p>
          </div>
        </section>

        <section ref={bindSection("Catálogo")} className={editableClass("ks-section", "Catálogo", editor)}>
          <EditButton section="Catálogo" editor={editor} />
          {flashes.length > 0 ? (
            <div className="ks-flash-page-grid">
              {flashes.map((item, index) => (
                <article className="ks-flash-page-card" key={item.id}>
                  <div className="ks-flash-page-card-media">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} loading={index < 2 ? "eager" : "lazy"} />
                    ) : (
                      <div className="ks-numbered-placeholder" aria-hidden="true">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      </div>
                    )}
                  </div>
                  <div className="ks-flash-page-card-body">
                    <StencilCrosshair size={14} color="#806E85" />
                    <span className={`ks-status ${(item.status || "Disponível").toLowerCase()}`}>
                      {item.status || "Disponível"}
                    </span>
                    <h3>{item.title || "Flash sem nome"}</h3>
                    <p>{item.description}</p>
                    <a className="ks-primary-link">Quero esse flash <WhatsAppIcon /></a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="ks-body-lg ks-muted" style={{ textAlign: "center" }} role="status">
              Nenhum flash disponível publicado ainda.
            </p>
          )}
        </section>
      </div>
    </SitePreviewFrame>
  );
}
