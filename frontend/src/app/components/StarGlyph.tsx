interface StarGlyphProps {
  size?: number;
  color?: string;
  className?: string;
  pulse?: boolean;
}

export function StarGlyph({ size = 16, color = "#A898AA", className = "", pulse = false }: StarGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      style={pulse ? { animation: "ks-star-pulse 3s ease-in-out infinite" } : undefined}
    >
      <path d="M12 0 L13.2 10.8 L24 12 L13.2 13.2 L12 24 L10.8 13.2 L0 12 L10.8 10.8 Z" />
    </svg>
  );
}

export function StarGlyph8({ size = 14, color = "#A898AA", className = "" }: Omit<StarGlyphProps, "pulse">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M12 0 L12.9 8.5 L19.1 4.9 L15.5 11.1 L24 12 L15.5 12.9 L19.1 19.1 L12.9 15.5 L12 24 L11.1 15.5 L4.9 19.1 L8.5 12.9 L0 12 L8.5 11.1 L4.9 4.9 L11.1 8.5 Z" />
    </svg>
  );
}
