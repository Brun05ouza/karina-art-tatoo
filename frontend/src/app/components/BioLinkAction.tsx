/** Botão de ação da /bio — compartilhado com a prévia do admin. */

import { ArrowRight, Images, LinkIcon, ShoppingBag, Sparkles, Youtube } from "lucide-react";
import { Link } from "react-router";

export type BioLinkActionModel = {
  label: string;
  icon: string;
  featured?: boolean;
  url?: string;
};

function isExternalLink(url: string) {
  return /^(https?:|mailto:|tel:|whatsapp:)/i.test(url);
}

export function bioActionIcon(icon: string, size = 18) {
  const normalized = icon.toLowerCase();
  if (normalized.includes("message") || normalized.includes("whatsapp") || normalized.includes("zap")) {
    return <WhatsAppGlyph size={size} />;
  }
  if (normalized.includes("tiktok")) return <TikTokGlyph size={size} />;
  if (normalized.includes("instagram") || normalized.includes("insta")) return <InstagramGlyph size={size} />;
  if (normalized.includes("youtube")) return <Youtube size={size} />;
  if (normalized.includes("portfolio") || normalized.includes("image")) return <Images size={size} />;
  if (normalized.includes("spark")) return <Sparkles size={size} />;
  if (normalized.includes("produto") || normalized.includes("shop")) return <ShoppingBag size={size} />;
  return <LinkIcon size={size} />;
}

type Props = {
  button: BioLinkActionModel;
  /** Sem href: só visual (prévia no admin). */
  preview?: boolean;
  className?: string;
};

export function BioLinkAction({ button, preview = false, className = "" }: Props) {
  const inner = (
    <>
      <span className="ks-link-bio-action-icon">{bioActionIcon(button.icon)}</span>
      <span>{button.label || "Rótulo"}</span>
      <ArrowRight size={16} />
    </>
  );

  const cls = `ks-link-bio-action${button.featured ? " is-primary" : ""}${className ? ` ${className}` : ""}`;

  if (preview || !button.url) {
    return (
      <div className={cls} aria-hidden={preview || undefined}>
        {inner}
      </div>
    );
  }

  if (isExternalLink(button.url)) {
    return (
      <a className={cls} href={button.url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link className={cls} to={button.url || "/"}>
      {inner}
    </Link>
  );
}

function WhatsAppGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.522 5.851L.054 23.25a.75.75 0 0 0 .916.916l5.453-1.474A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.964-1.363l-.357-.214-3.685.997.985-3.594-.234-.371A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}

function TikTokGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.2 8.2 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1.01-.15z" />
    </svg>
  );
}

function InstagramGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
