import { Link } from "react-router";
import { StarGlyph } from "./StarGlyph";

const pageLinks = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Flash Tattoos", href: "/flash-tattoos" },
  { label: "Produtos", href: "/produtos" },
  { label: "Cuidados", href: "/cuidados" },
  { label: "FAQ", href: "/faq" },
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Depoimentos", href: "/depoimentos" },
  { label: "Orçamento", href: "/orcamento" },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/karina.sarte" },
  { label: "WhatsApp", href: "https://wa.me/5521990724477" },
  { label: "E-mail", href: "mailto:kah@kahsarte.com" },
];

export function Footer() {
  return (
    <footer className="ks-footer">
      <div className="ks-footer-inner">
        <Link to="/" className="ks-footer-brand">
          <StarGlyph size={7} color="#B05574" />
          <span>Karina Sarte Tattoo</span>
        </Link>

        <nav className="ks-footer-nav" aria-label="Navegação do site">
          {pageLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ks-footer-bottom">
          <span className="ks-footer-copy">© 2026 Karina Sarte Tattoo · Teresópolis, RJ</span>
          <div className="ks-footer-social">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
