import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { refreshScrollMetrics, scrollTo } from "../scroll";

const FRAME_COUNT = 241;
const STORAGE_KEY = "ks-studio-scrub-done";

const frameSrc = (index: number) =>
  `/assets/session/frame-${String(index + 1).padStart(3, "0")}.webp`;

function isScrubDone() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markScrubDone() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* sessionStorage indisponível — segue sem cache */
  }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Seção "Conheça nosso espaço": pina a tela e faz scrub dos frames do vídeo
 * conforme o scroll. Ao completar, colapsa para uma seção estática (100vh),
 * compensa a posição do scroll e grava no sessionStorage para não repetir.
 */
export function StudioScrollSection() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const loadHintRef = useRef<HTMLSpanElement>(null);
  const justCompletedRef = useRef(false);

  const [mode, setMode] = useState<"scrub" | "static">(() =>
    isScrubDone() || prefersReducedMotion() ? "static" : "scrub",
  );

  const handleComplete = useCallback(() => {
    markScrubDone();
    justCompletedRef.current = true;
    setMode("static");
  }, []);

  // Ao colapsar de ~400vh para 100vh, gruda o topo da seção no viewport
  // para o usuário continuar exatamente de onde parou, sem salto visual.
  useLayoutEffect(() => {
    if (mode !== "static" || !justCompletedRef.current) return;
    justCompletedRef.current = false;

    const el = rootRef.current;
    if (el) {
      const top = window.scrollY + el.getBoundingClientRect().top;
      scrollTo(top, { immediate: true, force: true });
    }
    refreshScrollMetrics();
  }, [mode]);

  useEffect(() => {
    if (mode !== "scrub") return;

    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: HTMLImageElement[] = [];
    const loaded: boolean[] = new Array(FRAME_COUNT).fill(false);
    let loadedCount = 0;
    let lastDrawn = -1;
    let targetFrame = 0;
    let completed = false;
    let disposed = false;
    let raf = 0;

    const drawFrame = (index: number) => {
      const img = images[index];
      if (!img) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      lastDrawn = index;
    };

    // Frame mais próximo já carregado (abaixo do alvo) — evita tela preta
    // enquanto o pré-carregamento ainda corre atrás do scroll.
    const nearestLoaded = (index: number) => {
      for (let i = index; i >= 0; i -= 1) {
        if (loaded[i]) return i;
      }
      return -1;
    };

    const render = () => {
      raf = 0;
      if (disposed) return;

      const vh = window.innerHeight;
      const rect = root.getBoundingClientRect();
      const scrollable = rect.height - vh;
      const progress = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;

      targetFrame = Math.round(progress * (FRAME_COUNT - 1));

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }

      const drawable = nearestLoaded(targetFrame);
      if (drawable >= 0 && drawable !== lastDrawn) drawFrame(drawable);

      if (!completed && progress >= 0.999) {
        completed = true;
        handleComplete();
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      lastDrawn = -1;
      schedule();
    };

    // Pré-carrega os 241 frames com concorrência limitada, em ordem —
    // o scrub desenha o frame carregado mais próximo enquanto isso.
    const MAX_PARALLEL = 10;
    let cursor = 0;
    let active = 0;

    const pump = () => {
      while (!disposed && active < MAX_PARALLEL && cursor < FRAME_COUNT) {
        const index = cursor;
        cursor += 1;
        active += 1;

        const img = new Image();
        img.decoding = "async";
        images[index] = img;

        const settle = (ok: boolean) => {
          active -= 1;
          if (disposed) return;
          if (ok) {
            loaded[index] = true;
            loadedCount += 1;
            if (loadHintRef.current) {
              loadHintRef.current.textContent =
                loadedCount >= FRAME_COUNT
                  ? ""
                  : `CARREGANDO ${String(Math.round((loadedCount / FRAME_COUNT) * 100)).padStart(2, "0")}%`;
            }
            // Redesenha se este frame destrava o alvo atual
            if (index <= targetFrame || lastDrawn < 0) schedule();
          }
          pump();
        };

        img.onload = () => settle(true);
        img.onerror = () => settle(false);
        img.src = frameSrc(index);
      }
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", sizeCanvas);

    sizeCanvas();
    pump();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", sizeCanvas);
      images.forEach((img) => {
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
      });
    };
  }, [mode, handleComplete]);

  const caption = (
    <div className="ks-studio-caption">
      <span className="ks-label-caps">O Estúdio</span>
      <h2>Conheça nosso espaço</h2>
    </div>
  );

  if (mode === "static") {
    return (
      <section ref={rootRef} className="ks-studio-section is-static">
        <img
          className="ks-studio-media"
          src={frameSrc(FRAME_COUNT - 1)}
          alt="Estúdio da Karina Sarte em Teresópolis"
          loading="lazy"
        />
        <div className="ks-studio-shade" aria-hidden="true" />
        {caption}
      </section>
    );
  }

  return (
    <section ref={rootRef} className="ks-studio-section is-scrub">
      <div className="ks-studio-sticky">
        <canvas ref={canvasRef} className="ks-studio-media" aria-hidden="true" />
        <div className="ks-studio-shade" aria-hidden="true" />
        {caption}
        <span ref={loadHintRef} className="ks-studio-load-hint" aria-hidden="true" />
        <div className="ks-studio-progress" aria-hidden="true">
          <div ref={progressRef} className="ks-studio-progress-bar" />
        </div>
      </div>
    </section>
  );
}
