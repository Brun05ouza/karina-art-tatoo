import type Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type ScrollListener = (scroll: number) => void;

let lenis: Lenis | null = null;
let lockCount = 0;
let resizeObserver: ResizeObserver | null = null;
let observedRoot: Element | null = null;
let refreshRaf = 0;

const scrollListeners = new Set<ScrollListener>();

function notifyScrollListeners(scroll: number) {
  scrollListeners.forEach((listener) => listener(scroll));
}

// Leve resize debounçado — usado pelo ResizeObserver durante scroll/animações.
// NÃO chama ScrollTrigger.refresh() aqui: é uma operação cara que trava
// o main thread se chamada a cada frame de animação whileInView.
export function queueRefresh() {
  cancelAnimationFrame(refreshRaf);
  refreshRaf = requestAnimationFrame(() => {
    lenis?.resize();
  });
}

export function registerLenis(instance: Lenis) {
  lenis = instance;

  instance.on("scroll", ({ scroll }) => {
    ScrollTrigger.update();
    notifyScrollListeners(scroll);
  });
}

export function unregisterLenis() {
  lenis = null;
  unobserveScrollRoot();
}

export function subscribeLenisScroll(listener: ScrollListener) {
  scrollListeners.add(listener);
  listener(lenis?.scroll ?? window.scrollY);

  return () => {
    scrollListeners.delete(listener);
  };
}

export function observeScrollRoot(root: Element | null) {
  if (!root || typeof ResizeObserver === "undefined") return;

  unobserveScrollRoot();
  observedRoot = root;

  resizeObserver = new ResizeObserver(() => {
    queueRefresh();
  });
  resizeObserver.observe(root);
}

export function unobserveScrollRoot() {
  resizeObserver?.disconnect();
  resizeObserver = null;
  observedRoot = null;
}

export function lockScroll() {
  lockCount += 1;

  if (lenis) {
    lenis.stop();
    return;
  }

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);

  if (lockCount > 0) return;

  ensureScrollUnlocked();
}

export function ensureScrollUnlocked() {
  if (lenis?.isStopped && lockCount === 0) {
    lenis.start();
  }

  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

// Wrapper para lenis.scrollTo — permite que componentes façam scroll
// programático sem acessar a instância do Lenis diretamente.
export function scrollTo(
  target: string | number | HTMLElement,
  options?: { offset?: number; duration?: number; immediate?: boolean; force?: boolean },
) {
  if (lenis) {
    lenis.scrollTo(target as Parameters<typeof lenis.scrollTo>[0], options);
  } else if (typeof target === "string") {
    document.querySelector(target)?.scrollIntoView({ behavior: "auto" });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "auto" });
  }
}

export function resetScrollPosition() {
  ensureScrollUnlocked();

  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }

  queueRefresh();
}

export function refreshScrollMetrics() {
  lenis?.resize();
  ScrollTrigger.refresh();
}
