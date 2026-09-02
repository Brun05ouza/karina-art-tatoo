import type { CSSProperties } from "react";

/** Mesmas estrelas das quebras entre seções (PNG leve). */
const STAR_ASSETS = {
  1: "/assets/brand/star-karina-filled.webp",
  2: "/assets/brand/star-karina-filled.webp",
  3: "/assets/brand/star-karina-outline.webp",
} as const;

type BrandStarProps = {
  variant?: keyof typeof STAR_ASSETS;
  size?: number;
  className?: string;
  label?: string;
};

export function BrandStar({
  variant = 1,
  size = 24,
  className = "",
  label,
}: BrandStarProps) {
  return (
    <img
      className={`ks-brand-star ${className}`.trim()}
      src={STAR_ASSETS[variant]}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      loading="lazy"
      decoding="async"
      width={size}
      height={size}
      style={{ "--ks-brand-star-size": `${size}px` } as CSSProperties}
    />
  );
}
