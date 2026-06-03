import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { StarGlyph } from "./StarGlyph";
import { lockScroll, subscribeLenisScroll, unlockScroll } from "../scroll";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Flash Tattoos", href: "/flash-tattoos" },
  { label: "Produtos", href: "/produtos" },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => subscribeLenisScroll((scroll) => setScrolled(scroll > 60)), []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    lockScroll();
    return () => unlockScroll();
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
        className={`ks-header${scrolled ? " is-scrolled" : ""}${menuOpen ? " is-open" : ""}`}
      >
        <Link to="/" className="ks-logo" aria-label="Karina Sarte Tattoo">
          <StarGlyph size={8} color="#B05574" />
          <span>Karina Sarte Tattoo</span>
        </Link>

        <nav className="ks-desktop-nav">
          {navLinks.map((link) => (
            <NavItem key={link.href} {...link} active={location.pathname === link.href} />
          ))}
          <Link className="ks-nav-cta" to="/orcamento">
            Quero um orçamento
          </Link>
        </nav>

        <motion.button
          className="ks-menu-button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.15, ease: EASE }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </motion.button>
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
              <StarGlyph size={40} color="#B05574" />
            </div>
            <nav>
              {[...navLinks, { label: "Orçamento", href: "/orcamento" }].map((link, i) => (
                <MobileNavLink
                  key={link.href}
                  {...link}
                  index={i}
                  active={location.pathname === link.href}
                  onNavigate={() => setMenuOpen(false)}
                />
              ))}
            </nav>
            <div className="ks-mobile-note">Tatuagens autorais · Teresópolis, RJ</div>
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
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      to={href}
      className={`ks-nav-item${active ? " active" : ""}`}
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

const MotionLink = motion.create(Link);

function MobileNavLink({
  label,
  href,
  index,
  active,
  onNavigate,
}: {
  label: string;
  href: string;
  index: number;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.06, ease: EASE }}
    >
      <MotionLink
        to={href}
        className={`ks-mobile-nav-link${active ? " active" : ""}`}
        onClick={onNavigate}
        whileHover={{ x: 8 }}
        whileTap={{ scale: 0.98, x: 12 }}
        transition={{ duration: 0.2, ease: EASE }}
      >
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{label}</strong>
      </MotionLink>
    </motion.div>
  );
}
