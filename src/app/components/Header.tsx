import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { StarGlyph } from "./StarGlyph";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Produtos", href: "/produtos", featured: true },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
        className="ks-header"
        style={{
          background: scrolled || menuOpen ? "rgba(13,14,13,0.95)" : "linear-gradient(to bottom, rgba(13,14,13,0.62), transparent)",
          backdropFilter: scrolled || menuOpen ? "blur(10px)" : "none",
          borderBottom: scrolled && !menuOpen ? "1px solid rgba(242,237,226,0.06)" : "1px solid transparent",
        }}
      >
        <Link to="/" className="ks-logo" aria-label="Kah Sarte Tattoo">
          <StarGlyph size={8} color="#e9c082" />
          <span>KAH SARTE</span>
        </Link>

        <nav className="ks-desktop-nav">
          {navLinks.map((link) => (
            <NavItem key={link.href} {...link} active={location.pathname === link.href} />
          ))}
          <Link className="ks-nav-cta" to="/orcamento">
            Quero um orçamento
          </Link>
        </nav>

        <button
          className="ks-menu-button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="ks-mobile-menu"
          >
            <div className="ks-mobile-star">
              <StarGlyph size={40} color="#e9c082" />
            </div>
            <nav>
              {[...navLinks, { label: "Orçamento", href: "/orcamento" }].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.06, ease: EASE }}
                >
                  <Link to={link.href}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <strong>{link.label}</strong>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="ks-mobile-note">BOTÂNICA / FREEHAND / SUMIÊ</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({
  label,
  href,
  active,
  featured,
}: {
  label: string;
  href: string;
  active: boolean;
  featured?: boolean;
}) {
  return (
    <Link
      to={href}
      className={`ks-nav-item${active ? " active" : ""}${featured ? " featured" : ""}`}
      data-cursor="link"
    >
      {label}
      <motion.span
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      />
    </Link>
  );
}
