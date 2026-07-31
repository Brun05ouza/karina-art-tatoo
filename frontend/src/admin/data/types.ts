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

export type ProductItem = BaseItem & {
  category: string;
  status: PublishStatus;
  price: string;
  whatsappMessage: string;
  link: string;
};

export type ReformulationItem = BaseItem & {
  category: string;
  status: PublishStatus;
  beforeImageUrl: string;
  afterImageUrl: string;
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
export type LinkHighlight = { id: string; title: string; text: string; url: string; active: boolean };

/** Card editável das seções Serviços e Coleções da Home. */
export type HomeCard = { id: string; title: string; text: string; url: string; cta: string; active: boolean; order: number };
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
  youtubeActive: boolean;

  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  ctaButtonUrl: string;
};

export type AboutDocument = {
  eyebrow: string;
  title: string;
  intro: string;
  biography: string;
  approachTitle: string;
  approachText: string;
  imageUrl: string;
  quote: string;
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
  name: string;
  bio: string;
  avatarUrl: string;
  instagram: string;
  buttons: LinkButton[];
  highlights: LinkHighlight[];
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
