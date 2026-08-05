import type { BackstageDocument } from "../data/types";
import { SitePreviewFrame } from "./SitePreviewFrame";
import { StarGlyph } from "../../app/components/StarGlyph";

const NAV_LINKS = ["Início", "Sobre", "Portfólio", "Reformulações", "Flash Tattoos", "Produtos"];

function Filled({ value, fallback }: { value: unknown; fallback: string }) {
  const text = value == null ? "" : String(value).trim();
  if (text) return <>{text}</>;
  return <em className="ksa-empty">{fallback}</em>;
}

export function BastidoresPreview({ value }: { value: BackstageDocument }) {
  if (!value.active) {
    return (
      <SitePreviewFrame>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "2rem", textAlign: "center" }}>
          <p className="ks-muted ks-body-lg">A seção de bastidores está inativa e não será exibida no site.</p>
        </div>
      </SitePreviewFrame>
    );
  }

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
        <section className="ks-page-hero ks-page-hero-no-image">
          <div className="ks-page-hero-content">
            <span className="ks-label-caps ks-muted">
              <Filled value={value.eyebrow} fallback="Processo criativo" />
            </span>
            <h1 className="ks-display-xl">
              <Filled value={value.title} fallback="Bastidores" />
            </h1>
            <p className="ks-body-lg">
              <Filled value={value.intro} fallback="Acompanhe o desenvolvimento." />
            </p>
          </div>
        </section>

        <section className="ks-section">
          <div style={{ margin: "0 auto", maxWidth: "800px" }}>
            <div className="ks-youtube-feature-media" style={{ marginBottom: "2rem" }}>
              {value.videoUrl ? (
                <video
                  src={value.videoUrl}
                  poster={value.videoPoster}
                  controls
                  style={{ width: "100%", borderRadius: "var(--radius-md)" }}
                />
              ) : (
                <div className="ks-numbered-placeholder" aria-hidden="true" style={{ width: "100%", aspectRatio: "16/9", borderRadius: "var(--radius-md)" }}>
                  <span>Nenhum vídeo selecionado</span>
                </div>
              )}
            </div>
            
            <h3 className="ks-headline-md" style={{ marginBottom: "1rem" }}>
              <Filled value={value.processTitle} fallback="O Processo" />
            </h3>
            <p className="ks-body-lg ks-muted" style={{ whiteSpace: "pre-line" }}>
              <Filled value={value.processText} fallback="Descreva aqui o passo a passo..." />
            </p>
          </div>
        </section>
      </div>
    </SitePreviewFrame>
  );
}
