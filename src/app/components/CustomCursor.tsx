import { useEffect, useRef, useState } from "react";

type CursorState = "default" | "link" | "gallery" | "cta";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("default");
  const [visible, setVisible] = useState(false);
  const stateRef = useRef<CursorState>("default");
  const visibleRef = useRef(false);
  const pos = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

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

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        current.current = { x: e.clientX, y: e.clientY };
        updateVisible(true);
      }

      const el = e.target as Element;
      if (el.closest("[data-cursor='gallery']")) updateState("gallery");
      else if (el.closest("[data-cursor='cta']")) updateState("cta");
      else if (el.closest("a, button, [data-cursor='link']")) updateState("link");
      else updateState("default");
    };

    const onLeave = () => updateVisible(false);
    const onEnter = () => updateVisible(true);

    const loop = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.12;
      current.current.y += (pos.current.y - current.current.y) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const sizes: Record<CursorState, number> = {
    default: 18,
    link: 42,
    gallery: 72,
    cta: 64,
  };

  const labels: Partial<Record<CursorState, string>> = {
    gallery: "VER",
    cta: "AGENDAR",
  };

  const sz = sizes[state];
  const label = labels[state];

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: sz,
        height: sz,
        borderRadius: "50%",
        border: `1px solid rgba(242, 237, 226, ${state === "default" ? 0.9 : 0.5})`,
        mixBlendMode: "difference",
        pointerEvents: "none",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "width 0.3s cubic-bezier(0.22,1,0.36,1), height 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease",
        opacity: visible ? 1 : 0,
        backgroundColor: state !== "default" ? "rgba(242,237,226,0.05)" : "transparent",
        backdropFilter: state !== "default" ? "none" : "none",
        willChange: "transform, width, height, opacity",
      }}
    >
      {label && (
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "#F2EDE2",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
