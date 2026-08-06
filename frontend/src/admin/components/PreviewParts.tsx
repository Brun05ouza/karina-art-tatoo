import { BrandStar } from "../../app/components/BrandStar";

/**
 * Pedaços decorativos que as prévias precisam reproduzir do site.
 *
 * Eles existem em frontend/src/app/App.tsx (PageHero, StarSprinkle,
 * SectionStarBreak), mas App.tsx registra GSAP e importa Lenis no corpo do
 * módulo — importar de lá arrastaria as duas bibliotecas para o bundle do admin.
 * Por isso o markup é repetido aqui. Ao mudar App.tsx, mude também este arquivo.
 */

/** Estrelas decorativas do PageHero: o starfield grande + o StarSprinkle de 4 estrelas. */
export function PreviewHeroStars() {
  const sprinkle = [
    { variant: 2, size: 128 },
    { variant: 3, size: 92 },
    { variant: 2, size: 74 },
    { variant: 3, size: 52 },
  ] as const;

  return (
    <>
      <BrandStar variant={2} size={240} className="ks-page-hero-starfield" />
      <div className="ks-star-sprinkle ks-star-sprinkle-page-hero" aria-hidden="true">
        {sprinkle.map((star, index) => (
          <BrandStar
            key={`${star.variant}-${index}`}
            variant={star.variant}
            size={star.size}
            className={`ks-star-sprinkle-mark mark-${index + 1}`}
          />
        ))}
      </div>
    </>
  );
}

/** Divisória de estrelas entre seções (SectionStarBreak em App.tsx). */
export function PreviewStarBreak({ align }: { align: "left" | "right" | "center" }) {
  const assets = ["/assets/brand/star-karina-filled.png", "/assets/brand/star-karina-outline.png"];

  return (
    <div className={`ks-section-star-break ks-section-star-break-${align}`} aria-hidden="true">
      <div className="ks-section-star-break-field">
        {[0, 1, 0, 1].map((asset, index) => (
          <img
            key={`${align}-${index}`}
            className={`ks-section-star-break-star star-${index + 1}`}
            src={assets[asset]}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}
