import { StarGlyph } from "./StarGlyph";

const links = [
  { label: "INSTAGRAM", href: "https://www.instagram.com/karina.sarte" },
  { label: "WHATSAPP", href: "https://wa.me/5524999999999" },
  { label: "EMAIL", href: "mailto:kah@kahsarte.com" },
];

export function Footer() {
  return (
    <footer
      style={{
        background: "#0d0e0d",
        borderTop: "0.5px solid rgba(242,237,226,0.08)",
        padding: "clamp(40px, 6vw, 72px) clamp(24px, 5vw, 64px)",
      }}
    >
      <div
        className="ks-footer-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StarGlyph size={7} color="#e9c082" />
          <span
            style={{
              fontFamily: '"Bodoni Moda", serif',
              fontSize: 13,
              color: "#F2EDE2",
              letterSpacing: "0.08em",
            }}
          >
            KAH SARTE
          </span>
        </div>

        {/* Copyright */}
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 8,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#49473f",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          © 2026 KAH SARTE
        </span>

        {/* Links */}
        <div
          className="ks-footer-right"
          style={{
            display: "flex",
            gap: "clamp(16px, 2.5vw, 32px)",
            justifyContent: "flex-end",
          }}
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 8,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#949087",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#e9c082")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#949087")}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
