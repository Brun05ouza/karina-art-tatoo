import { Link } from "react-router";
import { motion } from "motion/react";
import { BrandStar } from "./BrandStar";
import { StarGlyph } from "./StarGlyph";
import { isNavPathVisible, useNavVisibility } from "../nav-visibility";
import { SITE } from "../seo";
import { useWhatsappPhone, whatsappHref } from "../site-settings";

const EASE = [0.22, 1, 0.36, 1] as const;

const siteLinks = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Reformulações", href: "/reformulacoes" },
  { label: "Flash Tattoos", href: "/flash-tattoos" },
  { label: "Produtos", href: "/produtos" },
  { label: "Orçamento", href: "/orcamento" },
];

const WA_FOOTER_MSG = "Oi, Karina! Vim pelo site e queria conversar sobre uma tattoo.";

const developerPortfolio = "https://brunosouza.dev.br";

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.522 5.851L.054 23.25a.75.75 0 0 0 .916.916l5.453-1.474A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.964-1.363l-.357-.214-3.685.997.985-3.594-.234-.371A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}

function FooterNavLink({ label, href, external }: { label: string; href: string; external?: boolean }) {
  const className = "ks-footer-link";
  if (external) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        <span>{label}</span>
      </a>
    );
  }
  return (
    <Link className={className} to={href}>
      <span>{label}</span>
    </Link>
  );
}

export function Footer() {
  const navVisibility = useNavVisibility();
  const phone = useWhatsappPhone();
  const waHref = whatsappHref(WA_FOOTER_MSG, phone);
  const visibleSiteLinks = siteLinks.filter((link) => isNavPathVisible(navVisibility, link.href));
  const contactLinks = [
    { label: "Instagram", href: SITE.instagram, external: true },
    { label: "WhatsApp", href: waHref, external: true },
    { label: "E-mail", href: `mailto:${SITE.email}`, external: true },
  ];

  return (
    <footer className="ks-footer">
      <div className="ks-footer-texture" aria-hidden="true" />
      <BrandStar variant={2} size={380} className="ks-footer-star ks-footer-star-lg" />
      <BrandStar variant={3} size={120} className="ks-footer-star ks-footer-star-md" />
      <BrandStar variant={2} size={54} className="ks-footer-star ks-footer-star-sm-1" />
      <BrandStar variant={3} size={36} className="ks-footer-star ks-footer-star-sm-2" />
      <BrandStar variant={2} size={28} className="ks-footer-star ks-footer-star-sm-3" />

      <div className="ks-footer-inner">
        <motion.div
          className="ks-footer-cta"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <BrandStar variant={3} size={88} className="ks-footer-cta-star" />
          <div className="ks-footer-cta-copy">
            <Link to="/" className="ks-footer-cta-brand">
              <StarGlyph size={8} color="#5B4964" />
              <span>Karina Sarte</span>
            </Link>
            <p>
              Pronta para transformar sua ideia em um projeto com intenção e cuidado.
            </p>
          </div>
          <div className="ks-footer-cta-action">
            <h2>Vamos conversar sobre sua próxima tattoo?</h2>
            <p>
              Envie sua ideia, referências ou dúvidas e vamos transformar isso em um projeto com
              intenção.
            </p>
            <a
              className="ks-footer-whatsapp"
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar com a Karina Sarte pelo WhatsApp"
              data-cursor="cta"
            >
              <WhatsAppIcon />
              Falar com a Karina Sarte
            </a>
          </div>
        </motion.div>

        <div className="ks-footer-divider" aria-hidden="true">
          <span />
          <BrandStar variant={2} size={22} />
          <span />
        </div>

        <motion.div
          className="ks-footer-columns"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-8%" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <motion.div
            className="ks-footer-column"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
            }}
          >
            <Link to="/" className="ks-footer-brand">
              <StarGlyph size={7} color="#5B4964" />
              <span>Karina Sarte</span>
            </Link>
            <p className="ks-footer-brand-text">
              Arte na pele com identidade, cuidado e intenção.
            </p>
            <p className="ks-footer-brand-place">Teresópolis, RJ</p>
          </motion.div>

          <motion.nav
            className="ks-footer-column"
            aria-label="Site"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
            }}
          >
            <h3 className="ks-footer-column-title">Site</h3>
            {visibleSiteLinks.map((link) => (
              <FooterNavLink key={link.href} {...link} />
            ))}
          </motion.nav>

          <motion.div
            className="ks-footer-column"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
            }}
          >
            <h3 className="ks-footer-column-title">Contato</h3>
            {contactLinks.map((link) => (
              <FooterNavLink key={link.label} {...link} />
            ))}
          </motion.div>
        </motion.div>

        <div className="ks-footer-bottom">
          <span className="ks-footer-copy">© 2026 Karina Sarte — Teresópolis, RJ</span>
          <span className="ks-footer-developer">
            Desenvolvido por{" "}
            <a href={developerPortfolio} target="_blank" rel="noopener noreferrer">
              Bruno Souza — Portfólio
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
