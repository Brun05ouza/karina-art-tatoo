import { useCallback, useRef, useState } from "react";

type HoverProcessMediaProps = {
  poster: string;
  videoSrc: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

function canHoverPlay() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function HoverProcessMedia({
  poster,
  videoSrc,
  alt,
  className = "",
  loading = "lazy",
}: HoverProcessMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.currentTime > 0.15) video.currentTime = 0;
      await video.play();
      setPlaying(true);
    } catch {
      /* autoplay bloqueado ou recurso indisponível */
    }
  }, []);

  const stop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setPlaying(false);
  }, []);

  const handlePointerEnter = () => {
    if (canHoverPlay()) void play();
  };

  const handlePointerLeave = () => {
    if (canHoverPlay()) stop();
  };

  const handleTouchToggle = (event: React.MouseEvent | React.TouchEvent) => {
    if (canHoverPlay()) return;
    event.preventDefault();
    event.stopPropagation();
    if (playing) stop();
    else void play();
  };

  return (
    <div
      className={`ks-hover-process-media${playing ? " is-playing" : ""}${className ? ` ${className}` : ""}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleTouchToggle}
    >
      <img
        className="ks-hover-process-poster"
        src={poster}
        alt={alt}
        loading={loading}
        draggable={false}
      />
      <video
        ref={videoRef}
        className="ks-hover-process-video"
        src={videoSrc}
        poster={poster}
        muted
        playsInline
        loop
        preload="metadata"
        aria-hidden="true"
      />
      <span className="ks-hover-process-hint">Ver processo</span>
    </div>
  );
}
