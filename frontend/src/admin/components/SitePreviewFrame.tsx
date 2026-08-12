import { MousePointerClick, RefreshCw } from "lucide-react";
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
.ksa-editable-section { outline: 1px solid transparent; outline-offset: -8px; position: relative; scroll-margin-top: 104px; transition: outline-color .18s ease, box-shadow .18s ease; }
.ksa-editable-section.is-active { outline-color: rgba(128, 40, 168, .58); box-shadow: inset 0 0 0 9999px rgba(128, 40, 168, .035); }
.ksa-preview-edit-button { align-items: center; backdrop-filter: blur(12px); background: rgba(46, 23, 58, .88); border: 1px solid rgba(255,255,255,.32); border-radius: 999px; color: #fff; cursor: pointer; display: inline-flex; font-family: "IBM Plex Mono", monospace; font-size: 10px; gap: 8px; letter-spacing: .12em; min-height: 34px; padding: 0 13px; pointer-events: auto; position: absolute; right: clamp(18px, 3vw, 42px); text-transform: uppercase; top: clamp(18px, 3vw, 42px); z-index: 40; }
.ksa-preview-edit-button::before { background: #b12cff; border-radius: 50%; box-shadow: 0 0 0 4px rgba(177,44,255,.18); content: ""; height: 7px; width: 7px; }
.ksa-preview-edit-button:hover { background: rgba(91, 73, 100, .96); }
.ksa-editable-section.is-active .ksa-preview-edit-button { background: #2e173a; }
.ksa-editable-section.ks-about-behind-scenes { padding-top: clamp(34px, 5vw, 72px); }
body.ksa-preview-edit-mode::after { content: ""; display: block; height: clamp(300px, 40vh, 520px); }
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
export function SitePreviewFrame({ children, clickToActivate = false }: { children: ReactNode; clickToActivate?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isLiveActive, setIsLiveActive] = useState(!clickToActivate);
  const [refreshKey, setRefreshKey] = useState(0);

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

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setViewportHeight(entry.contentRect.height);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!body) return;
    body.classList.toggle("ksa-preview-edit-mode", clickToActivate);
    return () => body.classList.remove("ksa-preview-edit-mode");
  }, [body, clickToActivate]);

  const scale = width > 0 ? width / REFERENCE_WIDTH : 0;
  const frameHeight = scale > 0 && viewportHeight > 0 ? Math.max(REFERENCE_HEIGHT, Math.ceil(viewportHeight / scale)) : REFERENCE_HEIGHT;
  const shouldBlockLive = clickToActivate && !isLiveActive;

  return (
    <div className="ksa-site-preview">
      <div className="ksa-site-preview-bar">
        <i /><i /><i />
        <small>karinasarte.com.br</small>
      </div>
      <div className="ksa-site-frame-host" ref={hostRef}>
        <div className="ksa-site-frame-viewport" ref={viewportRef} style={{ height: `${Math.round(REFERENCE_HEIGHT * scale)}px` }}>
          <iframe
            key={refreshKey}
            className="ksa-site-frame"
            title="Prévia da página no site"
            srcDoc={FRAME_DOC}
            onLoad={(event) => setBody(event.currentTarget.contentDocument?.body ?? null)}
            style={{ width: `${REFERENCE_WIDTH}px`, height: `${frameHeight}px`, transform: `scale(${scale})` }}
          />
          {shouldBlockLive ? (
            <button type="button" className="ksa-site-frame-activate" onClick={() => setIsLiveActive(true)}>
              <MousePointerClick size={18} />
              <span>Ativar prévia</span>
              <small>Clique para rolar e interagir com o live</small>
            </button>
          ) : null}
          {clickToActivate && isLiveActive ? (
            <div className="ksa-site-frame-controls">
              <button
                type="button"
                className="ksa-site-frame-refresh"
                aria-label="Recarregar prévia"
                title="Recarregar prévia"
                onClick={() => {
                  setBody(null);
                  setRefreshKey((key) => key + 1);
                }}
              >
                <RefreshCw size={16} />
              </button>
              <button type="button" className="ksa-site-frame-lock" onClick={() => setIsLiveActive(false)}>
                Pausar rolagem da prévia
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {body ? createPortal(children, body) : null}
    </div>
  );
}
