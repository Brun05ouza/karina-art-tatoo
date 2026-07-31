import { useEffect, useRef, useState } from "react";

type CursorState = "default" | "link" | "gallery" | "cta";

export function CustomCursor() {
  const mainRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);
  const visibleRef = useRef(false);
  const stateRef = useRef<CursorState>("default");
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [state, setState] = useState<CursorState>("default");

  useEffect(() => {
    const canUseCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canUseCustomCursor || reduceMotion) return;

    document.documentElement.classList.add("ks-custom-cursor-enabled");

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

    const onMove = (event: MouseEvent) => {
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

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => updateVisible(false);
    const onEnter = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      updateVisible(true);
    };

    const loop = () => {
      current.current.x += (pointer.current.x - current.current.x) * 0.38;
      current.current.y += (pointer.current.y - current.current.y) * 0.38;

      if (mainRef.current) {
        mainRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }

      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.documentElement.classList.remove("ks-custom-cursor-enabled");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
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
