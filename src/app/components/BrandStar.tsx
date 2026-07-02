import type { CSSProperties } from "react";

const STAR_ASSETS = {
  1: "/assets/brand/star-karina-1.svg",
  2: "/assets/brand/star-karina-2.svg",
  3: "/assets/brand/star-karina-3.svg",
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
