import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { StarGlyph } from "./StarGlyph";
import { tattooImages } from "../tattoo-images";

const features = [
  "atendimento privado",
  "projeto autoral",
  "freehand e botânica",
  "orientação de cuidados",
];

export function PrivateAtelier() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const ease = [0.22, 1, 0.36, 1];

  return (
    <section
      id="atelie"
      ref={ref}
      style={{
        background: "#111014",
        padding: "clamp(80px, 12vw, 160px) clamp(24px, 5vw, 64px)",
      }}
    >
      <div
        className="ks-two-col"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(40px, 6vw, 96px)",
          alignItems: "center",
        }}
      >
        {/* Left text */}
        <div>
          <div
            style={{
              fontFamily: '"Bodoni Moda", serif',
              fontSize: "clamp(30px, 4vw, 54px)",
              lineHeight: 1.1,
              fontWeight: 400,
              color: "#F7F5F6",
              marginBottom: 32,
            }}
          >
            {["UM ATELIÊ PRIVADO", "PARA DESENHAR COM CALMA"].map((line, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <motion.div
                  initial={{ y: "100%" }}
                  animate={inView ? { y: 0 } : {}}
                  transition={{ duration: 1, delay: i * 0.15, ease }}
                >
                  {line}
                </motion.div>
              </div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.5, ease }}
            style={{
              fontFamily: '"Hanken Grotesk", sans-serif',
              fontSize: 15,
              lineHeight: 1.65,
              fontWeight: 300,
              color: "#BAB1BA",
              marginBottom: 48,
              maxWidth: 420,
            }}
          >
            Atendimento individual em Teresópolis — RJ, com horário marcado, escuta e processo
            autoral.
          </motion.p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {features.map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.7 + i * 0.1, ease }}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <StarGlyph size={8} color="#A898AA" />
                <span
                  style={{
                    fontFamily: '"Hanken Grotesk", sans-serif',
                    fontSize: 14,
                    fontWeight: 300,
                    color: "#BAB1BA",
                    letterSpacing: "0.04em",
                  }}
                >
                  {feat}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease }}
          style={{
            position: "relative",
            border: "1px solid rgba(247,245,246,0.1)",
            padding: 12,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "1px solid rgba(247,245,246,0.08)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <img
            src={tattooImages.sessionClose}
            alt="Sessão de tatuagem"
            style={{
              width: "100%",
              aspectRatio: "4/5",
              objectFit: "cover",
              filter: "grayscale(100%) contrast(1.05)",
              display: "block",
            }}
          />
          {/* Metadata */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 8,
              letterSpacing: "0.18em",
              color: "#806E85",
              textTransform: "uppercase",
            }}
          >
            TERESÓPOLIS — RJ
          </div>
        </motion.div>
      </div>
    </section>
  );
}
