import { createContext, useCallback, useContext, useEffect, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, Navigate } from "react-router";
import { X } from "lucide-react";
import { isNavPathVisible, normalizeNavPath, useNavVisibility, type NavVisibilityMap } from "../nav-visibility";
import { lockScroll, unlockScroll } from "../scroll";
import { StarGlyph } from "./StarGlyph";

const WHATSAPP = "https://wa.me/5521990724477";
const WA_MESSAGE =
  "Oi Karina! Vi no site uma sessão que ainda está em preparação e queria conversar sobre uma ideia ✨";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type ComingSoonContextValue = {
  openComingSoon: () => void;
  closeComingSoon: () => void;
  navVisibility: NavVisibilityMap;
};

const ComingSoonContext = createContext<ComingSoonContextValue | null>(null);

export function useComingSoon() {
  const value = useContext(ComingSoonContext);
  if (!value) throw new Error("useComingSoon precisa estar dentro de ComingSoonProvider");
  return value;
}

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navVisibility = useNavVisibility();

  const openComingSoon = useCallback(() => setOpen(true), []);
  const closeComingSoon = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    lockScroll();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <ComingSoonContext.Provider value={{ openComingSoon, closeComingSoon, navVisibility }}>
      {children}
      <ComingSoonModal open={open} onClose={closeComingSoon} />
    </ComingSoonContext.Provider>
  );
}

function ComingSoonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="ks-coming-soon"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ks-coming-soon-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <button type="button" className="ks-coming-soon-backdrop" aria-label="Fechar" onClick={onClose} />
          <motion.div
            className="ks-coming-soon-panel"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <button type="button" className="ks-coming-soon-close" onClick={onClose} aria-label="Fechar">
              <X size={18} />
            </button>
            <StarGlyph size={28} color="#806E85" className="ks-coming-soon-star" />
            <p className="ks-label-caps ks-coming-soon-eyebrow">Em preparação</p>
            <h2 id="ks-coming-soon-title">Opa, essa sessão ainda estou trabalhando para deixar ela perfeita.</h2>
            <p>Quer conversar comigo sobre alguma ideia?</p>
            <a
              className="ks-coming-soon-whatsapp"
              href={`${WHATSAPP}?text=${encodeURIComponent(WA_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="cta"
            >
              <WhatsAppGlyph />
              Conversar no WhatsApp
            </a>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Link interno que abre o modal se a página destino estiver oculta no admin. */
export function GuardedLink({
  to,
  className,
  children,
  ...rest
}: {
  to: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  const { openComingSoon, navVisibility } = useComingSoon();
  const path = normalizeNavPath(to);

  if (!isNavPathVisible(navVisibility, path)) {
    return (
      <a
        {...rest}
        href={to}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          openComingSoon();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className} {...rest}>
      {children}
    </Link>
  );
}

/** Quando a página CMS está oculta: modal + volta pra home. */
export function HiddenPageRedirect() {
  const { openComingSoon } = useComingSoon();

  useEffect(() => {
    openComingSoon();
  }, [openComingSoon]);

  return <Navigate to="/" replace />;
}

function WhatsAppGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.522 5.851L.054 23.25a.75.75 0 0 0 .916.916l5.453-1.474A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.964-1.363l-.357-.214-3.685.997.985-3.594-.234-.371A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}
