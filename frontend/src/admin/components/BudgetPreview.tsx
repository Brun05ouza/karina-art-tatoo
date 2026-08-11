import { HeartHandshake } from "lucide-react";
import { useEffect, useRef } from "react";
import { BrandStar } from "../../app/components/BrandStar";
import { StarGlyph } from "../../app/components/StarGlyph";
import type { BudgetPageDocument } from "../data/types";
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

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function BudgetPreview({ doc, editor }: { doc: BudgetPageDocument; editor?: VisualEditorPreviewTools }) {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const steps = [
    { title: doc.stepOneTitle, text: doc.stepOneText },
    { title: doc.stepTwoTitle, text: doc.stepTwoText },
    { title: doc.stepThreeTitle, text: doc.stepThreeText },
  ];

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
          <a className="ks-nav-item">Portfólio</a>
          <a className="ks-nav-item">Reformulações</a>
          <a className="ks-nav-item">Flash Tattoos</a>
          <a className="ks-nav-item">Produtos</a>
          <a className="ks-nav-cta active">Quero um orçamento</a>
        </nav>
      </header>

      <section ref={bindSection("Hero")} className={editableClass("ks-page-hero", "Hero", editor)} style={{ backgroundImage: `url(${doc.heroImageUrl})` }}>
        <EditButton section="Hero" editor={editor} />
        <div className="ks-page-hero-content">
          <span className="ks-label-caps ks-gold">{doc.heroKicker}</span>
          <h1 className="ks-display-xl">{doc.heroTitle}</h1>
          <p className="ks-body-lg">{doc.heroText}</p>
        </div>
      </section>

      <section ref={bindSection("Briefing")} className={editableClass("ks-section ks-budget-section", "Briefing", editor)}>
        <EditButton section="Briefing" editor={editor} />
        <div className="ks-budget-intro">
          <BrandStar variant={3} size={126} className="ks-budget-intro-star" />
          <span className="ks-label-caps ks-gold">{doc.introEyebrow}</span>
          <h2 className="ks-headline-md">{doc.introTitle}</h2>
          <p className="ks-body-lg ks-muted">{doc.introText}</p>
          <div className="ks-budget-flow">
            {steps.map((step, index) => (
              <article key={`${step.title}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <form ref={bindSection("Formulário")} className={editableClass("ks-budget-form", "Formulário", editor)}>
          <EditButton section="Formulário" editor={editor} />
          <div className="ks-budget-form-header">
            <span className="ks-budget-form-icon"><HeartHandshake size={20} /></span>
            <div>
              <span className="ks-label-caps ks-gold">{doc.formEyebrow}</span>
              <h3>{doc.formTitle}</h3>
            </div>
          </div>

          <div className="ks-budget-fields">
            <label className="ks-budget-field">
              <span className="ks-budget-label">Nome</span>
              <input className="ks-budget-input" placeholder="Seu nome" readOnly />
            </label>
            <label className="ks-budget-field">
              <span className="ks-budget-label">WhatsApp</span>
              <input className="ks-budget-input" placeholder="(21) 99999-9999" readOnly />
            </label>
            <label className="ks-budget-field is-full">
              <span className="ks-budget-label">Ideia da tattoo</span>
              <textarea className="ks-budget-textarea" rows={4} placeholder="Ex.: quero uma tattoo botânica delicada..." readOnly />
            </label>
            <label className="ks-budget-field">
              <span className="ks-budget-label">Local do corpo</span>
              <input className="ks-budget-input" placeholder="Braço, costela, costas..." readOnly />
            </label>
            <label className="ks-budget-field">
              <span className="ks-budget-label">Tamanho aproximado</span>
              <input className="ks-budget-input" placeholder="Ex.: 8 cm, palma da mão..." readOnly />
            </label>
          </div>

          <div className="ks-budget-submit-row">
            <p>{doc.submitHelper}</p>
            <span className="ks-primary-link">{doc.submitButton} <WhatsAppIcon /></span>
          </div>
        </form>
      </section>
    </SitePreviewFrame>
  );
}
