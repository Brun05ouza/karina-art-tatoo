import type { FlashPageDocument, FlashTattoo } from "../data/types";
import { PreviewHeroStars } from "./PreviewParts";
import { SitePreviewFrame } from "./SitePreviewFrame";
import { StarGlyph } from "../../app/components/StarGlyph";
import { StencilCrosshair } from "../../app/components/StencilCrosshair";

/**
 * Prévia da página /flash-tattoos.
 *
 * O markup e as classes vêm de FlashPage/FlashCard/PageHero em
 * frontend/src/app/App.tsx, e o CSS é o próprio kah-sarte.css (ver
 * SitePreviewFrame). Ao mudar a página real, replique aqui.
 *
 * Diferença deliberada: no site publicado hoje, FlashCard recebe a foto do
 * flash mas nunca a exibe — mostra sempre um número no lugar dela. Aqui a
 * prévia mostra a foto de fato quando cadastrada, porque isso é o que faz
 * sentido para quem está cadastrando a imagem no admin. A página pública
 * ainda precisa desse ajuste para acompanhar (fora deste pedido).
 */

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function FlashTattoosPreview({ doc, items }: { doc: FlashPageDocument; items: FlashTattoo[] }) {
  // Mesma regra de publicação das outras prévias.
  const flashes = items
    .filter((item) => item.active && item.status !== "Oculto")
    .sort((a, b) => a.order - b.order);

  return (
    <SitePreviewFrame>
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

      <div className="ks-route-content">
        <section className={`ks-page-hero${!doc.heroImageUrl ? " ks-page-hero-no-image" : ""}`}>
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

        <section className="ks-section">
          {flashes.length > 0 ? (
            <div className="ks-flash-page-grid">
              {flashes.map((item, index) => (
                <article className="ks-flash-page-card" key={item.id}>
                  {item.imageUrl ? (
                    <div className="ks-flash-page-card-media">
                      <img src={item.imageUrl} alt={item.title} loading="lazy" />
                    </div>
                  ) : (
                    <div className="ks-flash-page-card-media">
                      <div className="ks-numbered-placeholder" aria-hidden="true">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      </div>
                    </div>
                  )}
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
