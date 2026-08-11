import { createRemoteDocumentStore, createRemoteRepository } from "./remoteStore";
import {
  mockAbout,
  mockBudgetPage,
  mockFlashPage,
  mockHome,
  mockLinkBio,
  mockPortfolioPage,
  mockProductsPage,
  mockReformulacoesTextos,
  mockSiteMode,
} from "./mocks";

export const portfolioStore = createRemoteRepository("portfolio", []);
export const flashStore = createRemoteRepository("flash-tattoos", []);
export const productsStore = createRemoteRepository("produtos", []);
export const reformulationsStore = createRemoteRepository("reformulacoes", []);
export const faqStore = createRemoteRepository("faq", []);

export const homeStore = createRemoteDocumentStore("home", mockHome);
export const flashPageStore = createRemoteDocumentStore("flash-page", mockFlashPage);
export const portfolioPageStore = createRemoteDocumentStore("portfolio-page", mockPortfolioPage);
export const productsPageStore = createRemoteDocumentStore("products-page", mockProductsPage);
export const aboutStore = createRemoteDocumentStore("sobre", mockAbout);
export const reformulationsTextStore = createRemoteDocumentStore("reformulacoes-textos", mockReformulacoesTextos);
export const linkBioStore = createRemoteDocumentStore("link-bio", mockLinkBio);
export const budgetPageStore = createRemoteDocumentStore("budget-page", mockBudgetPage);
export const siteModeStore = createRemoteDocumentStore("site-mode", mockSiteMode);
