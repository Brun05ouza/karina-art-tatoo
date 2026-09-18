import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";

type Props = {
  accept: string;
  disabled?: boolean;
  hasMedia: boolean;
  error?: boolean;
  className?: string;
  replaceLabel: string;
  removeLabel?: string;
  onFile: (file: File) => void;
  onRemove?: () => void;
  progress?: { value: number; label: string } | null;
  describedBy?: string;
  empty: ReactNode;
  children?: ReactNode;
};

export function MediaDrop({
  accept,
  disabled = false,
  hasMedia,
  error = false,
  className,
  replaceLabel,
  removeLabel = "Remover",
  onFile,
  onRemove,
  progress,
  describedBy,
  empty,
  children,
}: Props) {
  const fileId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function takeFile(file: File | null) {
    if (inputRef.current) inputRef.current.value = "";
    if (!file || disabled) return;
    onFile(file);
  }

  function onDrag(event: DragEvent) {
    event.preventDefault();
    if (!disabled) setDragOver(true);
  }

  return (
    <div
      className={[
        "ks-media-drop",
        className,
        hasMedia ? "has-preview" : "is-empty",
        dragOver ? "is-drag" : "",
        error ? "has-error" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-describedby={describedBy}
      onDragEnter={onDrag}
      onDragOver={onDrag}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        takeFile(event.dataTransfer.files?.[0] ?? null);
      }}
    >
      <input
        ref={inputRef}
        id={fileId}
        type="file"
        accept={accept}
        disabled={disabled}
        tabIndex={hasMedia ? -1 : 0}
        onChange={(event) => takeFile(event.target.files?.[0] ?? null)}
      />

      {hasMedia ? children : (
        <label htmlFor={fileId} className="ks-gallery-drop-empty">
          {empty}
        </label>
      )}

      {hasMedia ? (
        <div className="ks-gallery-drop-actions">
          <label htmlFor={fileId} className="ks-gallery-drop-btn">
            {replaceLabel}
          </label>
          {onRemove ? (
            <button
              type="button"
              className="ks-gallery-drop-btn ks-gallery-drop-btn--ghost"
              onClick={onRemove}
              disabled={disabled}
            >
              {removeLabel}
            </button>
          ) : null}
        </div>
      ) : null}

      {progress ? (
        <div className="ks-gallery-drop-progress" role="status" aria-live="polite">
          <div className="ks-gallery-drop-progress-bar" style={{ width: `${progress.value}%` }} />
          <p>{progress.label}</p>
        </div>
      ) : null}
    </div>
  );
}
