import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

export type DriftWallItem = {
  image: string;
  title?: string;
  href?: string;
};

export type DriftWallProps = {
  items: DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  direction?: "up" | "down";
  variance?: number;
  parallax?: number;
  pauseOnHover?: boolean;
  lift?: number;
  fade?: number;
  dim?: number;
  grayscale?: boolean;
  overlayColor?: string;
  className?: string;
};

/** Cada coluna recebe o mesmo conjunto (rotacionado), com a mesma quantidade — loop estável. */
function buildColumns(items: DriftWallItem[], columns: number): DriftWallItem[][] {
  if (!items.length) return [];
  const count = Math.max(columns, 1);
  const perColumn = Math.max(4, Math.ceil(items.length / count) + 1);

  return Array.from({ length: count }, (_, columnIndex) => {
    const column: DriftWallItem[] = [];
    for (let i = 0; i < perColumn; i += 1) {
      column.push(items[(columnIndex + i * count) % items.length]);
    }
    return column;
  });
}

export function DriftWall({
  items,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = "up",
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  dim = 1,
  grayscale = false,
  overlayColor = "transparent",
  className = "",
}: DriftWallProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });
  const cols = useMemo(() => buildColumns(items, Math.max(1, columns)), [items, columns]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reducedMotion || parallax <= 0) return undefined;
    const root = rootRef.current;
    const plane = planeRef.current;
    if (!root || !plane) return undefined;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      pointer.current = { x: nx, y: ny };
    };

    const tick = () => {
      const px = pointer.current.x * parallax * 6;
      const py = pointer.current.y * parallax * -4;
      plane.style.transform = `translateZ(-${depth}px) rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg)`;
      frame = window.requestAnimationFrame(tick);
    };

    root.addEventListener("pointermove", onMove);
    frame = window.requestAnimationFrame(tick);
    return () => {
      root.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(frame);
    };
  }, [depth, parallax, reducedMotion, roll, tilt, turn]);

  // Loop em pixels (módulo da meia-altura) — evita o salto do translateY -50% com flex gap.
  useEffect(() => {
    if (reducedMotion) return undefined;

    const offsets = cols.map(() => 0);
    const factors = cols.map((_, index) => 1 + ((index % 3) - 1) * variance * 0.45);
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!pausedRef.current) {
        trackRefs.current.forEach((track, index) => {
          if (!track) return;
          const half = track.scrollHeight / 2;
          if (half <= 0) return;

          offsets[index] = (offsets[index] + speed * factors[index] * dt) % half;
          const goesUp = direction === "up" ? index % 2 === 0 : index % 2 === 1;
          const y = goesUp ? -offsets[index] : offsets[index] - half;
          track.style.transform = `translate3d(0, ${y}px, 0)`;
        });
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [cols, direction, reducedMotion, speed, variance]);

  const style = {
    "--dw-tile-w": `${tileWidth}px`,
    "--dw-tile-h": `${tileHeight}px`,
    "--dw-gap": `${gap}px`,
    "--dw-radius": `${radius}px`,
    "--dw-lift": `${lift}px`,
    "--dw-dim": String(dim),
    "--dw-fade": String(fade),
    "--dw-overlay": overlayColor,
    "--dw-perspective": `${perspective}px`,
  } as CSSProperties;

  const showOverlay = overlayColor !== "transparent" && overlayColor !== "none";

  return (
    <div
      ref={rootRef}
      className={`ks-drift-wall${grayscale ? " is-grayscale" : ""}${className ? ` ${className}` : ""}`}
      style={style}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => {
        if (pauseOnHover) setPaused(false);
        pointer.current = { x: 0, y: 0 };
      }}
    >
      <div className="ks-drift-wall-fade ks-drift-wall-fade-top" aria-hidden="true" />
      <div className="ks-drift-wall-fade ks-drift-wall-fade-bottom" aria-hidden="true" />

      <div
        ref={planeRef}
        className="ks-drift-wall-plane"
        style={{
          transform: `translateZ(-${depth}px) rotateX(${tilt}deg) rotateY(${turn}deg) rotateZ(${roll}deg)`,
        }}
      >
        {cols.map((column, columnIndex) => {
          const loop = [...column, ...column];

          return (
            <div key={`col-${columnIndex}`} className="ks-drift-wall-column" style={{ width: tileWidth }}>
              <div
                ref={(node) => {
                  trackRefs.current[columnIndex] = node;
                }}
                className="ks-drift-wall-track"
              >
                {loop.map((item, itemIndex) => {
                  const body = (
                    <>
                      <img src={item.image} alt={item.title || "Depoimento de cliente"} loading="lazy" decoding="async" />
                      {showOverlay ? <span className="ks-drift-wall-overlay" aria-hidden="true" /> : null}
                    </>
                  );

                  if (item.href) {
                    return (
                      <a
                        key={`${columnIndex}-${itemIndex}-${item.image}`}
                        className="ks-drift-wall-tile"
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={item.title}
                        style={{ marginBottom: gap }}
                      >
                        {body}
                      </a>
                    );
                  }

                  return (
                    <div
                      key={`${columnIndex}-${itemIndex}-${item.image}`}
                      className="ks-drift-wall-tile"
                      title={item.title}
                      style={{ marginBottom: gap }}
                    >
                      {body}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
