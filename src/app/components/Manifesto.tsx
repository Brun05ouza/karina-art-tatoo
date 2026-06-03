import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { StarGlyph } from "./StarGlyph";

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  const ease = [0.22, 1, 0.36, 1];

  return (
    <section
      id="manifesto"
      ref={ref}
      style={{
        background: "#1b1c1a",
        padding: "clamp(80px, 12vw, 160px) clamp(24px, 5vw, 64px)",
      }}
    >
      <div
        className="ks-manifesto-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 5fr",
          gap: "clamp(32px, 4vw, 64px)",
          alignItems: "start",
        }}
      >
        {/* Label column */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          style={{ paddingTop: 6 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StarGlyph size={8} color="#e9c082" />
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#949087",
              }}
            >
              01 — MANIFESTO
            </span>
          </div>

          {/* Horizontal line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, delay: 0.3, ease }}
            style={{
              height: "0.5px",
              background: "rgba(242,237,226,0.12)",
              marginTop: 16,
              transformOrigin: "left",
            }}
          />
        </motion.div>

        {/* Text column */}
        <div>
          <div
            style={{
              fontFamily: '"Bodoni Moda", serif',
              fontSize: "clamp(28px, 3vw, 46px)",
              lineHeight: 1.15,
              fontWeight: 400,
              color: "#F2EDE2",
              marginBottom: 32,
            }}
          >
            {["Cada pele pede um desenho.", "Cada desenho nasce de escuta, gesto e intenção."].map(
              (line, i) => (
                <div key={i} style={{ overflow: "hidden" }}>
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={inView ? { y: 0 } : {}}
                    transition={{ duration: 1, delay: 0.2 + i * 0.15, ease }}
                  >
                    {line}
                  </motion.div>
                </div>
              )
            )}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.7, ease }}
            style={{
              fontFamily: '"Hanken Grotesk", sans-serif',
              fontSize: 15,
              lineHeight: 1.65,
              fontWeight: 300,
              color: "#cac6bc",
              maxWidth: 520,
            }}
          >
            Karina Sarte cria tatuagens autorais que atravessam botânica, símbolos, linhas livres e
            composições feitas para existir com o corpo — não apenas sobre ele.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
