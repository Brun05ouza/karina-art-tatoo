import { useEffect, useRef, useState } from "react";

type CursorState = "default" | "link" | "gallery" | "cta";

export function CustomCursor() {
  const mainRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);
  const visibleRef = useRef(false);
  const stateRef = useRef<CursorState>("default");
  const enabledRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [state, setState] = useState<CursorState>("default");

  useEffect(() => {
    /**
     * No iPad com trackpad ou mouse o ponteiro PRIMÁRIO continua sendo o toque,
     * então (hover: hover) e (pointer: fine) falham. As variantes any-* olham
     * todos os dispositivos de entrada disponíveis e é isso que detecta o
     * trackpad. Mantemos a checagem primária primeiro, que cobre o desktop.
     */
    const hasFinePointer =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasFinePointer || reduceMotion) return;

    const updateVisible = (next: boolean) => {
      if (visibleRef.current === next) return;
      visibleRef.current = next;
      setVisible(next);
    };

    const updateState = (next: CursorState) => {
      if (stateRef.current === next) return;
      stateRef.current = next;
      setState(next);
    };

    const loop = () => {
      current.current.x += (pointer.current.x - current.current.x) * 0.38;
      current.current.y += (pointer.current.y - current.current.y) * 0.38;

      if (mainRef.current) {
        mainRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }

      raf.current = requestAnimationFrame(loop);
    };

    /**
     * Só escondemos o cursor nativo depois de ver um mouse de verdade. Num iPad
     * que tem só Apple Pencil, any-pointer: fine também casa — e aí aplicar
     * cursor: none sem nunca mostrar a estrela não faria sentido.
     */
    const enable = () => {
      if (enabledRef.current) return;
      enabledRef.current = true;
      document.documentElement.classList.add("ks-custom-cursor-enabled");
      raf.current = requestAnimationFrame(loop);
    };

    const onPointerMove = (event: PointerEvent) => {
      // Um toque de dedo no iPad também dispara mousemove/pointermove. Sem este
      // filtro a estrela pularia para o ponto tocado e ficaria parada lá.
      if (event.pointerType !== "mouse") {
        updateVisible(false);
        return;
      }

      enable();
      pointer.current = { x: event.clientX, y: event.clientY };

      if (!visibleRef.current) {
        current.current = { x: event.clientX, y: event.clientY };
        updateVisible(true);
      }

      const element = event.target instanceof Element ? event.target : null;
      if (!element) return;

      if (element.closest("input, textarea, select, [contenteditable='true']")) {
        updateVisible(false);
        return;
      }

      if (element.closest("[data-cursor='gallery']")) updateState("gallery");
      else if (element.closest("[data-cursor='cta']")) updateState("cta");
      else if (element.closest("a, button, [data-cursor='link']")) updateState("link");
      else updateState("default");
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") setPressed(true);
    };
    const onPointerUp = () => setPressed(false);
    const onLeave = () => updateVisible(false);
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      updateVisible(true);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      document.documentElement.classList.remove("ks-custom-cursor-enabled");
      enabledRef.current = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      className={`ks-star-cursor${visible ? " is-visible" : ""}${pressed ? " is-pressed" : ""}`}
      data-state={state}
      aria-hidden="true"
    >
      <div ref={mainRef} className="ks-star-cursor-main">
        <img
          className="ks-cursor-star-image ks-cursor-star-filled"
          src="/assets/brand/star-karina-filled.png"
          alt=""
          width="48"
          height="48"
          draggable="false"
        />
        <img
          className="ks-cursor-star-image ks-cursor-star-outline"
          src="/assets/brand/star-karina-outline.png"
          alt=""
          width="58"
          height="58"
          draggable="false"
        />
      </div>
    </div>
  );
}
