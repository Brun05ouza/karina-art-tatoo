import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { StencilCrosshair } from "./StencilCrosshair";
import { StarGlyph } from "./StarGlyph";

const items = [
  {
    id: "01",
    title: "BOTÂNICA",
    label: "01 — ATELIER",
    text: "A natureza interpretada em linhas finas e precisas.",
    img: "https://images.unsplash.com/photo-1726924244999-95eb16972c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    size: "large",
    offset: 0,
  },
  {
    id: "02",
    title: "SUMIÊ",
    label: "02 — GESTO",
    text: "O gesto do pincel transformado em tinta na pele.",
    img: "https://images.unsplash.com/photo-1712256877407-c5181b2cfa89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    size: "small",
    offset: 120,
  },
  {
    id: "03",
    title: "FREEHAND",
    label: "03 — FORMA",
    text: "Criações que respeitam a anatomia única de cada corpo.",
    img: "https://images.unsplash.com/photo-1589299784109-62eec2521302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    size: "medium",
    offset: 0,
  },
  {
    id: "04",
    title: "SÍMBOLOS",
    label: "04 — MÍSTICO",
    text: "Pequenas marcações místicas, estrelas e sentidos.",
    img: "https://images.unsplash.com/photo-1499001720097-29ee4e4fc261?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    size: "square",
    offset: 60,
  },
  {
    id: "05",
    title: "FLORAL",
    label: "05 — LINHA",
    text: "Delicadeza com presença.",
    img: "https://images.unsplash.com/photo-1776843013036-71e03b131c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    size: "medium",
    offset: 0,
  },
];

const heights: Record<string, string> = {
  large: "560px",
  small: "380px",
  medium: "440px",
  square: "380px",
};

function GalleryCard({ item, delay = 0 }: { item: (typeof items)[0]; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [hovered, setHovered] = useState(false);
  const ease = [0.22, 1, 0.36, 1];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.1, delay, ease }}
      data-cursor="gallery"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="ks-gallery-offset"
      style={{
        position: "relative",
        marginTop: item.offset,
        cursor: "none",
      }}
    >
      {/* Image frame */}
      <div
        className="ks-gallery-frame"
        style={{
          position: "relative",
          height: heights[item.size],
          border: "1px solid rgba(242,237,226,0.12)",
          overflow: "hidden",
          padding: 8,
        }}
      >
        <StencilCrosshair />

        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          <motion.img
            src={item.img}
            alt={item.title}
            animate={{ scale: hovered ? 1.04 : 1 }}
            transition={{ duration: 0.7, ease }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: hovered
                ? "grayscale(70%) contrast(1.1)"
                : "grayscale(100%) contrast(1.05)",
              transition: "filter 0.6s ease",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 8,
            letterSpacing: "0.18em",
            color: "#263C86",
            textTransform: "uppercase",
            opacity: hovered ? 1 : 0.6,
            transition: "opacity 0.3s ease",
          }}
        >
          {item.label}
        </div>
      </div>

      {/* Caption */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: delay + 0.2, ease }}
        style={{ paddingTop: 16 }}
      >
        <div
          style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(18px, 2vw, 24px)",
            fontWeight: 400,
            color: "#F2EDE2",
            marginBottom: 6,
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontFamily: '"Hanken Grotesk", sans-serif',
            fontSize: 13,
            lineHeight: 1.6,
            fontWeight: 300,
            color: "#949087",
          }}
        >
          {item.text}
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuoteDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1.2 }}
      style={{
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "clamp(32px, 5vw, 64px) 0",
        borderTop: "0.5px solid rgba(242,237,226,0.1)",
        borderBottom: "0.5px solid rgba(242,237,226,0.1)",
      }}
    >
      <em
        style={{
          fontFamily: '"Bodoni Moda", serif',
          fontSize: "clamp(16px, 2.5vw, 26px)",
          fontWeight: 400,
          color: "#cac6bc",
          fontStyle: "italic",
        }}
      >
        "a assimetria é onde a pele respira."
      </em>
    </motion.div>
  );
}

export function EditorialGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const ease = [0.22, 1, 0.36, 1];

  return (
    <section
      id="galeria"
      style={{
        background: "#131412",
        padding: "clamp(64px, 12vw, 160px) clamp(24px, 5vw, 64px)",
      }}
    >
      {/* Section header */}
      <div ref={ref} style={{ marginBottom: "clamp(40px, 6vw, 80px)", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#949087",
            marginBottom: 16,
          }}
        >
          COLEÇÕES AUTORAIS
        </motion.div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            style={{
              fontFamily: '"Bodoni Moda", serif',
              fontSize: "clamp(36px, 5vw, 70px)",
              fontWeight: 400,
              color: "#F2EDE2",
              lineHeight: 1.05,
            }}
          >
            GALERIA
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease }}
          >
            <StarGlyph size={14} color="#e9c082" />
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Row 1 */}
        <div
          className="ks-gallery-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "clamp(16px, 3vw, 40px)",
            marginBottom: "clamp(24px, 4vw, 56px)",
            alignItems: "start",
          }}
        >
          <GalleryCard item={items[0]} delay={0} />
          <GalleryCard item={items[1]} delay={0.15} />
        </div>

        <QuoteDivider />

        {/* Row 2 */}
        <div
          className="ks-gallery-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: "clamp(16px, 3vw, 40px)",
            marginTop: "clamp(24px, 4vw, 56px)",
            marginBottom: "clamp(24px, 4vw, 56px)",
            alignItems: "start",
          }}
        >
          <GalleryCard item={items[2]} delay={0} />
          <GalleryCard item={items[3]} delay={0.15} />
        </div>

        {/* Row 3 — centered on desktop, full width on mobile */}
        <div
          className="ks-gallery-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr 1fr",
            gap: "clamp(16px, 3vw, 40px)",
          }}
        >
          <div className="ks-gallery-spacer" />
          <GalleryCard item={items[4]} delay={0} />
          <div className="ks-gallery-spacer" />
        </div>
      </div>
    </section>
  );
}
