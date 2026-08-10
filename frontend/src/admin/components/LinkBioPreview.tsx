import { ArrowRight, Images, LinkIcon, ShoppingBag, Sparkles, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import fontsCss from "../../styles/fonts.css?inline";
import siteCss from "../../styles/kah-sarte.css?inline";
import type { LinkBioDocument, LinkButton } from "../data/types";

const FRAME_DOC = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>
${fontsCss}
${siteCss}
html, body { height: 720px; margin: 0; overflow: hidden; width: 390px; }
a { pointer-events: none; }
.ks-link-bio-page { min-height: 720px; width: 390px; }
</style>
</head><body></body></html>`;

export function LinkBioPreview({ value }: { value: LinkBioDocument }) {
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    return () => setBody(null);
  }, []);

  return (
    <div className="ksa-link-bio-preview">
      <iframe
        title="Prévia da bio"
        srcDoc={FRAME_DOC}
        onLoad={(event) => setBody(event.currentTarget.contentDocument?.body ?? null)}
      />
      {body ? createPortal(<LinkBioPreviewBody value={value} />, body) : null}
    </div>
  );
}

function LinkBioPreviewBody({ value }: { value: LinkBioDocument }) {
  const buttons = [...value.buttons].filter((item) => item.active).sort((a, b) => a.order - b.order);
  const backgroundStyle = {
    "--ks-link-bio-background": `url("${value.backgroundUrl || "/assets/link-bio/background.jpg"}")`,
  } as Record<string, string>;

  return (
    <section className="ks-link-bio-page" style={backgroundStyle}>
      <img className="ks-link-bio-star star-1" src="/assets/brand/star-karina-filled.png" alt="" aria-hidden="true" />
      <img className="ks-link-bio-star star-2" src="/assets/brand/star-karina-outline.png" alt="" aria-hidden="true" />
      <img className="ks-link-bio-star star-3" src="/assets/brand/star-karina-filled.png" alt="" aria-hidden="true" />
      <div className="ks-link-bio-card">
        <div className="ks-link-bio-profile">
          <div className="ks-link-bio-avatar-wrap">
            <img className="ks-link-bio-avatar" src={value.avatarUrl} alt="" />
          </div>
          <span className="ks-label-caps">{value.eyebrow}</span>
          <h1>{value.name}</h1>
          <p>{value.bio}</p>
        </div>
        <div className="ks-link-bio-links">
          {buttons.map((button, index) => (
            <span className={`ks-link-bio-action${index === 0 ? " is-primary" : ""}`} key={button.id}>
              <span className="ks-link-bio-action-icon">{iconFor(button.icon)}</span>
              <span>{button.label}</span>
              <ArrowRight size={16} />
            </span>
          ))}
        </div>
        {value.footerLabel ? (
          <span className="ks-link-bio-site-link">
            {value.footerLabel} <ArrowRight size={14} />
          </span>
        ) : null}
      </div>
    </section>
  );
}

function iconFor(icon: string) {
  const normalized = icon.toLowerCase();
  if (normalized.includes("whatsapp") || normalized.includes("message") || normalized.includes("zap")) return <WhatsAppGlyph />;
  if (normalized.includes("tiktok")) return <TikTokGlyph />;
  if (normalized.includes("youtube")) return <Youtube size={18} />;
  if (normalized.includes("image")) return <Images size={18} />;
  if (normalized.includes("spark")) return <Sparkles size={18} />;
  if (normalized.includes("shop")) return <ShoppingBag size={18} />;
  return <LinkIcon size={18} />;
}

function TikTokGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 3c.35 2.4 1.75 4.05 4.05 4.2v3.25c-1.34.13-2.52-.3-3.98-1.18v6.08c0 7.72-8.42 10.14-11.8 4.6-2.17-3.56-.84-9.8 6.12-10.05v3.43c-.44.07-.91.18-1.34.33-1.29.44-2.02 1.26-1.82 2.7.39 2.76 5.45 3.57 5.03-1.82V3h3.74Z" />
    </svg>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.522 5.851L.054 23.25a.75.75 0 0 0 .916.916l5.453-1.474A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.964-1.363l-.357-.214-3.685.997.985-3.594-.234-.371A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}
