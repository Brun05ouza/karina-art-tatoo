interface CrosshairProps {
  size?: number;
  color?: string;
  position?: "tl" | "tr" | "bl" | "br" | "all";
  className?: string;
}

function CornerMark({ size = 12, color = "#806E85" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="0.75">
      <line x1="0" y1="6" x2="4" y2="6" />
      <line x1="6" y1="0" x2="6" y2="4" />
    </svg>
  );
}

export function StencilCrosshair({ size = 12, color = "#806E85", position = "all", className = "" }: CrosshairProps) {
  if (position === "all") {
    return (
      <>
        <div className={`absolute top-0 left-0 ${className}`} style={{ transform: "none" }}>
          <CornerMark size={size} color={color} />
        </div>
        <div className={`absolute top-0 right-0 ${className}`} style={{ transform: "rotate(90deg)" }}>
          <CornerMark size={size} color={color} />
        </div>
        <div className={`absolute bottom-0 left-0 ${className}`} style={{ transform: "rotate(-90deg)" }}>
          <CornerMark size={size} color={color} />
        </div>
        <div className={`absolute bottom-0 right-0 ${className}`} style={{ transform: "rotate(180deg)" }}>
          <CornerMark size={size} color={color} />
        </div>
      </>
    );
  }

  const rotations = { tl: "none", tr: "rotate(90deg)", bl: "rotate(-90deg)", br: "rotate(180deg)" };
  const positions = {
    tl: "absolute top-0 left-0",
    tr: "absolute top-0 right-0",
    bl: "absolute bottom-0 left-0",
    br: "absolute bottom-0 right-0",
  };

  return (
    <div className={`${positions[position]} ${className}`} style={{ transform: rotations[position] }}>
      <CornerMark size={size} color={color} />
    </div>
  );
}
