import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  clampFocal,
  coverPanAxes,
  DEFAULT_FOCAL,
  focalStyle,
  type FocalPoint,
} from "../../app/focal";

type Props = {
  src: string;
  alt?: string;
  value: FocalPoint;
  onChange: (next: FocalPoint) => void;
  /** Chamado ao soltar o ponteiro / após seta — para persistir. */
  onCommit?: (next: FocalPoint) => void;
  disabled?: boolean;
  naturalWidth?: number;
  naturalHeight?: number;
};

/**
 * Prévia 4:5 com arraste (Pointer Events) para ajustar object-position.
 * Só move nos eixos em que a imagem ultrapassa o quadro (cover).
 */
export function FocalPreview({
  src,
  alt = "",
  value,
  onChange,
  onCommit,
  disabled,
  naturalWidth,
  naturalHeight,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [dims, setDims] = useState({ w: naturalWidth ?? 0, h: naturalHeight ?? 0 });
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [hintHidden, setHintHidden] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origin: FocalPoint;
  } | null>(null);
  const liveRef = useRef(value);
  liveRef.current = value;

  useEffect(() => {
    if (naturalWidth && naturalHeight) {
      setDims({ w: naturalWidth, h: naturalHeight });
    }
  }, [naturalWidth, naturalHeight, src]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [src]);

  const axes = coverPanAxes(dims.w, dims.h, box.w, box.h);
  const canPan = axes.canX || axes.canY;

  const applyDelta = useCallback(
    (origin: FocalPoint, dx: number, dy: number): FocalPoint => {
      let x = origin.x;
      let y = origin.y;
      if (axes.canX && axes.overflowX > 0) {
        x = clampFocal(origin.x - (dx / axes.overflowX) * 100);
      }
      if (axes.canY && axes.overflowY > 0) {
        y = clampFocal(origin.y - (dy / axes.overflowY) * 100);
      }
      return { x, y };
    },
    [axes.canX, axes.canY, axes.overflowX, axes.overflowY],
  );

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || !canPan || e.button !== 0) return;
    e.preventDefault();
    setHintHidden(true);
    setDragging(true);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...value },
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    const next = applyDelta(drag.origin, e.clientX - drag.startX, e.clientY - drag.startY);
    onChange(next);
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    onCommit?.(liveRef.current);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (disabled || !canPan) return;
    const step = e.shiftKey ? 5 : 2;
    let next: FocalPoint | null = null;
    if (e.key === "ArrowLeft" && axes.canX) {
      next = { x: clampFocal(value.x - step), y: value.y };
    } else if (e.key === "ArrowRight" && axes.canX) {
      next = { x: clampFocal(value.x + step), y: value.y };
    } else if (e.key === "ArrowUp" && axes.canY) {
      next = { x: value.x, y: clampFocal(value.y - step) };
    } else if (e.key === "ArrowDown" && axes.canY) {
      next = { x: value.x, y: clampFocal(value.y + step) };
    } else if (e.key === "Home") {
      next = { ...DEFAULT_FOCAL };
    }
    if (!next) return;
    e.preventDefault();
    setHintHidden(true);
    onChange(next);
    onCommit?.(next);
  }

  function center() {
    setHintHidden(true);
    const next = { ...DEFAULT_FOCAL };
    onChange(next);
    onCommit?.(next);
  }

  return (
    <div className="ks-focal-wrap">
      <div
        ref={frameRef}
        className={`ks-focal-frame${canPan ? " is-pannable" : ""}${dragging ? " is-dragging" : ""}`}
        role="group"
        tabIndex={canPan && !disabled ? 0 : -1}
        aria-label="Enquadramento da foto. Arraste ou use as setas para ajustar."
        aria-disabled={disabled || !canPan}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <img
          ref={imgRef}
          className="ks-gallery-drop-img"
          src={src}
          alt={alt}
          draggable={false}
          style={focalStyle(value.x, value.y)}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setDims({ w: img.naturalWidth, h: img.naturalHeight });
            }
          }}
        />
        {canPan && !hintHidden && !disabled ? (
          <span className="ks-focal-hint">Arraste para enquadrar</span>
        ) : null}
      </div>
      {canPan ? (
        <div className="ks-focal-toolbar">
          <button type="button" className="ks-gallery-drop-btn ks-gallery-drop-btn--ghost" onClick={center} disabled={disabled}>
            Centralizar
          </button>
          <span className="ks-focal-meta" aria-live="polite">
            {value.x}% · {value.y}%
          </span>
        </div>
      ) : null}
    </div>
  );
}
