export type PublishStatus = "Publicado" | "Rascunho" | "Oculto";
export type FlashStatus = "Disponível" | "Reservado" | "Tatuado" | "Oculto";

export type BaseItem = {
  id: string;
  order: number;
  active: boolean;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  imageUrl?: string;
  imageKey?: string;
  [key: string]: unknown;
};

export type PortfolioItem = BaseItem & {
  category: string;
  status: PublishStatus;
  bodyLocation: string;
  style: string;
  featured: boolean;
};

export type FlashTattoo = BaseItem & {
  status: FlashStatus;
  price: string;
  size: string;
};

/** Textos fixos da página /flash-tattoos (frontend/src/app/App.tsx): só o hero — o resto vem da coleção FlashTattoo. */
export type FlashPageDocument = {
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  heroImageUrl: string;
  hiddenSections?: string[];
};

/** Textos fixos da página /portfolio (frontend/src/app/App.tsx): só o hero — o resto vem da coleção PortfolioItem. */
export type PortfolioPageDocument = {
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  heroImageUrl: string;
  hiddenSections?: string[];
};

export type ProductItem = BaseItem & {
  category: string;
  status: PublishStatus;
  price: string;
  whatsappMessage: string;
  link: string;
};

/** Textos fixos da página /produtos (frontend/src/app/App.tsx): hero → CTA final. */
export type ProductsPageDocument = {
  heroKicker: string;
  heroTitle: string;
  heroText1: string;
  heroText2: string;
  heroButton: string;
  heroImageUrl: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  hiddenSections?: string[];
};

export type ReformulationItem = BaseItem & {
  category: string;
  status: PublishStatus;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeImageKey?: string;
  afterImageKey?: string;
  beforeVideoUrl?: string;
  afterVideoUrl?: string;
  beforeVideoKey?: string;
  afterVideoKey?: string;
  problem: string;
  solution: string;
  internalNote: string;
};

export type FaqItem = BaseItem & {
  answer: string;
  category: string;
  status: PublishStatus;
};

export type MediaItem = BaseItem & {
  category: string;
  type: string;
  publicUrl: string;
  usage: string;
};

export type LinkButton = { id: string; label: string; url: string; icon: string; active: boolean; order: number };
export type LinkHighlight = { id: string; title: string; text: string; url: string; active: boolean; order?: number };
export type LinkBioChip = { id: string; label: string; active: boolean; order: number };
export type LinkBioTestimonial = { id: string; text: string; active: boolean; order: number };

/** Card editável das seções Serviços e Coleções da Home. */
export type HomeCard = { id: string; title: string; text: string; url: string; cta: string; imageUrl?: string; active: boolean; order: number };
/** Etapa do fluxo "01 · Referência" do bloco Processo criativo. */
export type HomeStep = { id: string; label: string; active: boolean; order: number };

/**
 * Espelha as seções reais da home (frontend/src/app/App.tsx):
 * hero → processo criativo → serviços → portfólio → coleções → youtube → CTA.
 */
export type HomeDocument = {
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  heroButton: string;
  heroButtonUrl: string;
  heroSecondaryButton: string;
  heroSecondaryUrl: string;
  heroImageUrl: string;

  processEyebrow: string;
  processTitle: string;
  processText: string;
  processButton: string;
  processButtonUrl: string;
  processImageUrl: string;
  processPortraitUrl: string;
  processSteps: HomeStep[];

  servicesEyebrow: string;
  servicesTitle: string;
  servicesText: string;
  serviceCards: HomeCard[];

  portfolioEyebrow: string;
  portfolioTitle: string;
  portfolioText: string;
  portfolioMode: "automatico" | "manual";
  portfolioIds: string[];

  collectionsEyebrow: string;
  collectionsTitle: string;
  collectionsText: string;
  collectionsButton: string;
  collectionCards: HomeCard[];

  youtubeEyebrow: string;
  youtubeTitle: string;
  youtubeText: string;
  youtubeButton: string;
  youtubeUrl: string;
  youtubeMeta: string;
  youtubeThumbUrl: string;
  youtubeTrailerUrl: string;
  youtubeActive: boolean;

  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  ctaButtonUrl: string;
  hiddenSections?: string[];
};
export type ReformulationCard = { id: string; title: string; text: string; active: boolean; order: number };
/** Item da lista "Pontos avaliados na reformulação". */
export type ReformulationPoint = { id: string; label: string; active: boolean; order: number };

/**
 * Textos fixos da página /reformulacoes (frontend/src/app/App.tsx):
 * hero → introdução → portfólio de casos → possibilidades → CTA.
 *
 * Os casos em si ficam na coleção `reformulacoes` (ReformulationItem).
 *
 * Nem todo campo tem editor na tela: os títulos da grade de casos e a faixa final
 * são fixos hoje, mas continuam aqui porque a prévia precisa renderizá-los.
 */
export type ReformulationsDocument = {
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  heroButton: string;
  heroButtonUrl: string;
  heroImageUrl: string;

  introEyebrow: string;
  introTitle: string;
  introText: string;
  panelEyebrow: string;
  panelTextOne: string;
  panelTextTwo: string;
  panelPoints: ReformulationPoint[];

  portfolioEyebrow: string;
  portfolioTitle: string;
  portfolioText: string;
  caseNote: string;

  possibilitiesEyebrow: string;
  possibilitiesTitle: string;
  possibilitiesText: string;
  possibilityCards: ReformulationCard[];

  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  ctaButtonUrl: string;
  hiddenSections?: string[];
};

export type AboutApproachCard = {
  id: string;
  active: boolean;
  order: number;
  title: string;
  text: string;
};

export type AboutStudioStep = {
  id: string;
  active: boolean;
  order: number;
  label: string;
  title: string;
  text: string;
  imageUrl: string;
};

export type AboutDocument = {
  eyebrow: string;
  title: string;
  intro: string;
  heroImageUrl: string;
  biography: string;
  approachCards: AboutApproachCard[];
  imageUrl: string;
  quote: string;
  behindScenesImageUrl: string;
  behindScenesCaption: string;
  studioInviteImageUrl: string;
  studioTourSteps: AboutStudioStep[];
  hiddenSections?: string[];
};

export type BackstageDocument = {
  eyebrow: string;
  title: string;
  intro: string;
  videoUrl: string;
  videoPoster: string;
  processTitle: string;
  processText: string;
  active: boolean;
};

export type LinkBioDocument = {
  eyebrow: string;
  name: string;
  bio: string;
  avatarUrl: string;
  backgroundUrl: string;
  instagram: string;
  footerLabel: string;
  footerUrl: string;
  buttons: LinkButton[];
  highlights: LinkHighlight[];

  stylesLabel: string;
  stylesTitle: string;
  stylesText: string;
  styleChips: LinkBioChip[];

  flashLabel: string;
  flashTitle: string;
  flashText: string;
  flashCta: string;

  testimonialsLabel: string;
  testimonialsTitle: string;
  testimonialsCta: string;
  testimonials: LinkBioTestimonial[];

  studioLabel: string;
  studioTitle: string;
  studioText: string;
  studioImageUrl: string;
  studioButton: string;
  studioButtonUrl: string;

  finalTitle: string;
  finalText: string;
  finalButton: string;
};

export type BudgetPageDocument = {
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  heroImageUrl: string;

  introEyebrow: string;
  introTitle: string;
  introText: string;

  stepOneTitle: string;
  stepOneText: string;
  stepTwoTitle: string;
  stepTwoText: string;
  stepThreeTitle: string;
  stepThreeText: string;

  formEyebrow: string;
  formTitle: string;
  submitHelper: string;
  submitButton: string;
  whatsappIntro: string;
  hiddenSections?: string[];
};

export type SettingsDocument = {
  siteName: string;
  city: string;
  whatsapp: string;
  instagram: string;
  portfolioUrl: string;
  seoTitle: string;
  seoDescription: string;
  shareImageUrl: string;
  whatsappBudget: string;
  whatsappFlash: string;
  whatsappProducts: string;
  whatsappReformulation: string;
};

export type SiteModeDocument = {
  developmentMode: boolean;
  developmentEyebrow: string;
  developmentTitle: string;
  developmentText: string;
  developmentImageUrl: string;
  developmentButton: string;
  developmentButtonUrl: string;
};
