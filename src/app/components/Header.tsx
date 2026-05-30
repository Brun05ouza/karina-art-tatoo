import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StarGlyph } from "./StarGlyph";

const navLinks = [
  { label: "manifesto", href: "#manifesto" },
  { label: "galeria", href: "#galeria" },
  { label: "processo", href: "#processo" },
  { label: "agendar", href: "#agendar" },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, menuOpen ? 400 : 0);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(24px, 5vw, 64px)",
          height: 56,
          background: scrolled || menuOpen ? "rgba(13,14,13,0.95)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(8px)" : "none",
          borderBottom: scrolled && !menuOpen ? "1px solid rgba(242,237,226,0.06)" : "1px solid transparent",
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => scrollTo("#hero")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          <StarGlyph size={8} color="#e9c082" />
          <span
            style={{
              fontFamily: '"Bodoni Moda", serif',
              fontSize: 13,
              color: "#F2EDE2",
              letterSpacing: "0.1em",
            }}
          >
            KAH SARTE
          </span>
        </button>

        {/* Desktop nav */}
        <nav
          className="ks-hide-mobile"
          style={{ display: "flex", gap: "clamp(20px, 3vw, 40px)" }}
        >
          {navLinks.map((link) => (
            <NavLink key={link.label} label={link.label} onClick={() => scrollTo(link.href)} />
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="block md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          style={{
            background: "none",
            border: "none",
            padding: "8px 0",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            width: 24,
          }}
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ display: "block", height: "0.5px", background: "#F2EDE2", transformOrigin: "center" }}
          />
          <motion.span
            animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.25 }}
            style={{ display: "block", height: "0.5px", background: "#F2EDE2" }}
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ display: "block", height: "0.5px", background: "#F2EDE2", transformOrigin: "center" }}
          />
        </button>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 8999,
              background: "#0d0e0d",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "0 clamp(24px, 8vw, 48px)",
            }}
          >
            {/* Decorative star */}
            <div style={{ position: "absolute", top: 80, right: 32, opacity: 0.4 }}>
              <StarGlyph size={40} color="#e9c082" />
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: EASE }}
                >
                  <button
                    onClick={() => scrollTo(link.href)}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 16,
                      background: "none",
                      border: "none",
                      padding: "16px 0",
                      borderBottom: "0.5px solid rgba(242,237,226,0.06)",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 8,
                        letterSpacing: "0.2em",
                        color: "#49473f",
                        minWidth: 24,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: '"Bodoni Moda", serif',
                        fontSize: "clamp(32px, 10vw, 52px)",
                        fontWeight: 400,
                        color: "#F2EDE2",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {link.label}
                    </span>
                  </button>
                </motion.div>
              ))}
            </nav>

            {/* Footer info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{ marginTop: 48 }}
            >
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  color: "#49473f",
                  textTransform: "uppercase",
                }}
              >
                BOTÂNICA · FREEHAND · SUMIÊ
              </div>
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  color: "#49473f",
                  marginTop: 8,
                }}
              >
                TERESÓPOLIS — RJ
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor="link"
      style={{
        background: "none",
        border: "none",
        padding: 0,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: hovered ? "#e9c082" : "#cac6bc",
        transition: "color 0.3s ease",
        position: "relative",
        cursor: "none",
      }}
    >
      {label}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          bottom: -2,
          left: 0,
          right: 0,
          height: "0.5px",
          background: "#e9c082",
          transformOrigin: "left",
        }}
      />
    </button>
  );
}
