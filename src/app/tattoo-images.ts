/**

 * Mocks Unsplash (URLs testadas) — prioridade: tatuagem na pele, sessão ou flash.

 * Substituir por fotos reais da Karina Sarte quando tiver o acervo.

 */

const u = (id: string, w = 1080) =>

  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;



/** IDs estáveis — busca Unsplash "tattoo" */

const id = {

  fineLineSkin: "1726924244999-95eb16972c9d",

  sessionWide: "1568515045052-f9a854d70bfd",

  sessionArm: "1565058379802-bbe93b2f703a",

  sessionBw: "1552627019-947c3789ffb5",

  inkingArm: "1745777697297-8cb066d8268b",

  ornamental: "1712256877407-c5181b2cfa89",

  armWristFlash: "1542727365-19732a80dcfd",

  minimalSymbols: "1499001720097-29ee4e4fc261",

  floralArm: "1562962230-16e4623d36e6",

  floralBack: "1598371839696-5c5bb00bdc28",

  blackFloral: "1562379825-415aea84ebcf",

  armPiece: "1597852075234-fd721ac361d3",

  legPiece: "1601848714157-d845bb5c11ff",

  sessionAlt: "1564426622559-5af68da63b96",

  tattooNeon: "1516008684536-605574d804ce",

  detailWork: "1776843013036-71e03b131c7d",

  healedClose: "1703074907714-4cd6a222fc39",

} as const;



export const tattooImages = {

  /** Home / destaque */

  hero: "/assets/hero-home.png",

  sessionWide: u(id.sessionWide, 2000),

  sessionClose: u(id.sessionArm, 1800),

  tattooInProgress: u(id.sessionBw, 1400),

  lineDetail: u(id.inkingArm, 600),

  artistTattooing: u(id.sessionWide, 900),



  /** Portfólio / galeria */

  fineLineBotanical: u(id.fineLineSkin),

  ornamental: u(id.ornamental),

  blackworkOrganic: u(id.blackFloral),

  minimalSymbols: u(id.minimalSymbols),

  floralHealed: u(id.floralArm),

  flashSheet: u(id.armWristFlash),

  flashDesign: u(id.sessionAlt),

  healedWork: u(id.floralBack),

  armTattoo: u(id.armPiece),

  legTattoo: u(id.legPiece),

  detailEditorial: u(id.detailWork),

  healedDetail: u(id.healedClose),



  /** Heróis de páginas internas */

  heroPortfolio: u(id.fineLineSkin, 1800),

  heroFlash: u(id.armWristFlash, 1800),

  heroAbout: u(id.sessionArm, 1800),

  heroProcess: u(id.sessionWide, 1800),

  heroCare: u(id.sessionArm, 1800),

  heroTestimonials: u(id.armPiece, 1800),

  heroFaq: u(id.tattooNeon, 1800),

  heroBudget: u(id.inkingArm, 1800),

  productsHero: u(id.armWristFlash, 1800),



  /** Cards serviços / produtos (home + catálogo) */

  cardAutoral: u(id.inkingArm, 800),

  cardFlash: u(id.armWristFlash, 800),

  cardPrint: u(id.floralArm, 800),

  cardCare: u(id.sessionArm, 800),

  cardKits: u(id.legPiece, 800),

} as const;



export type TattooImageKey = keyof typeof tattooImages;



/** URL para backgrounds em CSS */

export const tattooImagesCss = {

  productsHero: tattooImages.productsHero,

} as const;


