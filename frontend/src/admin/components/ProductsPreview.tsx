import type { ProductsPageDocument, ProductItem } from "../data/types";
import { SitePreviewFrame } from "./SitePreviewFrame";
import { StarGlyph } from "../../app/components/StarGlyph";
import { ArrowRight } from "lucide-react";

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function ProductsPreview({ doc, items }: { doc: ProductsPageDocument; items: ProductItem[] }) {
  return (
    <SitePreviewFrame>
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
          <a className="ks-nav-cta">Quero um orçamento</a>
        </nav>
      </header>
      
      <main>
        <section className="ks-products-page-hero">
          <div className="ks-products-page-hero-content">
            {doc.heroKicker && <span className="ks-label-caps ks-gold">{doc.heroKicker}</span>}
            <h1 className="ks-display-xl">{doc.heroTitle}</h1>
            {doc.heroText1 && (
              <p className="ks-body-lg ks-muted" style={{ maxWidth: 680, marginTop: 18 }}>
                {doc.heroText1}
              </p>
            )}
            {doc.heroText2 && (
              <p className="ks-body-lg ks-muted" style={{ maxWidth: 720, marginTop: 12 }}>
                {doc.heroText2}
              </p>
            )}
            {doc.heroButton && (
              <a className="ks-primary-link" style={{ marginTop: 28 }}>
                {doc.heroButton} <WhatsAppIcon />
              </a>
            )}
          </div>
          {doc.heroImageUrl && (
            <figure className="ks-products-page-hero-media">
              <img src={doc.heroImageUrl} alt="" loading="eager" />
            </figure>
          )}
        </section>

        <section className="ks-section ks-products-catalog">
          <div className="ks-products-category-grid">
            {items.map((item, index) => (
              <article className="ks-products-category-card" key={item.id}>
                <div className="ks-products-category-media">
                  <div className="ks-numbered-placeholder">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                </div>
                <div className="ks-products-category-body">
                  <span className="ks-label-caps ks-muted">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="ks-headline-md">{item.title || "Coleção sem título"}</h2>
                  <p className="ks-body-md ks-muted">{item.description}</p>
                  <span className="ks-products-category-cta">
                    Consultar <ArrowRight size={14} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ks-section ks-surface-band">
          <header className="ks-section-title">
            <span className="ks-label-caps ks-gold">Como comprar</span>
            <h2 className="ks-display-sm">Consulta simples pelo WhatsApp</h2>
            <p className="ks-body-lg ks-muted">Minha vitrine funciona como catálogo comercial, sem carrinho ou checkout nesta fase.</p>
          </header>
          <div className="ks-step-grid">
            {["Escolha o produto ou plano", "Chame no WhatsApp", "Confirme disponibilidade", "Finalize a compra"].map((step, index) => (
              <article className="ks-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step}</h3>
                <p>Te oriento sobre valores, prazos, tamanho, disponibilidade e próximos passos.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ks-section">
          <header className="ks-section-title">
            <span className="ks-label-caps ks-gold">FAQ</span>
            <h2 className="ks-display-sm">FAQ rápido sobre produtos</h2>
            <p className="ks-body-lg ks-muted">Informações essenciais para consulta, reserva e atendimento.</p>
          </header>
          <div className="ks-faq-list">
            {[
              ["Qual é o prazo de entrega?", "O envio das artes exclusivas ocorre após o pagamento e o prazo..."],
              ["Vocês enviam para todo o Brasil?", "Para produtos físicos, enviamos para todo o território nacional..."],
              ["Como funciona a reserva do Flash?", "O sinal garante a reserva. Sem ele, a arte pode ser disponibilizada..."]
            ].map(([q, a], i) => (
              <div key={q} className="ks-faq-item">
                <button className="ks-faq-question" aria-expanded={false}>
                  <span>{q}</span>
                  <span className="ks-faq-icon">+</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="ks-cta-band">
          <div className="ks-cta-band-content">
            <h2 className="ks-headline-lg">{doc.ctaTitle}</h2>
            <p className="ks-body-lg">{doc.ctaText}</p>
            <a className="ks-primary-link">
              {doc.ctaButton} <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>
    </SitePreviewFrame>
  );
}
