import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { StarGlyph } from "./StarGlyph";

export function ArtistSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const ease = [0.22, 1, 0.36, 1];

  return (
    <section
      id="artista"
      ref={ref}
      style={{
        background: "#40294E",
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
        {/* Left image */}
        <motion.div
          initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
          animate={inView ? { opacity: 1, clipPath: "inset(0% 0 0 0)" } : {}}
          transition={{ duration: 1.4, ease }}
          style={{
            position: "relative",
            border: "1px solid rgba(247,245,246,0.1)",
            padding: 12,
          }}
        >
          <img
            src=""
            alt="Karina Sarte"
            style={{
              width: "100%",
              aspectRatio: "3/4",
              objectFit: "cover",
              filter: "grayscale(100%) contrast(1.05)",
              display: "block",
            }}
          />

          {/* Organic line behind */}
          <svg
            style={{ position: "absolute", bottom: -20, left: -20, opacity: 0.25 }}
            width="120"
            height="60"
            viewBox="0 0 120 60"
            fill="none"
          >
            <path
              d="M 0 30 Q 40 10 80 30 Q 100 40 120 20"
              stroke="#A898AA"
              strokeWidth="0.75"
              fill="none"
            />
          </svg>

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
            ELA/DELA
          </div>
        </motion.div>

        {/* Right text — offset up */}
        <div style={{ paddingTop: "clamp(0px, 4vw, 60px)" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease }}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#806E85",
              marginBottom: 24,
            }}
          >
            TERESÓPOLIS — RJ
          </motion.div>

          {/* Title + star */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 32 }}>
            <div
              style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: "clamp(26px, 3vw, 44px)",
                lineHeight: 1.15,
                fontWeight: 400,
                color: "#F7F5F6",
              }}
            >
              {["A ARTISTA POR", "TRÁS DO TRAÇO"].map((line, i) => (
                <div key={i} style={{ overflow: "hidden" }}>
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={inView ? { y: 0 } : {}}
                    transition={{ duration: 1, delay: 0.2 + i * 0.15, ease }}
                  >
                    {line}
                  </motion.div>
                </div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ marginTop: 6 }}
            >
              <StarGlyph size={12} color="#A898AA" pulse />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.6, ease }}
            style={{
              fontFamily: '"Hanken Grotesk", sans-serif',
              fontSize: 15,
              lineHeight: 1.65,
              fontWeight: 300,
              color: "#BAB1BA",
              marginBottom: 40,
              maxWidth: 420,
            }}
          >
            Karina Sarte é artista e tatuadora autoral. Seu trabalho mistura botânica, sumiê, linhas
            livres e símbolos delicados em composições pensadas para o corpo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8, ease }}
          >
            <a
              href="https://www.instagram.com/karina.sarte"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#A898AA",
                textDecoration: "none",
                borderBottom: "0.5px solid rgba(168,152,170,0.4)",
                paddingBottom: 4,
                cursor: "none",
              }}
            >
              @karina.sarte
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
