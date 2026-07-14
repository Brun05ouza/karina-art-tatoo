/**
 * Imagens locais do projeto.
 *
 * Mantemos este mapa centralizado para que novas fotos autorais possam ser
 * trocadas sem alterar os componentes que as consomem.
 */
const localImages = {
  tattoo: "/assets/hero-home.png",
  artist: "/assets/karina-sarte.png",
  process: "/assets/process/art-process-poster.jpg",
  studioWide: "/assets/session/frame-120.webp",
  studioDetail: "/assets/session/frame-241.webp",
} as const;

export const tattooImages = {
  /** Home / destaque */
  hero: localImages.tattoo,
  sessionWide: localImages.studioWide,
  sessionClose: localImages.process,
  tattooInProgress: localImages.artist,
  lineDetail: localImages.tattoo,
  artistTattooing: localImages.artist,
  artistPortrait: localImages.artist,

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
  heroFlash: localImages.tattoo,
  heroAbout: localImages.artist,
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
