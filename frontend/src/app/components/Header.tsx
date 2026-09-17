import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { StarGlyph } from "./StarGlyph";
import { isNavPathVisible, useNavVisibility } from "../nav-visibility";
import { lockScroll, unlockScroll } from "../scroll";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Reformulações", href: "/reformulacoes" },
  { label: "Flash Tattoos", href: "/flash-tattoos" },
  { label: "Produtos", href: "/produtos" },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type HeroTone = "light" | "dark";

export function Header() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [heroTone, setHeroTone] = useState<HeroTone>("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const location = useLocation();
  const navVisibility = useNavVisibility();
  const visibleLinks = navLinks.filter((link) => isNavPathVisible(navVisibility, link.href));
  const showBudgetCta = isNavPathVisible(navVisibility, "/orcamento");

  // A barra muda de estado uma única vez perto do topo. A histerese evita
  // oscilações e deixa a interpolação visual inteiramente a cargo do CSS.
  //
  // Sem .ks-home-hero / .ks-page-hero a pílula começa ligada (is-scrolled).
  // Não é condição de rota: /orcamento entra aqui de propósito, porque
  // aquela página não tem hero de viewport. is-over-hero só serve para
  // contrastar sobre foto; numa página clara o estado transparente vira
  // barra reta e empurra o CTA contra a borda.
  useLayoutEffect(() => {
    const hero = document.querySelector<HTMLElement>(".ks-home-hero, .ks-page-hero");
    if (!hero) {
      setScrolled(true);
      setHeroTone("light");
      return;
    }

    setHeroTone(hero.dataset.heroTone === "dark" ? "dark" : "light");
    setScrolled(window.scrollY > 56);
  }, [location.pathname]);

  // Depois do fade-in do header, a pílula “encaixa” no hero claro.
  useEffect(() => {
    setSettled(false);
    if (reduceMotion) {
      setSettled(true);
      return;
    }
    const timer = window.setTimeout(() => setSettled(true), 480);
    return () => window.clearTimeout(timer);
  }, [location.pathname, reduceMotion]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled((current) => (current ? latest > 24 : latest > 56));
  });

  useEffect(() => {
    if (!menuOpen) return undefined;

    lockScroll();
    return () => unlockScroll();
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const mobileLinks = [
    ...visibleLinks,
    ...(showBudgetCta ? [{ label: "Orçamento", href: "/orcamento" }] : []),
  ];

  const onDark = !scrolled && !menuOpen && heroTone === "dark";
  const headerClass = [
    "ks-header",
    scrolled ? "is-scrolled" : "is-over-hero",
    onDark ? "is-on-dark" : "",
    menuOpen ? "is-open" : "",
    settled ? "is-settled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.1, ease: EASE }}
        className={headerClass}
      >
        <div className="ks-header-inner">
          <Link to="/" className="ks-logo" aria-label="Karina Sarte">
            <StarGlyph size={8} color="currentColor" />
            <span>Karina Sarte</span>
          </Link>

          <nav className="ks-desktop-nav">
            {visibleLinks.map((link) => (
              <NavItem key={link.href} {...link} active={location.pathname === link.href} />
            ))}
            {showBudgetCta ? (
              <Link className="ks-nav-cta" to="/orcamento" aria-label="Quero um orçamento">
                <span className="ks-nav-cta-full">Quero um orçamento</span>
                <span className="ks-nav-cta-short">Orçamento</span>
              </Link>
            ) : null}
          </nav>

          <motion.button
            className="ks-menu-button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.15, ease: EASE }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? "close" : "open"}
                initial={reduceMotion ? false : { opacity: 0, rotate: -20, scale: 0.82 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, rotate: 20, scale: 0.82 }}
                transition={{ duration: reduceMotion ? 0 : 0.16, ease: EASE }}
                aria-hidden="true"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.38, ease: EASE }}
            className="ks-mobile-menu"
          >
            <div className="ks-mobile-star">
              <StarGlyph size={40} color="#806E85" />
            </div>
            <nav>
              {mobileLinks.map((link, i) => (
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0.12 : 0.4,
        delay: reduceMotion ? 0 : 0.08 + index * 0.045,
        ease: EASE,
      }}
    >
      <MotionLink
        to={href}
        className={`ks-mobile-nav-link${active ? " active" : ""}`}
        onClick={onNavigate}
        whileHover={reduceMotion ? undefined : { x: 8 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98, x: 12 }}
        transition={{ duration: 0.2, ease: EASE }}
      >
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{label}</strong>
      </MotionLink>
    </motion.div>
  );
}
