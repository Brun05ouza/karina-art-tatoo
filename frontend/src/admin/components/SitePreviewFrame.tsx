import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
// ?inline devolve o CSS como string (não injeta na página do admin), então a
// prévia usa exatamente a mesma folha de estilos do site — fonte única da verdade.
import fontsCss from "../../styles/fonts.css?inline";
import siteCss from "../../styles/kah-sarte.css?inline";

/** Viewport de referência: um desktop comum. O hero usa min(92vh, 920px), logo
 *  a altura importa para a fidelidade e não pode ser esticada. */
const REFERENCE_WIDTH = 1280;
const REFERENCE_HEIGHT = 900;

const FRAME_DOC = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>
${fontsCss}
${siteCss}
/* Ajustes só da prévia: sem preloader, sem cursor customizado, sem navegação. */
html, body { margin: 0; }
a { cursor: default; pointer-events: none; }
.ksa-empty { color: rgba(128, 110, 133, .85); font-style: italic; }
</style>
</head><body></body></html>`;

/**
 * Renderiza a prévia dentro de um iframe que carrega o CSS real do site.
 *
 * Por que iframe: o kah-sarte.css tem regras globais (html/body, cursor,
 * scrollbar) que não podem vazar para a interface administrativa, e as media
 * queries precisam medir 1280px — não a largura da coluna do admin.
 *
 * O conteúdo é renderizado por portal, então continua sendo React normal e
 * reflete cada tecla digitada no formulário.
 */
export function SitePreviewFrame({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);

  // Mede a largura disponível para calcular a escala — evita constantes
  // hardcoded que quebram quando a sidebar recolhe ou a coluna muda.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const scale = width > 0 ? width / REFERENCE_WIDTH : 0;

  return (
    <div className="ksa-site-preview">
      <div className="ksa-site-preview-bar">
        <i /><i /><i />
        <small>karinasarte.com.br</small>
      </div>
      <div className="ksa-site-frame-host" ref={hostRef}>
        <div className="ksa-site-frame-viewport" style={{ height: `${Math.round(REFERENCE_HEIGHT * scale)}px` }}>
          <iframe
            className="ksa-site-frame"
            title="Prévia da página no site"
            srcDoc={FRAME_DOC}
            onLoad={(event) => setBody(event.currentTarget.contentDocument?.body ?? null)}
            style={{ width: `${REFERENCE_WIDTH}px`, height: `${REFERENCE_HEIGHT}px`, transform: `scale(${scale})` }}
          />
        </div>
      </div>
      {body ? createPortal(children, body) : null}
    </div>
  );
}
