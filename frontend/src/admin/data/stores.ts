import { createLocalDocumentStore, createLocalRepository } from "./localStore";
import { createRemoteDocumentStore } from "./remoteStore";
import {
  mockAbout,
  mockBastidores,
  mockFaqs,
  mockFlashPage,
  mockFlashTattoos,
  mockHome,
  mockLinkBio,
  mockMediaItems,
  mockPortfolioItems,
  mockPortfolioPage,
  mockProducts,
  mockProductsPage,
  mockReformulacoes,
  mockReformulacoesTextos,
  mockSettings,
} from "./mocks";

export const portfolioStore = createLocalRepository("portfolio", mockPortfolioItems);
export const flashStore = createLocalRepository("flash-tattoos", mockFlashTattoos);
export const productsStore = createLocalRepository("produtos", mockProducts);
export const reformulationsStore = createLocalRepository("reformulacoes", mockReformulacoes);
export const faqStore = createLocalRepository("faq", mockFaqs);
export const mediaStore = createLocalRepository("midia", mockMediaItems);

export const homeStore = createRemoteDocumentStore("home", mockHome);
export const flashPageStore = createLocalDocumentStore("flash-page", mockFlashPage);
export const portfolioPageStore = createLocalDocumentStore("portfolio-page", mockPortfolioPage);
export const productsPageStore = createLocalDocumentStore("products-page", mockProductsPage);
export const aboutStore = createRemoteDocumentStore("sobre", mockAbout);
export const reformulationsTextStore = createLocalDocumentStore("reformulacoes-textos", mockReformulacoesTextos);
export const backstageStore = createLocalDocumentStore("bastidores", mockBastidores);
export const linkBioStore = createLocalDocumentStore("link-bio", mockLinkBio);
export const settingsStore = createLocalDocumentStore("configuracoes", mockSettings);
