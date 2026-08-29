import { useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { StarGlyph } from "./StarGlyph";
import { scrollTo } from "../scroll";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function RevealLine({ children, delay = 0, large = false }: { children: ReactNode; delay?: number; large?: boolean }) {
  return (
    <div style={{ overflow: "hidden", lineHeight: large ? 0.9 : 1 }}>
      <motion.div
        initial={{ y: "105%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function FloatingStar({ x, y, delay = 0, size = 8, opacity = 1 }: { x: string; y: string; delay?: number; size?: number; opacity?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 1.4, delay, ease: EASE }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        animation: `ks-star-pulse ${3.5 + delay * 0.5}s ease-in-out infinite`,
        pointerEvents: "none",
      }}
    >
      <StarGlyph size={size} color="#A898AA" />
    </motion.div>
  );
}

function CTAButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="#agendar"
      data-cursor="cta"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.preventDefault();
        scrollTo("#agendar", { offset: -64 });
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        cursor: "none",
        padding: "12px 0",
        borderBottom: `1px solid ${hovered ? "#A898AA" : "rgba(247,245,246,0.52)"}`,
        transition: "border-color 0.4s ease",
      }}
    >
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: hovered ? "#A898AA" : "#f7f5f6",
          transition: "color 0.4s ease",
        }}
      >
        COMEÇAR UMA IDEIA
      </span>
      <motion.div
        animate={{ x: hovered ? 4 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ opacity: hovered ? 1 : 0.72 }}
      >
        <svg width="14" height="1" viewBox="0 0 14 1" fill="none">
          <line x1="0" y1="0.5" x2="14" y2="0.5" stroke={hovered ? "#A898AA" : "#f7f5f6"} strokeWidth="0.5" />
        </svg>
      </motion.div>
    </a>
  );
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section
      ref={ref}
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#111014",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          y: bgY,
          scale: 1.12,
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 48%",
            filter: "grayscale(68%) saturate(0.82) contrast(1.16) brightness(0.78)",
            opacity: 0.7,
          }}
        >
          <source src="" type="video/mp4" />
        </video>
      </motion.div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(115deg, rgba(168,152,170,0.13) 0%, rgba(64,41,78,0.08) 42%, rgba(17,16,20,0.12) 100%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 72% 46%, rgba(168,152,170,0.24) 0%, rgba(168,152,170,0.08) 32%, transparent 62%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(17,16,20,0.78) 0%, rgba(17,16,20,0.42) 44%, rgba(17,16,20,0.1) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "48%",
          background: "linear-gradient(to bottom, transparent, rgba(17,16,20,0.9))",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "18%",
          background: "linear-gradient(to top, transparent, rgba(17,16,20,0.48))",
          pointerEvents: "none",
        }}
      />

      <FloatingStar x="68%" y="22%" delay={0.6} size={9} />
      <FloatingStar x="82%" y="45%" delay={1.1} size={6} opacity={0.7} />
      <FloatingStar x="24%" y="14%" delay={1.5} size={5} opacity={0.6} />
      <FloatingStar x="55%" y="65%" delay={0.9} size={7} opacity={0.5} />
      <FloatingStar x="90%" y="28%" delay={1.8} size={4} opacity={0.5} />
      <FloatingStar x="12%" y="72%" delay={1.3} size={5} opacity={0.4} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.8, ease: EASE }}
        className="ks-hide-mobile"
        style={{
          position: "absolute",
          top: 80,
          left: "clamp(24px, 5vw, 64px)",
          right: "clamp(24px, 5vw, 64px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 8,
            letterSpacing: "0.2em",
            color: "rgba(247,245,246,0.7)",
            textTransform: "uppercase",
          }}
        >
          TERESÓPOLIS - RJ
        </span>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 8,
            letterSpacing: "0.2em",
            color: "rgba(247,245,246,0.48)",
          }}
        >
          -22.4121° S / -42.9758° W
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.4 }}
        className="ks-hide-mobile"
        style={{
          position: "absolute",
          right: "clamp(24px, 4vw, 52px)",
          bottom: "clamp(100px, 16vw, 200px)",
          fontFamily: '"Bodoni Moda", serif',
          fontSize: "clamp(120px, 18vw, 260px)",
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: "-0.06em",
          color: "transparent",
          WebkitTextStroke: "0.5px rgba(247,245,246,0.13)",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        KAH
      </motion.div>

      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.4, delay: 0.5, ease: EASE }}
        style={{
          position: "absolute",
          left: "clamp(24px, 5vw, 64px)",
          top: "30%",
          width: "0.5px",
          height: "clamp(60px, 8vw, 100px)",
          background: "linear-gradient(to bottom, rgba(168,152,170,0.82), rgba(168,152,170,0.08))",
          transformOrigin: "top",
        }}
      />

      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          opacity: contentOpacity,
          y: contentY,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 clamp(24px, 5vw, 64px) clamp(44px, 6vw, 72px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.22em" }}
          transition={{ duration: 1.1, delay: 1.3, ease: EASE }}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#A898AA",
            marginBottom: "clamp(16px, 2.5vw, 28px)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ display: "inline-block", width: 20, height: "0.5px", background: "#A898AA", verticalAlign: "middle" }} />
          BOTÂNICA · FREEHAND · SUMIÊ
        </motion.div>

        <div
          style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(52px, 9.5vw, 132px)",
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            fontWeight: 400,
            color: "#F7F5F6",
            textShadow: "0 20px 60px rgba(0,0,0,0.62), 0 2px 18px rgba(0,0,0,0.55)",
            marginBottom: "clamp(28px, 4vw, 48px)",
            maxWidth: "100%",
          }}
        >
          <RevealLine delay={0.2} large>TATUAGEM</RevealLine>
          <RevealLine delay={0.38} large>AUTORAL</RevealLine>
          <div style={{ height: "clamp(6px, 1vw, 12px)" }} />
          <RevealLine delay={0.54} large>
            <span style={{ color: "rgba(247,245,246,0.82)", fontStyle: "italic" }}>EM PELE VIVA</span>
          </RevealLine>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.5 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "12px 0",
            borderTop: "1px solid rgba(247,245,246,0.22)",
            paddingTop: "clamp(16px, 2.5vw, 24px)",
          }}
        >
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 8,
              letterSpacing: "0.2em",
              color: "rgba(247,245,246,0.68)",
              textTransform: "uppercase",
            }}
          >
            TATTOO AUTORAL · EST. 2026
          </span>
          <CTAButton />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.2 }}
        style={{
          position: "absolute",
          bottom: "clamp(24px, 3.5vw, 36px)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "0.5px",
            height: 32,
            background: "linear-gradient(to bottom, rgba(168,152,170,0.7), transparent)",
          }}
        />
      </motion.div>
    </section>
  );
}
