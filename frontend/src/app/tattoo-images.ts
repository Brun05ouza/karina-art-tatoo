/**
 * Imagens locais do projeto.
 *
 * Mantemos este mapa centralizado para que novas fotos autorais possam ser
 * trocadas sem alterar os componentes que as consomem.
 */
const localImages = {
  hero: "/assets/hero.jpeg",
  tattoo: "/assets/hero-home.png",
  artist: "/assets/karina-sarte.png",
  /** Retrato vertical (1290x2293). O aspecto 0,563 casa com o molde de janela
   *  em arco (29/54 = 0,537) — o artist quadrado era recortado pela metade. */
  artistVertical: "/assets/karina-sarte-retrato.jpg",
  /** Detalhe de mão, unhas, anéis e a tattoo de estrela no dedo (1290x2293).
   *  Traz a marca "© Meta AI" no canto inferior direito; o enquadramento do
   *  herói é escolhido para deixá-la fora do recorte. */
  artistDetail: "/assets/karina-sarte-detalhe.jpg",
  process: "/assets/process/art-process-poster.jpg",
  studioWide: "/assets/session/frame-120.webp",
  studioDetail: "/assets/session/frame-241.webp",
} as const;

export const tattooImages = {
  /** Home / destaque */
  hero: localImages.hero,
  sessionWide: localImages.studioWide,
  sessionClose: localImages.process,
  tattooInProgress: localImages.artist,
  lineDetail: localImages.tattoo,
  artistTattooing: localImages.artistVertical,
  /** Usado na janela em arco do Processo criativo, que pede foto vertical. */
  artistPortrait: localImages.artistVertical,
  /** Coluna de imagem do Processo criativo e herói do Sobre. */
  artistDetail: localImages.artistDetail,

  /** Portfólio / galeria */
  fineLineBotanical: localImages.tattoo,
  ornamental: localImages.tattoo,
  blackworkOrganic: localImages.tattoo,
  minimalSymbols: localImages.tattoo,
  floralHealed: localImages.tattoo,
  flashSheet: localImages.tattoo,
  flashDesign: localImages.tattoo,
  healedWork: localImages.tattoo,
  armTattoo: localImages.tattoo,
  legTattoo: localImages.tattoo,
  detailEditorial: localImages.tattoo,
  healedDetail: localImages.tattoo,

  /** Heróis de páginas internas */
  heroPortfolio: localImages.tattoo,
  heroReformulacoes: localImages.tattoo,
  heroFlash: localImages.tattoo,
  heroAbout: localImages.artistDetail,
  heroProcess: localImages.process,
  heroCare: localImages.studioWide,
  heroTestimonials: localImages.tattoo,
  heroFaq: localImages.studioDetail,
  heroBudget: localImages.process,
  productsHero: localImages.tattoo,

  /** Cards serviços / produtos (home + catálogo) */
  cardAutoral: localImages.tattoo,
  cardFlash: localImages.tattoo,
  cardPrint: localImages.tattoo,
  cardCare: localImages.process,
  cardKits: localImages.studioDetail,
} as const;

export type TattooImageKey = keyof typeof tattooImages;

/** URL para backgrounds em CSS */
export const tattooImagesCss = {
  productsHero: tattooImages.productsHero,
} as const;
