import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  HeartHandshake,
  Images,
  LinkIcon,
  Maximize2,
  Play,
  ShoppingBag,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Youtube,
} from "lucide-react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";

import { Preloader } from "./components/Preloader";
import { HoverProcessMedia } from "./components/HoverProcessMedia";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AdminShortcut } from "./components/AdminShortcut";
import { LinkBioLanding } from "./components/LinkBioLanding";
import { useFlashItems, useFlashPageContent } from "./flash-content";
import { useFaqItems } from "./faq-content";
import { galleryItems, PORTFOLIO_CATEGORIES, usePortfolioItems, usePortfolioPageContent, type PortfolioWork } from "./portfolio-works";
import { useProductItems, useProductsPageContent, type ProductCatalogItem } from "./products-content";
import { useReformulationCases, useReformulationsContent, type ReformulationCase } from "./reformulations-content";
import { useBudgetPageContent } from "./budget-content";
import { BrandStar } from "./components/BrandStar";
import { StarGlyph } from "./components/StarGlyph";
import { StencilCrosshair } from "./components/StencilCrosshair";
import { CustomCursor } from "./components/CustomCursor";
import { ComingSoonProvider, GuardedLink, HiddenPageRedirect, useComingSoon } from "./components/ComingSoonModal";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { isNavPathVisible } from "./nav-visibility";
import {
  observeScrollRoot,
  queueRefresh,
  refreshScrollMetrics,
  registerLenis,
  resetScrollPosition,
  lockScroll,
  unlockScroll,
  unregisterLenis,
  unobserveScrollRoot,
  pauseSmoothScroll,
  resumeSmoothScroll,
} from "./scroll";
import { useHomeContent, type HomeContent } from "./home-content";
import { useSiteModeContent, type SiteModeContent } from "./site-mode-content";
import { useAboutContent, type AboutStudioStep } from "./about-content";
import { applyPageSeo } from "./seo";
import { isSectionVisible, isPageVisible } from "./section-visibility";
import { useBootReady } from "./boot-ready";

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FLUID_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const WHATSAPP = "https://wa.me/5521990724477";

const WA_DEFAULT = "Oi, Karina! Vim pelo site e queria te contar uma ideia de tattoo.";
const WA_PRODUCTS = "Olá, Karina Sarte! Vim pelo site e queria saber mais sobre os produtos disponíveis.";

const ProductsNavContext = createContext<(() => void) | null>(null);
const PreloaderDoneContext = createContext(false);
const brandStarVariant = (index: number) => (index % 2 === 0 ? 2 : 3) as 2 | 3;
const looseStarAssets = [
  "/assets/brand/star-karina-filled.png",
  "/assets/brand/star-karina-outline.png",
] as const;

function StarSprinkle({ className = "", light = false }: { className?: string; light?: boolean }) {
  const stars = [
    { variant: 2, size: 128 },
    { variant: 3, size: 92 },
    { variant: 2, size: 74 },
    { variant: 3, size: 52 },
  ] as const;

  return (
    <div className={`ks-star-sprinkle${light ? " ks-star-sprinkle-light" : ""}${className ? " " + className : ""}`} aria-hidden="true">
      {stars.map((star, index) => (
        <BrandStar
          key={`${star.variant}-${index}`}
          variant={star.variant}
          size={star.size}
          className={`ks-star-sprinkle-mark mark-${index + 1}`}
        />
      ))}
    </div>
  );
}

function SectionStarBreak({
  align = "right",
  light = false,
  dense = false,
}: {
  align?: "left" | "right" | "center";
  light?: boolean;
  dense?: boolean;
}) {
  const assets = dense ? [0, 1, 0, 1, 0, 1] : [0, 1, 0, 1];

  return (
    <div
      className={`ks-section-star-break ks-section-star-break-${align}${light ? " ks-section-star-break-light" : ""}${dense ? " ks-section-star-break-dense" : ""}`}
      aria-hidden="true"
    >
      <div className="ks-section-star-break-field">
        {assets.map((assetIndex, index) => (
          <img
            key={`${align}-${dense ? "dense" : "std"}-${index}`}
            className={`ks-section-star-break-star star-${index + 1}`}
            src={looseStarAssets[assetIndex]}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}

const SECTION_INTRO_TITLES: Record<string, string> = {
  "/sobre": "Sobre a Karina Sarte",
  "/portfolio": "Portfólio",
  "/reformulacoes": "Reformulações",
  "/flash-tattoos": "Flash Tattoos",
  "/produtos": "Coleções da Karina Sarte",
};
const BUDGET_WHATSAPP_INTRO = "Oi, Karina! Vim pelo site e queria te contar uma ideia de tattoo ✨";

function productWhatsAppMessage(productName: string) {
  return `Olá, Karina Sarte! Vim pelo site e me interessei por ${productName}. Gostaria de saber mais.`;
}

function tattooChoiceMessage(tattooName: string) {
  return `Olá, Karina Sarte! Vim pelo site e escolhi a tattoo "${tattooName}". Gostaria de saber mais.`;
}


function tattooStatusClass(status: string) {
  const normalized = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (normalized === "reservado" || normalized === "tatuado" || normalized === "referencia") {
    return normalized;
  }
  return "";
}


const flashItems = [
  {
    name: "Floral lunar",
    status: "Disponível",
    text: "Composição delicada para braço, costela ou tornozelo.",
    img: "",
  },
  {
    name: "Ornamento estrela",
    status: "Reservado",
    text: "Linhas finas com presença mística e tamanho médio.",
    img: "",
  },
  {
    name: "Ramo livre",
    status: "Disponível",
    text: "Flash botânico único, ideal para antebraço ou nuca.",
    img: "",
  },
  {
    name: "Selo autoral",
    status: "Tatuado",
    text: "Referência de flash já executado para inspiração.",
    img: "",
  },
  {
    name: "Traço ornamental",
    status: "Disponível",
    text: "Linhas ornamentais autorais, perfeitas para antebraço ou panturrilha.",
    img: "",
  },
  {
    name: "Freehand orgânico",
    status: "Disponível",
    text: "Formas orgânicas criadas em freehand, com traço único e presença autoral.",
    img: "",
  },
];

const productGroups = [
  {
    title: "Planos de Tattoo",
    cta: "Consultar planos",
    hoverText: "Opções para tattoos pequenas, projetos autorais e sessões personalizadas.",
    img: "",
  },
  {
    title: "Flash Tattoos",
    cta: "Ver flashes disponíveis",
    hoverText: "Artes prontas com identidade própria e disponibilidade limitada.",
    img: "",
  },
  {
    title: "Prints & Artes",
    cta: "Consultar artes",
    hoverText: "Ilustrações autorais para decorar, presentear ou colecionar.",
    img: "",
  },
  {
    title: "Adesivos",
    cta: "Consultar adesivos",
    hoverText: "Adesivos autorais para colecionar, presentear e levar a arte da Karina para outros lugares.",
    img: "",
  },
];

const productCategories = [
  {
    title: "Planos de Tattoo",
    description:
      "Opções para tattoos pequenas, projetos autorais, sessões personalizadas e flashes exclusivos.",
    cta: "Consultar planos",
    img: productGroups[0].img,
    message: "Olá, Karina Sarte! Vim pelo site e gostaria de consultar os planos de tattoo.",
  },
  {
    title: "Flash Tattoos",
    description: "Artes prontas e disponíveis para tatuar, com identidade própria e disponibilidade limitada.",
    cta: "Ver flashes disponíveis",
    img: productGroups[1].img,
    message: "Olá, Karina Sarte! Vim pelo site e gostaria de ver os flash tattoos disponíveis.",
    link: "/flash-tattoos",
  },
  {
    title: "Prints & Artes",
    description: "Ilustrações autorais para decorar, presentear ou colecionar.",
    cta: "Consultar artes",
    img: productGroups[2].img,
    message: "Olá, Karina Sarte! Vim pelo site e gostaria de consultar prints e artes.",
  },
  {
    title: "Adesivos",
    description: "Adesivos autorais para colecionar, presentear e levar a arte da Karina para outros lugares.",
    cta: "Consultar adesivos",
    img: productGroups[3].img,
    message: "Olá, Karina Sarte! Vim pelo site e gostaria de consultar os adesivos disponíveis.",
  },
] as const;

const tattooGalleryMocks = ["", "", "", "", "", "", "", "", "", ""] as const;

const tattooGalleryItems = [
  {
    name: "Fine line botânica",
    category: "Fine Line",
    status: "Disponível",
    description: "Composição botânica delicada em traço fino. Ideal para antebraço, costela ou tornozelo.",
    img: tattooGalleryMocks[0],
  },
  {
    name: "Traço ornamental",
    category: "Autoral",
    status: "Disponível",
    description: "Projeto autoral com linhas ornamentais que acompanham a anatomia do corpo.",
    img: tattooGalleryMocks[1],
  },
  {
    name: "Freehand orgânico",
    category: "Blackwork",
    status: "Disponível",
    description: "Desenho criado em freehand com formas orgânicas e presença autoral.",
    img: tattooGalleryMocks[2],
  },
  {
    name: "Símbolos pequenos",
    category: "Minimalista",
    status: "Disponível",
    description: "Símbolos minimalistas para quem busca algo delicado e significativo.",
    img: tattooGalleryMocks[3],
  },
  {
    name: "Floral lunar",
    category: "Flash Tattoo",
    status: "Disponível",
    description: "Flash botânico com referência lunar, perfeito para braço ou nuca.",
    img: tattooGalleryMocks[4],
  },
  {
    name: "Ornamento estrela",
    category: "Flash Tattoo",
    status: "Reservado",
    description: "Linhas finas com presença mística e tamanho médio. Consulte disponibilidade.",
    img: tattooGalleryMocks[5],
  },
  {
    name: "Ramo livre",
    category: "Flash Tattoo",
    status: "Disponível",
    description: "Flash botânico único, ideal para antebraço, tornozelo ou costela.",
    img: tattooGalleryMocks[6],
  },
  {
    name: "Floral cicatrizado",
    category: "Referência",
    status: "Tatuado",
    description: "Referência de trabalho cicatrizado para inspirar novos projetos autorais.",
    img: tattooGalleryMocks[7],
  },
  {
    name: "Flash autoral",
    category: "Blackwork",
    status: "Disponível",
    description: "Flash autoral em preto, com traço firme e identidade visual.",
    img: tattooGalleryMocks[8],
  },
  {
    name: "Selo autoral",
    category: "Autoral",
    status: "Referência",
    description: "Referência de flash já executado, útil para entender estilo e proporção.",
    img: tattooGalleryMocks[9],
  },
];

function AppShell() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1.0,   // padrão — sem redução artificial
      touchMultiplier: 1.2,
      autoRaf: false,
      autoResize: false,       // gerenciamos resize manualmente via queueRefresh/refreshScrollMetrics
    });

    registerLenis(lenis);

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const onWindowLoad = () => refreshScrollMetrics();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshScrollMetrics();
    };

    window.addEventListener("load", onWindowLoad);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const refreshTimer = window.setTimeout(() => refreshScrollMetrics(), 300);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("load", onWindowLoad);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      gsap.ticker.remove(tickerFn);
      unobserveScrollRoot();
      unregisterLenis();
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <ComingSoonProvider>
        <AppLayout preloaderDone={preloaderDone} setPreloaderDone={setPreloaderDone} />
      </ComingSoonProvider>
    </BrowserRouter>
  );
}

function AppLayout({
  preloaderDone,
  setPreloaderDone,
}: {
  preloaderDone: boolean;
  setPreloaderDone: (value: boolean) => void;
}) {
  const [productsTransition, setProductsTransition] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isBioRoute = location.pathname === "/bio";
  const bootReady = useBootReady(location.pathname);
  const siteMode = useSiteModeContent();
  const isDevelopmentHome = location.pathname === "/" && siteMode.developmentMode;
  const shouldShowSiteChrome = !isBioRoute && !siteMode.developmentMode;
  const showPreloader = !isDevelopmentHome && !preloaderDone;

  useEffect(() => {
    if (!siteMode.developmentMode) return;
    if (location.pathname === "/" || isBioRoute) return;
    navigate("/", { replace: true });
  }, [isBioRoute, location.pathname, navigate, siteMode.developmentMode]);

  useEffect(() => {
    if (isBioRoute) {
      pauseSmoothScroll();
      return () => resumeSmoothScroll();
    }
    resumeSmoothScroll();
  }, [isBioRoute]);

  const startProductsTransition = useCallback(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      navigate("/produtos", { state: { fromProductsTransition: true } });
      return;
    }
    setProductsTransition(true);
  }, [navigate]);

  const completeProductsTransition = useCallback(() => {
    navigate("/produtos", { state: { fromProductsTransition: true } });
    setProductsTransition(false);
  }, [navigate]);

  return (
    <>
      <svg className="ks-svg-clip-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id="ks-window-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.055,0.985 L0.055,0.18 C0.055,0.07 0.22,0.015 0.5,0.015 C0.78,0.015 0.945,0.07 0.945,0.18 L0.945,0.985 Q0.5,0.965 0.055,0.985 Z" />
          </clipPath>
          <clipPath id="ks-window-clip-card" clipPathUnits="objectBoundingBox">
            <path d="M0.045,0.985 L0.045,0.2 C0.045,0.08 0.22,0.025 0.5,0.025 C0.78,0.025 0.955,0.08 0.955,0.2 L0.955,0.985 Q0.5,0.965 0.045,0.985 Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="ks-grain" aria-hidden="true" />
      {!isBioRoute && <AdminShortcut />}
      {shouldShowSiteChrome && <CustomCursor />}
      {showPreloader && (
        <Preloader
          ready={bootReady && (isBioRoute || Boolean(siteMode.loaded))}
          onComplete={() => {
            setPreloaderDone(true);
            window.setTimeout(() => refreshScrollMetrics(), 100);
          }}
        />
      )}
      <div
        className={`ks-shell${isBioRoute ? " is-bio" : ""}`}
        style={{
          opacity: isDevelopmentHome || preloaderDone ? 1 : 0,
          transition: "opacity 0.55s ease",
          pointerEvents: isDevelopmentHome || preloaderDone ? "auto" : "none",
        }}
      >
        <PreloaderDoneContext.Provider value={preloaderDone}>
          <ProductsNavContext.Provider value={startProductsTransition}>
            {shouldShowSiteChrome && <Header />}
            <AnimatedRoutes siteMode={siteMode} />
            {shouldShowSiteChrome && <Footer />}
            {shouldShowSiteChrome && <FloatingWhatsApp />}
          </ProductsNavContext.Provider>
        </PreloaderDoneContext.Provider>
      </div>
      <ProductsTransitionOverlay active={productsTransition} onComplete={completeProductsTransition} />
    </>
  );
}

function AnimatedRoutes({ siteMode }: { siteMode: SiteModeContent }) {
  const location = useLocation();
  const hasSectionIntro = Boolean(SECTION_INTRO_TITLES[location.pathname]);
  const isBioRoute = location.pathname === "/bio";
  const shouldRedirectToDevelopmentHome = siteMode.developmentMode && location.pathname !== "/" && !isBioRoute;
  const skipEnterMotion = hasSectionIntro || isBioRoute;

  useEffect(() => {
    const main = document.getElementById("ks-scroll-root");
    if (main) observeScrollRoot(main);

    return () => unobserveScrollRoot();
  }, []);

  useEffect(() => {
    applyPageSeo(location.pathname);

    const timer = window.setTimeout(queueRefresh, 350);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <main id="ks-scroll-root">
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          resetScrollPosition();
          refreshScrollMetrics();
        }}
      >
        <motion.div
          className="ks-route-content"
          key={location.pathname}
          initial={skipEnterMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={hasSectionIntro || isBioRoute ? { opacity: 0 } : { opacity: 0, y: -14 }}
          transition={{ duration: hasSectionIntro || isBioRoute ? 0.3 : 0.5, ease: EASE }}
          onAnimationComplete={(definition) => {
            if (definition === "animate") refreshScrollMetrics();
          }}
        >
          {shouldRedirectToDevelopmentHome ? (
            <Navigate to="/" replace />
          ) : (
            <Routes location={location}>
              <Route path="/" element={<HomePage siteMode={siteMode} />} />
              <Route path="/sobre" element={<IntroPage path="/sobre"><AboutPage /></IntroPage>} />
              <Route path="/portfolio" element={<IntroPage path="/portfolio"><PortfolioPage /></IntroPage>} />
              <Route path="/reformulacoes" element={<IntroPage path="/reformulacoes"><ReformulacoesPage /></IntroPage>} />
              <Route path="/releituras" element={<Navigate to="/reformulacoes" replace />} />
              <Route path="/flash-tattoos" element={<IntroPage path="/flash-tattoos"><FlashPage /></IntroPage>} />
              <Route path="/produtos" element={<IntroPage path="/produtos"><ProductsPage /></IntroPage>} />
              <Route path="/como-funciona" element={<Navigate to="/" replace />} />
              <Route path="/cuidados" element={<Navigate to="/" replace />} />
              <Route path="/depoimentos" element={<Navigate to="/" replace />} />
              <Route path="/faq" element={<Navigate to="/" replace />} />
              <Route path="/orcamento" element={<BudgetPage />} />
              <Route path="/bio" element={<LinkBioPublicPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function PageHero({
  kicker,
  title,
  text,
  image = null,
  imagePosition,
  className = "",
  children,
}: {
  kicker: string;
  title: string;
  text: string;
  image?: string | null;
  imagePosition?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const hasImage = Boolean(image);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const words = titleRef.current.querySelectorAll<HTMLElement>(".ks-home-hero-word");

    if (reduceMotion) {
      gsap.set(words, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 115, opacity: 0, rotate: 2 },
        {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1.05,
          stagger: 0.075,
          ease: "power4.out",
          clearProps: "transform,opacity",
        },
      );
    }, titleRef);

    return () => ctx.revert();
  }, [title]);

  return (
    <section className={`ks-page-hero${hasImage ? "" : " ks-page-hero-no-image"}${className ? ` ${className}` : ""}`}>
      {hasImage ? (
        <img
          className="ks-page-hero-image"
          src={image!}
          alt={`${title} — Karina Sarte Tattoo em Teresópolis, RJ`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
        />
      ) : null}
      {hasImage ? <div className="ks-page-hero-shade" aria-hidden="true" /> : null}
      <motion.div
        className="ks-page-hero-content"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <span className="ks-label-caps">{kicker}</span>
        <h1 ref={titleRef} className="ks-display-xl ks-home-hero-title" aria-label={title}>
          {title.split(" ").map((word, index) => (
            <span className="ks-home-hero-word-wrap" aria-hidden="true" key={`${word}-${index}`}>
              <span className="ks-home-hero-word">{word}</span>
            </span>
          ))}
        </h1>
        <p className="ks-body-lg" style={{ whiteSpace: "pre-line" }}>{text}</p>
        {children ? <div className="ks-actions">{children}</div> : null}
      </motion.div>
    </section>
  );
}


function HomePage({ siteMode }: { siteMode: SiteModeContent }) {
  const home = useHomeContent();

  if (siteMode.developmentMode) {
    return <DevelopmentHomePage data={siteMode} />;
  }

  return (
    <div className="ks-home-flow">
      {isSectionVisible(home, "hero") ? <HomeHero data={home} /> : null}
      {isSectionVisible(home, "processo") ? (
        <>
          <SectionStarBreak align="right" />
          <EditorialSplitSection data={home} />
        </>
      ) : null}
      {isSectionVisible(home, "servicos") ? (
        <>
          <SectionStarBreak align="right" light />
          <HomeServicesSection data={home} />
        </>
      ) : null}
      {isSectionVisible(home, "portfolio") ? (
        <>
          <SectionStarBreak align="left" light />
          <MuralPortfolioPreview data={home} />
        </>
      ) : null}
      <SectionStarBreak align="right" light />
      <TestimonialsSection />
      {isSectionVisible(home, "colecoes") ? (
        <>
          <SectionStarBreak align="right" />
          <ProductsPreview data={home} />
        </>
      ) : null}
      {isSectionVisible(home, "youtube") && home.youtubeActive ? (
        <>
          <SectionStarBreak align="left" dense />
          <YoutubeFeatureSection data={home} />
        </>
      ) : null}
      {isSectionVisible(home, "cta") ? (
        <>
          <SectionStarBreak align="right" light />
          <CtaBand
            title={home.ctaTitle}
            text={home.ctaText}
            cta={home.ctaButton}
            to={home.ctaButtonUrl}
            artwork="/assets/brand/eye-heart.png"
          />
        </>
      ) : null}
    </div>
  );
}

function DevelopmentHomePage({ data }: { data: SiteModeContent }) {
  const featureImage = data.developmentImageUrl?.trim() || "";

  return (
    <section className="ks-development-home">
      <motion.div
        className={`ks-development-home-card${featureImage ? "" : " is-text-only"}`}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {featureImage ? (
          <div className="ks-development-home-image">
            <img src={featureImage} alt="Karina Sarte" loading="eager" decoding="async" />
          </div>
        ) : null}
        <div className="ks-development-home-content">
          <div className="ks-development-home-starfield" aria-hidden="true">
            <img src="/assets/brand/star-karina-filled.png" alt="" />
            <img src="/assets/brand/star-karina-outline.png" alt="" />
            <img src="/assets/brand/star-karina-filled.png" alt="" />
            <img src="/assets/brand/star-karina-outline.png" alt="" />
            <img src="/assets/brand/star-karina-filled.png" alt="" />
          </div>
          <span className="ks-label-caps">{data.developmentEyebrow}</span>
          <h1 className="ks-display-xl">{data.developmentTitle}</h1>
          <p className="ks-body-lg">{data.developmentText}</p>
          <a className="ks-primary-link" href={data.developmentButtonUrl} target="_blank" rel="noopener noreferrer">
            {data.developmentButton}
            <ArrowRight size={16} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function HomeHero({ data }: { data: HomeContent }) {
  const preloaderDone = useContext(PreloaderDoneContext);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const heroTitle = data.heroTitle;

  useEffect(() => {
    if (!preloaderDone || !titleRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const words = titleRef.current.querySelectorAll<HTMLElement>(".ks-home-hero-word");

    if (reduceMotion) {
      gsap.set(words, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 115, opacity: 0, rotate: 2 },
        {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1.05,
          stagger: 0.075,
          ease: "power4.out",
          clearProps: "transform,opacity",
        },
      );
    }, titleRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  return (
    <section className="ks-home-hero">
      {data.heroImageUrl ? (
        <img
          className="ks-home-hero-bg"
          src={data.heroImageUrl}
          alt={`${heroTitle} — Karina Sarte Tattoo em Teresópolis, RJ`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      ) : null}
      {data.heroImageUrl ? <div className="ks-home-hero-shade" aria-hidden="true" /> : null}
      <motion.div
        className="ks-home-hero-content"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <span className="ks-label-caps">{data.heroEyebrow}</span>
        <h1 ref={titleRef} className="ks-display-xl ks-home-hero-title" aria-label={heroTitle}>
          {heroTitle.split(" ").map((word, index) => (
            <span className="ks-home-hero-word-wrap" aria-hidden="true" key={`${word}-${index}`}>
              <span className="ks-home-hero-word">{word}</span>
            </span>
          ))}
        </h1>
        <p className="ks-body-lg">{data.heroText}</p>
        <div className="ks-actions">
          <PrimaryLink to={data.heroButtonUrl}>{data.heroButton}</PrimaryLink>
          {data.heroSecondaryButton && <TextLink to={data.heroSecondaryUrl}>{data.heroSecondaryButton}</TextLink>}
        </div>
      </motion.div>
    </section>
  );
}

function EditorialSplitSection({ data }: { data: HomeContent }) {
  const steps = [...data.processSteps].filter((step) => step.active).sort((a, b) => a.order - b.order);

  return (
    <section className="ks-editorial-split">
      <motion.div
        className="ks-editorial-split-text"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <span className="ks-label-caps ks-gold">{data.processEyebrow}</span>
        <h2 className="ks-headline-lg">{data.processTitle}</h2>
        <p className="ks-body-lg ks-muted">{data.processText}</p>
        {steps.length > 0 && (
          <div className="ks-editorial-process" aria-label="Fluxo de criação">
            {steps.map((step) => <span key={step.id}>{step.label}</span>)}
          </div>
        )}
        <PrimaryLink to={data.processButtonUrl}>{data.processButton}</PrimaryLink>
      </motion.div>
      <div className="ks-editorial-split-media">
        {data.processImageUrl && (
          <img
            src={data.processImageUrl}
            alt="Karina Sarte — detalhe de mãos, unhas e anéis"
            loading="lazy"
          />
        )}
        {/* A janela vive DENTRO do bloco da foto de propósito. Como irmã, em
            coluna única ela reservava uma faixa de altura própria e, sendo
            estreita, sobrava um bloco vazio ao lado — o "buraco" entre a foto e o
            texto. Aqui ela é absoluta em relação à foto e não ocupa espaço.
            Bônus no desktop: a foto é a coluna da direita, então a borda
            esquerda dela É a divisória — left: 0 centra a janela no meio da seção.
            O div externo posiciona e o interno anima: o motion escreve transform
            inline e sobrescreveria o translate de centralização. */}
        <div className="ks-editorial-split-portal" aria-hidden="true">
          <motion.div
            className="ks-editorial-split-portal-card"
            initial={{ opacity: 0, y: 34, rotate: -5 }}
            whileInView={{ opacity: 1, y: 0, rotate: -2 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="ks-window-portal">
              {data.processPortraitUrl && (
                <img
                  src={data.processPortraitUrl}
                  alt="Karina Sarte"
                  loading="lazy"
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function NumberedPlaceholder({ number }: { number: string }) {
  return (
    <div className="ks-numbered-placeholder" aria-hidden="true">
      <span>{number}</span>
    </div>
  );
}

function HomeServicesSection({ data }: { data: HomeContent }) {
  const cards = [...data.serviceCards].filter((card) => card.active).sort((a, b) => a.order - b.order);

  return (
    <section className="ks-services-section">
      <SectionTitle eyebrow={data.servicesEyebrow} title={data.servicesTitle} text={data.servicesText} />
      <div className="ks-services-grid">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className="ks-service-grid-item"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.65, delay: index * 0.08, ease: EASE }}
          >
            <GuardedLink className="ks-service-card" to={card.url}>
              <div className="ks-service-card-media">
                <div className="ks-window-portal">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.title} loading="lazy" />
                  ) : (
                    <NumberedPlaceholder number={String(index).padStart(2, "0")} />
                  )}
                </div>
              </div>
              <div className="ks-service-card-body">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <span className="ks-service-card-link">{card.cta}</span>
              </div>
            </GuardedLink>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MuralPortfolioPreview({ data }: { data: HomeContent }) {
  const portfolioItems = usePortfolioItems(false);
  const featuredItems = portfolioItems.filter((item) => item.featured);
  const manualIds = data.portfolioIds || [];
  const manualItems = manualIds
    .map((id) => portfolioItems.find((item) => item.id === id))
    .filter((item): item is PortfolioWork => Boolean(item));
  const selectedItems = featuredItems.length > 0 ? featuredItems : manualItems;
  const displayedItems = selectedItems.slice(0, 6);

  return (
    <section className="ks-mural-section">
      <SectionTitle eyebrow={data.portfolioEyebrow} title={data.portfolioTitle} text={data.portfolioText} />
      {displayedItems.length > 0 ? (
        <div className="ks-mural-grid">
          {displayedItems.map((item, index) => (
            <motion.div
              key={item.id || item.title}
              className="ks-mural-item ks-mural-item-image"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
            >
              <GuardedLink to="/portfolio" className="ks-mural-item-link">
                <div className="ks-mural-item-media">
                  {"processVideo" in item && item.processVideo ? (
                    <HoverProcessMedia
                      poster={item.processVideo.poster}
                      videoSrc={item.processVideo.src}
                      alt={item.alt}
                      loading="lazy"
                    />
                  ) : item.img ? (
                    <img src={item.img} alt={item.alt} loading="lazy" />
                  ) : (
                    <NumberedPlaceholder number={String(index + 1).padStart(2, "0")} />
                  )}
                </div>
                <div className="ks-mural-item-caption">
                  <span>{item.label}</span>
                  <strong>{item.title}</strong>
                </div>
              </GuardedLink>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="ks-body-lg ks-muted" style={{ textAlign: "center" }} role="status">
          Em breve, novos trabalhos por aqui.
        </p>
      )}
      <div className="ks-mural-footer">
        <PrimaryLink to="/portfolio">Ver portfólio completo</PrimaryLink>
      </div>
    </section>
  );
}

function AboutMeSection() {
  const [active, setActive] = useState(0);
  const slides = galleryItems;
  const total = slides.length;
  const slide = slides[active];

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((index) => (index + 1) % total);
    }, 3500);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <section id="sobre-mim" className="ks-section ks-about-me">
      <div className="ks-about-me-grid">
        <motion.div
          className="ks-about-me-image"
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          whileInView={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={slide.img}
              className="ks-about-me-slide"
              src={slide.img}
              alt={slide.alt}
              loading={active === 0 ? "eager" : "lazy"}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: EASE }}
            />
          </AnimatePresence>
          <span className="ks-about-me-carousel-count">
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="ks-about-me-carousel-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`ks-dot${index === active ? " active" : ""}`}
                onClick={() => setActive(index)}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
          <span className="ks-about-me-tag">Karina Sarte</span>
        </motion.div>

        <motion.div
          className="ks-about-me-content"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        >
          <span className="ks-label-caps ks-gold">Sobre mim</span>
          <h2 className="ks-headline-lg">Arte na pele, feita com escuta e presença.</h2>
          <p className="ks-body-lg ks-muted">
            Sou Karina, tatuadora autora em Teresópolis. Transformo referências, símbolos e histórias em tatuagens
            que respeitam o corpo — com traço fino, botânica, freehand e composições pensadas para durar.
          </p>
          <p className="ks-body-lg ks-muted">
            Cada projeto começa com uma conversa: entender o que você quer levar, onde quer levar e como aquela arte precisa existir na sua pele. É assim que eu penso cada tattoo.
          </p>
          <blockquote className="ks-about-me-quote">
            “Tatuar é traduzir o que sentimos em algo que fica — linha, silêncio e história na pele.”
          </blockquote>
          <div className="ks-about-me-actions">
            <PrimaryLink to="/sobre">Conheça minha história</PrimaryLink>
            <TextLink to="/orcamento">Quero uma tattoo</TextLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PreviewSection({
  eyebrow,
  title,
  text,
  image,
  imageAlt,
  to,
  cta,
  className,
}: {
  eyebrow: string;
  title: string;
  text: string;
  image?: string;
  imageAlt?: string;
  to?: string;
  cta?: string;
  className?: string;
}) {
  return (
    <section className={`ks-section ks-two-col${image ? " ks-two-col-has-image" : ""}${className ? " " + className : ""}`}>
      <div>
        <span className="ks-label-caps ks-gold">{eyebrow}</span>
        <h2 className="ks-headline-lg">{title}</h2>
        {image && (
          <div className="ks-preview-image ks-preview-image-mobile">
            <img src={image} alt={imageAlt ?? ""} loading="lazy" />
            <BrandStar variant={2} size={46} className="ks-preview-image-star ks-brand-star-light" />
          </div>
        )}
        {image && <p className="ks-body-lg ks-muted">{text}</p>}
        {to && cta && <TextLink to={to}>{cta}</TextLink>}
      </div>
      {image ? (
        <motion.div
          className="ks-preview-image ks-preview-image-desktop"
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          whileInView={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <img src={image} alt={imageAlt ?? ""} loading="lazy" />
          <BrandStar variant={2} size={58} className="ks-preview-image-star ks-brand-star-light" />
        </motion.div>
      ) : (
        <div>
          <p className="ks-body-lg ks-muted">{text}</p>
          {to && cta && <TextLink to={to}>{cta}</TextLink>}
        </div>
      )}
    </section>
  );
}

function PortfolioPreview() {
  const [active, setActive] = useState(0);
  const total = galleryItems.length;

  const prev = () => setActive((i) => (i - 1 + total) % total);
  const next = () => setActive((i) => (i + 1) % total);

  useEffect(() => {
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="ks-section ks-portfolio-carousel">
      <div className="ks-portfolio-head">
        <div>
          <span className="ks-label-caps ks-gold">Trabalhos recentes</span>
          <h2 className="ks-headline-lg">Portfolio vivo</h2>
        </div>
        <div className="ks-carousel-controls">
          <button className="ks-carousel-btn" onClick={prev} aria-label="Anterior">
            <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} />
          </button>
          <span className="ks-carousel-count">
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <button className="ks-carousel-btn" onClick={next} aria-label="Próximo">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="ks-carousel-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="ks-carousel-slide"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <PortfolioCard item={galleryItems[active]} index={active} />
            <PortfolioCard item={galleryItems[(active + 1) % total]} index={(active + 1) % total} />
            <PortfolioCard item={galleryItems[(active + 2) % total]} index={(active + 2) % total} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="ks-carousel-footer">
        <div className="ks-carousel-dots">
          {galleryItems.map((_, i) => (
            <button
              key={i}
              className={`ks-dot${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Ir para trabalho ${i + 1}`}
            />
          ))}
        </div>
        <PrimaryLink to="/portfolio">Ver portfolio completo</PrimaryLink>
      </div>
    </section>
  );
}

function PortfolioCard({ item, index }: { item: (typeof galleryItems)[0]; index: number }) {
  return (
    <article className="ks-portfolio-card">
      <img src={item.img} alt={item.alt} loading={index < 2 ? "eager" : "lazy"} />
      <BrandStar
        variant={brandStarVariant(index)}
        size={172}
        className="ks-card-starfield ks-brand-star-light"
      />
      <div className="ks-portfolio-card-overlay">
        <span className="ks-label-caps ks-gold">
          {String(index + 1).padStart(2, "0")} — {item.category}
        </span>
        <h3>{item.title}</h3>
      </div>
    </article>
  );
}

function FlashPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleItems = flashItems.slice(0, 5);
  const active = visibleItems[activeIndex] ?? visibleItems[0];
  const flashWhatsAppHref = wa("Olá, Karina Sarte! Vim pelo site e queria ver os flash tattoos disponíveis.");

  return (
    <section className="ks-section ks-section-wine ks-flash-showcase">
      <SectionTitle eyebrow="Flash Tattoos disponíveis" title="Artes autorais prontas para tatuar" text="Disponibilidade limitada — me consulte direto pelo WhatsApp." />
      <div className="ks-flash-scroll-layout">
        <div className="ks-flash-feature">
          <div className="ks-flash-feature-media">
            <AnimatePresence mode="sync">
              <motion.img
                key={active.img}
                src={active.img}
                alt={`${active.name} flash tattoo`}
                loading="lazy"
                initial={{ opacity: 0, scale: 1.045, y: 18, filter: "blur(10px) grayscale(70%) contrast(1.05) brightness(1.02)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px) grayscale(70%) contrast(1.05) brightness(1.05)" }}
                exit={{ opacity: 0, scale: 0.985, y: -14, filter: "blur(8px) grayscale(82%) contrast(1.08) brightness(0.92)" }}
                transition={{ duration: 0.85, ease: FLUID_EASE }}
              />
            </AnimatePresence>
          </div>
          <div className="ks-flash-feature-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.name}
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                transition={{ duration: 0.55, ease: FLUID_EASE }}
              >
                <span className={`ks-status ${active.status.toLowerCase()}`}>{active.status}</span>
                <h3>{active.name}</h3>
                <p>{active.text}</p>
                <a
                  className="ks-primary-link ks-flash-feature-cta"
                  href={flashWhatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Consultar flash tattoos disponíveis pelo WhatsApp"
                >
                  Consultar flashes <WhatsAppIcon />
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="ks-flash-strip">
          {visibleItems.map((item, index) => (
            <FlashMiniCard
              key={item.name}
              item={item}
              index={index}
              active={index === activeIndex}
              onSelect={() => {
                if (index !== activeIndex) setActiveIndex(index);
              }}
            />
          ))}
        </div>
      </div>
      <div className="ks-center-action ks-flash-mobile-action">
        <a className="ks-primary-link" href={flashWhatsAppHref} target="_blank" rel="noopener noreferrer">
          Consultar flashes <WhatsAppIcon />
        </a>
      </div>
    </section>
  );
}

function FlashMiniCard({
  item,
  index,
  active,
  onSelect,
}: {
  item: (typeof flashItems)[0];
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.article
      className={`ks-flash-mini-card${active ? " active" : ""}`}
      initial={{ opacity: 0, x: 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: EASE }}
      onHoverStart={onSelect}
      onFocus={onSelect}
      onClick={onSelect}
      tabIndex={0}
    >
      <img src={item.img} alt={`${item.name} flash tattoo`} loading="lazy" />
      <div>
        <span className={`ks-status ${item.status.toLowerCase()}`}>{item.status}</span>
        <h3>{item.name}</h3>
        <p>{item.text}</p>
      </div>
    </motion.article>
  );
}

function CareHomeSection() {
  return (
    <section className="ks-section ks-section-cream">
      <SectionTitle
        eyebrow="Cuidados"
        title="Cuidado, segurança e responsabilidade"
        text="Realizo cada atendimento com atenção à biossegurança, materiais adequados e orientações antes, durante e depois da tattoo."
      />
      <div className="ks-card-grid three">
        {["Antes da tattoo", "Durante a sessão", "Depois da tattoo"].map((title) => (
          <MiniCard
            key={title}
            title={title}
            text="Orientações claras para preparo, procedimento, higienização, hidratação e cicatrização."
          />
        ))}
      </div>
    </section>
  );
}

function ProductsPreview({ data }: { data: HomeContent }) {
  const cards = [...data.collectionCards].filter((card) => card.active).sort((a, b) => a.order - b.order);

  return (
    <section className="ks-section ks-products-preview ks-section-cream">
      <div className="ks-products-header">
        <span className="ks-label-caps ks-gold">{data.collectionsEyebrow}</span>
        <h2 className="ks-headline-lg">{data.collectionsTitle}</h2>
        <p className="ks-body-lg ks-muted" style={{ marginTop: 16, maxWidth: 640 }}>{data.collectionsText}</p>
      </div>
      <div className="ks-products-grid">
        {cards.map((card, index) => (
          <ProductVisualCard
            key={card.id}
            group={{ title: card.title, hoverText: card.text, cta: card.cta, imageUrl: card.imageUrl }}
            index={index}
            to={card.url}
          />
        ))}
      </div>
      <div className="ks-center-action" style={{ marginTop: "clamp(28px, 4vw, 48px)" }}>
        <ProductsEntryLink>{data.collectionsButton}</ProductsEntryLink>
      </div>
    </section>
  );
}

function YoutubeFeatureSection({ data }: { data: HomeContent }) {
  const trailerRef = useRef<HTMLVideoElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const toggleTrailerSound = () => {
    const nextSoundEnabled = !soundEnabled;
    setSoundEnabled(nextSoundEnabled);

    if (trailerRef.current) {
      trailerRef.current.muted = !nextSoundEnabled;
      if (nextSoundEnabled) void trailerRef.current.play();
    }
  };

  return (
    <section id="youtube" className="ks-youtube-feature" aria-labelledby="youtube-feature-title">
      <div className="ks-youtube-feature-grid">
        <motion.div
          className="ks-youtube-feature-content"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span className="ks-label-caps ks-gold">{data.youtubeEyebrow}</span>
          <h2 id="youtube-feature-title" className="ks-headline-lg ks-youtube-feature-title">
            <span>{data.youtubeTitle}</span>
          </h2>
          <p className="ks-body-lg ks-muted">{data.youtubeText}</p>
          <a
            className="ks-primary-link ks-youtube-feature-cta"
            href={data.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="cta"
          >
            <Play size={16} fill="currentColor" />
            {data.youtubeButton}
          </a>
          <span className="ks-youtube-feature-meta">{data.youtubeMeta}</span>
        </motion.div>

        <motion.div
          className="ks-youtube-feature-media"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
        >
          <a
            className="ks-youtube-feature-thumb"
            href={data.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Assistir ao Tattoo Vlog completo no YouTube"
          >
            {data.youtubeThumbUrl && (
              <img
                src={data.youtubeThumbUrl}
                alt="Karina Sarte no estúdio, capa do primeiro Tattoo Vlog"
                loading="lazy"
              />
            )}
            <span>Assistir no YouTube <ArrowRight size={15} /></span>
          </a>

          {data.youtubeTrailerUrl && (
            <div className="ks-youtube-feature-trailer">
              <div className="ks-youtube-feature-trailer-meta" aria-hidden="true">
                <span>Trailer</span>
                <span>00:17</span>
              </div>
              <video
                ref={trailerRef}
                autoPlay
                muted={!soundEnabled}
                loop
                playsInline
                preload="metadata"
                poster={data.youtubeThumbUrl || undefined}
                aria-label="Trailer vertical do primeiro Tattoo Vlog da Karina Sarte"
              >
                <source src={data.youtubeTrailerUrl} type="video/mp4" />
              </video>
              <button
                type="button"
                className="ks-youtube-feature-sound"
                onClick={toggleTrailerSound}
                aria-pressed={soundEnabled}
                aria-label={soundEnabled ? "Desativar som do trailer" : "Ativar som do trailer"}
                data-testid="youtube-sound-toggle"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>{soundEnabled ? "Som ativado" : "Ativar som"}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

const MotionLink = motion.create(Link);

function ProductVisualCard({
  group,
  index,
  to,
}: {
  group: { title: string; hoverText: string; cta: string; imageUrl?: string };
  index: number;
  to?: string;
}) {
  const { openComingSoon, navVisibility } = useComingSoon();
  const number = String(index + 1).padStart(2, "0");
  const motionProps = {
    className: "ks-product-visual-card",
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    whileHover: { y: -4 },
    whileTap: { scale: 0.99 },
    viewport: { once: true, margin: "-8%" },
    transition: { duration: 0.65, delay: index * 0.08, ease: EASE },
  };

  const content = (
    <>
      <div className="ks-product-visual-media">
        {group.imageUrl ? (
          <img src={group.imageUrl} alt={group.title} loading="lazy" />
        ) : (
          <NumberedPlaceholder number={number} />
        )}
      </div>
      <div className="ks-product-visual-body">
        <span className="ks-label-caps">{number}</span>
        <h3>{group.title}</h3>
        <p>{group.hoverText}</p>
        <span className="ks-product-visual-link">
          {group.cta} <ArrowRight size={14} />
        </span>
      </div>
    </>
  );

  if (to) {
    const pageVisible = isNavPathVisible(navVisibility, to);
    if (!pageVisible) {
      return (
        <motion.button type="button" {...motionProps} onClick={() => openComingSoon()}>
          {content}
        </motion.button>
      );
    }
    return <MotionLink to={to} {...motionProps}>{content}</MotionLink>;
  }

  return (
    <motion.a href={wa(productWhatsAppMessage(group.title))} {...motionProps}>
      {content}
    </motion.a>
  );
}

function TattooGallery() {
  const [selected, setSelected] = useState<(typeof tattooGalleryItems)[0] | null>(null);

  useEffect(() => {
    if (!selected) return;

    lockScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  return (
    <>
      <div className="ks-tattoo-gallery-grid">
        {tattooGalleryItems.map((item, index) => (
          <TattooGalleryCard key={item.name} item={item} index={index} onSelect={() => setSelected(item)} />
        ))}
      </div>

      <AnimatePresence onExitComplete={refreshScrollMetrics}>
        {selected && (
          <TattooGalleryModal item={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

function TattooGalleryCard({
  item,
  index,
  onSelect,
}: {
  item: (typeof tattooGalleryItems)[0];
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      className="ks-tattoo-gallery-card"
      onClick={onSelect}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: EASE }}
    >
      <img src={item.img} alt={item.name} loading="lazy" />
      <div className="ks-product-visual-overlay">
        <span className="ks-label-caps">{String(index + 1).padStart(2, "0")}</span>
        <h3>{item.name}</h3>
        <span className="ks-product-visual-cta">
          Ver detalhes <ArrowRight size={12} />
        </span>
      </div>
    </motion.button>
  );
}

function TattooGalleryModal({
  item,
  onClose,
}: {
  item: (typeof tattooGalleryItems)[0];
  onClose: () => void;
}) {
  return (
    <motion.div
      className="ks-tattoo-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      onClick={onClose}
    >
      <motion.div
        className="ks-tattoo-modal-panel"
        data-lenis-prevent
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.35, ease: FLUID_EASE }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tattoo-modal-title"
      >
        <button type="button" className="ks-tattoo-modal-close" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>

        <div className="ks-tattoo-modal-image">
          <img src={item.img} alt={item.name} />
        </div>

        <div className="ks-tattoo-modal-body">
          <div className="ks-tattoo-modal-meta">
            <span className="ks-label-caps ks-gold">{item.category}</span>
            <span className={`ks-status ${tattooStatusClass(item.status)}`}>{item.status}</span>
          </div>
          <h2 id="tattoo-modal-title" className="ks-headline-md">{item.name}</h2>
          <p className="ks-body-lg ks-muted">{item.description}</p>
          <a
            className="ks-primary-link"
            href={wa(tattooChoiceMessage(item.name))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Pedir orçamento da tattoo ${item.name} pelo WhatsApp`}
          >
            Eu escolho essa <WhatsAppIcon />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AboutPage() {
  const about = useAboutContent();
  const cards = [...about.approachCards].filter((card) => card.active).sort((a, b) => a.order - b.order);

  if (!isPageVisible(about)) return <HiddenPageRedirect />;

  return (
    <>
      {isSectionVisible(about, "abertura") ? (
        <PageHero
          kicker={about.eyebrow}
          title={about.title}
          text={about.intro}
          image={about.heroImageUrl}
        >
          <PrimaryLink to="/orcamento">Quero criar minha tattoo</PrimaryLink>
        </PageHero>
      ) : null}
      {isSectionVisible(about, "biografia") ? (
        <section className="ks-section ks-two-col ks-section-cream ks-about-main">
          <motion.div
            className="ks-preview-image"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {about.imageUrl && (
              <img
                src={about.imageUrl}
                alt="Karina Sarte"
                loading="lazy"
              />
            )}
          </motion.div>
          <div className="ks-stack">
            <blockquote className="ks-about-me-quote">“{about.quote}”</blockquote>
            <p className="ks-body-lg ks-muted" style={{ whiteSpace: "pre-line" }}>{about.biography}</p>
            <PrimaryLink to="/orcamento">Quero criar minha tattoo</PrimaryLink>
          </div>
        </section>
      ) : null}
      {isSectionVisible(about, "studio") ? (
        <AboutStudioSection
          inviteImageUrl={about.studioInviteImageUrl}
          steps={about.studioTourSteps}
        />
      ) : null}
      {isSectionVisible(about, "bastidores") ? (
        <AboutBastidorSection
          imageUrl={about.behindScenesImageUrl}
          caption={about.behindScenesCaption}
        />
      ) : null}
      {isSectionVisible(about, "abordagem") ? (
        <FeatureStrip
          eyebrow="Cuidado em cada etapa"
          title="Como cada projeto é cuidado"
          text="Da primeira conversa ao cuidado final, cada etapa é pensada para que a tattoo tenha intenção, presença e segurança."
          cards={cards}
        />
      ) : null}
    </>
  );
}

function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const portfolioItems = usePortfolioItems(false);
  const portfolioPage = usePortfolioPageContent();
  const sourceItems = portfolioItems;
  // Filtros fixos da galeria (ordem e nomes da referência visual).
  const categories = ["Todos", ...PORTFOLIO_CATEGORIES];
  const filteredItems =
    activeCategory === "Todos"
      ? sourceItems
      : sourceItems.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());
  const featuredWork =
    sourceItems.find((item) => item.img && item.featured) ||
    sourceItems.find((item) => item.img) ||
    null;

  if (!isPageVisible(portfolioPage)) return <HiddenPageRedirect />;

  return (
    <>
      {isSectionVisible(portfolioPage, "hero") ? (
        <PageHero
          className="ks-portfolio-page-hero"
          kicker={portfolioPage.heroKicker}
          title={portfolioPage.heroTitle}
          text={portfolioPage.heroText}
          image={portfolioPage.heroImageUrl}
        />
      ) : null}
      {isSectionVisible(portfolioPage, "trabalhos") ? (
        <>
          <section className="ks-portfolio-gallery">
            <BrandStar variant={2} size={220} className="ks-portfolio-gallery-deco ks-portfolio-gallery-deco-a" />
            <BrandStar variant={3} size={120} className="ks-portfolio-gallery-deco ks-portfolio-gallery-deco-b" />

            <div className="ks-portfolio-gallery-inner">
              <motion.header
                className="ks-portfolio-gallery-intro"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="ks-portfolio-gallery-intro-copy">
                  <h2>Projetos na pele</h2>
                  <p>
                    Uma seleção de tattoos, flashes e composições autorais criadas a partir de histórias,
                    referências e corpos diferentes.
                  </p>
                </div>
                <p className="ks-portfolio-gallery-count" aria-live="polite">
                  <span>{String(filteredItems.length).padStart(2, "0")}</span>
                  {filteredItems.length === 1 ? "projeto selecionado" : "projetos selecionados"}
                </p>
              </motion.header>

              <div className="ks-portfolio-gallery-rule" aria-hidden="true">
                <span />
                <StarGlyph size={12} color="#806E85" />
                <span />
              </div>

              <motion.div
                className="ks-portfolio-filters"
                role="toolbar"
                aria-label="Filtrar portfólio por categoria"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-8%" }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {categories.map((category) => {
                  const active = activeCategory === category;
                  return (
                    <motion.button
                      key={category}
                      type="button"
                      className={`ks-portfolio-chip${active ? " is-active" : ""}`}
                      aria-pressed={active}
                      onClick={() => setActiveCategory(category)}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
                      }}
                    >
                      <span className="ks-portfolio-chip-star" aria-hidden="true">
                        <StarGlyph size={8} color={active ? "#F4EFE8" : "#806E85"} />
                      </span>
                      <span>{category}</span>
                    </motion.button>
                  );
                })}
              </motion.div>

              {filteredItems.length > 0 ? (
                <PortfolioMasonry items={filteredItems} />
              ) : (
                <p className="ks-body-lg ks-muted ks-portfolio-gallery-empty" role="status">
                  {portfolioItems.length === 0
                    ? "Ainda não há trabalhos publicados no portfólio."
                    : "Ainda não há trabalhos publicados nesta categoria."}
                </p>
              )}
            </div>

            {featuredWork ? <PortfolioFeatured work={featuredWork} /> : null}
          </section>
        </>
      ) : null}
    </>
  );
}

function PortfolioMasonry({ items }: { items: PortfolioWork[] }) {
  return (
    <div className="ks-portfolio-masonry">
      {items.map((item, index) => (
        <PortfolioMasonryCard key={item.id || `${item.title}-${index}`} item={item} index={index} />
      ))}
    </div>
  );
}

function PortfolioMasonryCard({ item, index }: { item: PortfolioWork; index: number }) {
  const hasMedia = Boolean(item.img || item.processVideo);

  return (
    <motion.article
      className={`ks-portfolio-work${hasMedia ? "" : " is-placeholder"}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.7, delay: Math.min(index, 6) * 0.06, ease: EASE }}
      data-cursor="gallery"
    >
      <div className="ks-portfolio-work-media">
        {item.processVideo ? (
          <HoverProcessMedia
            poster={item.processVideo.poster}
            videoSrc={item.processVideo.src}
            alt={item.alt}
            loading={index < 2 ? "eager" : "lazy"}
          />
        ) : item.img ? (
          <img src={item.img} alt={item.alt} loading={index < 2 ? "eager" : "lazy"} />
        ) : (
          <div className="ks-portfolio-work-placeholder" aria-hidden="true">
            <BrandStar variant={2} size={88} className="ks-portfolio-work-placeholder-star" />
            <span>imagem em breve</span>
          </div>
        )}
      </div>
      <div className="ks-portfolio-work-overlay">
        <div className="ks-portfolio-work-copy">
          <span className="ks-label-caps">{item.category}</span>
          <h3>{item.title}</h3>
        </div>
        <StarGlyph size={14} color="#F4EFE8" className="ks-portfolio-work-star" />
      </div>
    </motion.article>
  );
}

function PortfolioFeatured({ work }: { work: PortfolioWork }) {
  const image = work.processVideo?.poster || work.img;

  return (
    <motion.aside
      className="ks-portfolio-featured"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.85, ease: EASE }}
    >
      <div className="ks-portfolio-featured-inner">
        <figure className="ks-portfolio-featured-media">
          {image ? (
            <img src={image} alt={work.alt} loading="lazy" />
          ) : (
            <div className="ks-portfolio-work-placeholder" aria-hidden="true">
              <BrandStar variant={3} size={96} className="ks-portfolio-work-placeholder-star" />
              <span>imagem em breve</span>
            </div>
          )}
        </figure>
        <div className="ks-portfolio-featured-copy">
          <span className="ks-label-caps ks-gold">Projeto em destaque</span>
          <h2>Cada tattoo nasce de uma conversa.</h2>
          <p>
            Alguns projetos começam com uma referência, outros com uma sensação. O desenho vai sendo
            construído para conversar com o corpo, com a história e com o momento de quem vai levar
            aquela arte na pele.
          </p>
          <PrimaryLink to="/orcamento">Quero criar minha tattoo</PrimaryLink>
        </div>
      </div>
    </motion.aside>
  );
}

function ReformulacoesPage() {
  const content = useReformulationsContent();
  const reformulacoes = useReformulationCases();
  const pontos = [...content.panelPoints].filter((point) => point.active).sort((a, b) => a.order - b.order);
  const possibilidades = [...content.possibilityCards].filter((card) => card.active).sort((a, b) => a.order - b.order);
  const [expandedCase, setExpandedCase] = useState<ReformulationCase | null>(null);

  useEffect(() => {
    if (!expandedCase) return;

    lockScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedCase(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expandedCase]);

  if (!isPageVisible(content)) return <HiddenPageRedirect />;

  return (
    <>
      {isSectionVisible(content, "hero") ? (
        <PageHero
          kicker={content.heroEyebrow}
          title={content.heroTitle}
          text={content.heroText}
          image={content.heroImageUrl}
        >
          <PrimaryLink to={content.heroButtonUrl || "/orcamento"}>{content.heroButton}</PrimaryLink>
        </PageHero>
      ) : null}

      {isSectionVisible(content, "casos") ? (
        <section className="ks-section ks-reformulacoes-portfolio">
          <SectionTitle
            eyebrow={content.portfolioEyebrow}
            title={content.portfolioTitle}
            text={content.portfolioText}
          />
          <div className="ks-reformulacoes-grid">
            {reformulacoes.map((item, index) => (
              <article className="ks-reformulacao-case" key={item.id}>
                <header className="ks-reformulacao-case-header">
                  <span className="ks-label-caps">{item.category}</span>
                  <h3>{item.title}</h3>
                </header>
                <ReformulacaoCompare item={item} index={index} onExpand={() => setExpandedCase(item)} />
                {content.caseNote ? <p className="ks-reformulacao-case-note">{content.caseNote}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {isSectionVisible(content, "introducao") ? (
        <>
          <SectionStarBreak align="right" />
          <section className="ks-section ks-section-cream ks-reformulacoes-intro">
            <BrandStar variant={3} size={260} className="ks-reformulacoes-intro-star" />
            <div className="ks-reformulacoes-intro-grid">
              <div className="ks-reformulacoes-intro-heading">
                <span className="ks-label-caps">{content.introEyebrow}</span>
                <h2 className="ks-headline-lg">{content.introTitle}</h2>
                <p className="ks-body-lg ks-muted">
                  {content.introText}
                </p>
              </div>

              <div className="ks-reformulacoes-intro-panel">
                <span className="ks-label-caps">{content.panelEyebrow}</span>
                <p className="ks-body-lg">
                  {content.panelTextOne}
                </p>
                <p className="ks-body-lg ks-muted">
                  {content.panelTextTwo}
                </p>
                <div className="ks-reformulacoes-intro-points" aria-label="Pontos avaliados na reformulação">
                  {pontos.map((point) => <span key={point.id}>{point.label}</span>)}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {isSectionVisible(content, "possibilidades") ? (
        <>
          <SectionStarBreak align="left" />
          <FeatureStrip
            eyebrow={content.possibilitiesEyebrow}
            title={content.possibilitiesTitle}
            text={content.possibilitiesText}
            cards={possibilidades}
          />
        </>
      ) : null}

      <AnimatePresence onExitComplete={refreshScrollMetrics}>
        {expandedCase && <ReformulacaoCompareModal item={expandedCase} onClose={() => setExpandedCase(null)} />}
      </AnimatePresence>
    </>
  );
}

/**
 * Antes/depois de um caso. Por padrão mostra só a foto; passando o mouse por
 * cima, os dois vídeos (antes e depois) tocam juntos; clicando, abre o modal
 * ampliado (ReformulacaoCompareModal) com os dois lado a lado.
 */
function ReformulacaoCompare({
  item,
  index,
  onExpand,
}: {
  item: ReformulationCase;
  index: number;
  onExpand: () => void;
}) {
  const [hovering, setHovering] = useState(false);
  const canExpand = Boolean(item.beforeVideoUrl || item.afterVideoUrl || item.beforeImageUrl || item.afterImageUrl);

  return (
    <div
      className={`ks-reformulacao-compare${canExpand ? " is-expandable" : ""}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={canExpand ? onExpand : undefined}
      role={canExpand ? "button" : undefined}
      tabIndex={canExpand ? 0 : undefined}
      aria-label={canExpand ? `Ver comparação ampliada de ${item.title}` : undefined}
      onKeyDown={canExpand ? (event) => (event.key === "Enter" || event.key === " ") && onExpand() : undefined}
    >
      <ReformulacaoMedia label="Antes" imageSrc={item.beforeImageUrl} videoSrc={item.beforeVideoUrl} index={index} playing={hovering} />
      <span className="ks-reformulacao-arrow" aria-hidden="true">
        <ArrowRight size={18} />
      </span>
      <ReformulacaoMedia label="Depois" imageSrc={item.afterImageUrl} videoSrc={item.afterVideoUrl} index={index + 1} playing={hovering} />
      {canExpand && (
        <span className="ks-reformulacao-expand" aria-hidden="true">
          <Maximize2 size={14} />
        </span>
      )}
    </div>
  );
}

function ReformulacaoMedia({
  label,
  imageSrc,
  videoSrc,
  index,
  playing = false,
}: {
  label: "Antes" | "Depois";
  imageSrc?: string;
  videoSrc?: string;
  index: number;
  playing?: boolean;
}) {
  const hasMedia = Boolean(imageSrc || videoSrc);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [playing]);

  return (
    <figure className="ks-reformulacao-photo">
      <span className="ks-reformulacao-photo-label">{label}</span>
      {hasMedia ? (
        <div className="ks-reformulacao-media-stack">
          {imageSrc ? (
            <img
              className={videoSrc && playing ? "is-hidden" : ""}
              src={imageSrc}
              alt={`Tattoo ${label.toLowerCase()} da reformulação`}
              loading="lazy"
            />
          ) : null}
          {videoSrc ? (
            <video
              ref={videoRef}
              className={playing || !imageSrc ? "is-visible" : ""}
              src={videoSrc}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : null}
        </div>
      ) : (
        <div className="ks-reformulacao-photo-placeholder" aria-label={`Espaço para a foto de ${label.toLowerCase()}`}>
          <BrandStar variant={brandStarVariant(index)} size={120} className="ks-reformulacao-photo-star" />
          <span>Adicionar foto</span>
        </div>
      )}
    </figure>
  );
}

/** Painel de vídeo (ou foto, se o caso não tiver vídeo) dentro do modal ampliado. */
function ReformulacaoModalPanel({ label, imageSrc, videoSrc }: { label: "Antes" | "Depois"; imageSrc?: string; videoSrc?: string }) {
  return (
    <div className="ks-reformulacao-modal-media">
      <span className="ks-reformulacao-photo-label">{label}</span>
      {videoSrc ? (
        <video src={videoSrc} autoPlay muted loop playsInline controls />
      ) : imageSrc ? (
        <img src={imageSrc} alt={`Tattoo ${label.toLowerCase()} da reformulação`} />
      ) : (
        <div className="ks-reformulacao-photo-placeholder" aria-label={`Sem mídia de ${label.toLowerCase()}`}>
          <BrandStar variant={2} size={140} className="ks-reformulacao-photo-star" />
        </div>
      )}
    </div>
  );
}

function ReformulacaoCompareModal({ item, onClose }: { item: ReformulationCase; onClose: () => void }) {
  return (
    <motion.div
      className="ks-tattoo-modal ks-reformulacao-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      onClick={onClose}
    >
      <motion.div
        className="ks-tattoo-modal-panel ks-reformulacao-modal-panel"
        data-lenis-prevent
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.35, ease: FLUID_EASE }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reformulacao-modal-title"
      >
        <button type="button" className="ks-tattoo-modal-close" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>

        <header className="ks-reformulacao-modal-header">
          <span className="ks-label-caps">{item.category}</span>
          <h2 id="reformulacao-modal-title" className="ks-headline-md">{item.title}</h2>
        </header>

        <div className="ks-reformulacao-modal-compare">
          <ReformulacaoModalPanel label="Antes" imageSrc={item.beforeImageUrl} videoSrc={item.beforeVideoUrl} />
          <ReformulacaoModalPanel label="Depois" imageSrc={item.afterImageUrl} videoSrc={item.afterVideoUrl} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function FlashPage() {
  const page = useFlashPageContent();
  const flashes = useFlashItems();

  if (!isPageVisible(page)) return <HiddenPageRedirect />;

  return (
    <>
      {isSectionVisible(page, "hero") ? (
        <PageHero
          kicker={page.heroKicker}
          title={page.heroTitle}
          text={page.heroText}
          image={page.heroImageUrl}
        >
          <PrimaryLink to="/orcamento">Quero criar minha tattoo</PrimaryLink>
        </PageHero>
      ) : null}
      {isSectionVisible(page, "catalogo") ? (
        <section className="ks-section">
          {flashes.length > 0 ? (
            <div className="ks-flash-page-grid">
              {flashes.map((item, index) => (
                <FlashCard
                  key={item.id}
                  name={item.title || "Flash sem nome"}
                  status={item.status || "Disponível"}
                  text={item.description || ""}
                  img={item.imageUrl}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="ks-body-lg ks-muted" style={{ textAlign: "center" }} role="status">
              Nenhum flash disponível publicado ainda.
            </p>
          )}
        </section>
      ) : null}
    </>
  );
}

function ProductsPage() {
  const location = useLocation();
  const stagger = Boolean((location.state as { fromProductsTransition?: boolean } | null)?.fromProductsTransition);
  const page = useProductsPageContent();
  const products = useProductItems();
  const heroText = [page.heroText1, page.heroText2].filter(Boolean).join("\n\n");

  if (!isPageVisible(page)) return <HiddenPageRedirect />;

  return (
    <>
      {isSectionVisible(page, "hero") ? (
        <PageHero
          kicker={page.heroKicker || "Produtos"}
          title={page.heroTitle}
          text={heroText}
          image={page.heroImageUrl}
        >
          {page.heroButton ? (
            <a
              className="ks-primary-link"
              href={wa(WA_PRODUCTS)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Consultar produtos autorais pelo WhatsApp"
            >
              {page.heroButton} <WhatsAppIcon />
            </a>
          ) : null}
        </PageHero>
      ) : null}
      {isSectionVisible(page, "catalogo") ? (
        <section className="ks-section ks-products-catalog">
          {products.length > 0 ? (
            <motion.div
              className="ks-products-category-grid"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: stagger ? 0.12 : 0.06 } },
              }}
            >
              {products.map((product, index) => (
                <ProductCategoryCard key={product.id} category={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <p className="ks-body-lg ks-muted" style={{ textAlign: "center" }} role="status">
              Nenhum produto publicado ainda.
            </p>
          )}
        </section>
      ) : null}
      <FeatureStrip
        eyebrow="Como comprar"
        title="Consulta simples pelo WhatsApp"
        text="Minha vitrine funciona como catálogo comercial, sem carrinho ou checkout nesta fase."
        cards={[
          {
            id: "buy-1",
            title: "Escolha o produto ou plano",
            text: "Navegue pela vitrine e escolha o item, print ou plano que faz sentido para você.",
          },
          {
            id: "buy-2",
            title: "Chame no WhatsApp",
            text: "Me chama com o que escolheu — te oriento sobre valores, prazos e disponibilidade.",
          },
          {
            id: "buy-3",
            title: "Confirme disponibilidade",
            text: "Ajustamos juntos detalhes, prazo de entrega ou retirada e forma de pagamento.",
          },
          {
            id: "buy-4",
            title: "Finalize a compra",
            text: "Com tudo alinhado, confirmo o pedido e te acompanho até a entrega.",
          },
        ]}
      />
      <ProductFaq />
    </>
  );
}

function ProductCategoryCard({
  category,
  index,
}: {
  category: ProductCatalogItem;
  index: number;
}) {
  const cta = category.price || "Consultar";
  const inner = (
    <>
      <div className="ks-products-category-media">
        {category.imageUrl ? (
          <img src={category.imageUrl} alt={category.title} loading={index < 2 ? "eager" : "lazy"} />
        ) : (
          <NumberedPlaceholder number={String(index + 1).padStart(2, "0")} />
        )}
      </div>
      <div className="ks-products-category-body">
        <span className="ks-label-caps ks-muted">{String(index + 1).padStart(2, "0")}</span>
        <h2 className="ks-headline-md">{category.title}</h2>
        <p className="ks-body-md ks-muted">{category.description}</p>
        <span className="ks-products-category-cta">
          {cta} <ArrowRight size={14} />
        </span>
      </div>
    </>
  );

  return (
    <motion.article
      className="ks-products-category-card"
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
      }}
    >
      {category.link ? (
        <Link to={category.link}>{inner}</Link>
      ) : (
        <a href={wa(category.whatsappMessage || WA_PRODUCTS)} target="_blank" rel="noopener noreferrer">
          {inner}
        </a>
      )}
    </motion.article>
  );
}

function ProductsTransitionOverlay({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete: () => void;
}) {
  useEffect(() => {
    if (!active) return undefined;
    lockScroll();
    const timer = window.setTimeout(onComplete, 1600);
    return () => {
      window.clearTimeout(timer);
      unlockScroll();
    };
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="ks-products-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <svg className="ks-products-transition-stroke" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d="M0 60 C200 10 400 110 600 60 S1000 10 1200 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 0.9, ease: FLUID_EASE }}
            />
          </svg>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35, ease: EASE }}
          >
            Coleções da Karina Sarte
          </motion.h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductsEntryLink({ children }: { children: React.ReactNode }) {
  const startTransition = useContext(ProductsNavContext);
  const { openComingSoon, navVisibility } = useComingSoon();
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      className={`ks-primary-link special${pressed ? " is-expanding" : ""}`}
      data-cursor="cta"
      onClick={() => {
        if (!isNavPathVisible(navVisibility, "/produtos")) {
          openComingSoon();
          return;
        }
        setPressed(true);
        window.setTimeout(() => {
          startTransition?.();
          setPressed(false);
        }, 180);
      }}
    >
      {children}
      <ArrowRight size={16} />
    </button>
  );
}

function LinkBioPublicPage() {
  return <LinkBioLanding />;
}

function formatBrazilPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const phone = digits.slice(2);
  const splitAt = digits.length > 10 ? 5 : 4;

  if (phone.length <= splitAt) return `(${areaCode}) ${phone}`;
  return `(${areaCode}) ${phone.slice(0, splitAt)}-${phone.slice(splitAt)}`;
}

function BudgetPage() {
  const content = useBudgetPageContent();
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    idea: "",
    bodyPlace: "",
    size: "",
    references: "",
    notes: "",
  });
  const [error, setError] = useState(false);

  const buildMessage = () => {
    const lines = [content.whatsappIntro || BUDGET_WHATSAPP_INTRO, "", "✨ *Briefing da tattoo*"];
    if (form.name.trim()) lines.push("", `*Nome:* ${form.name.trim()}`);
    if (form.whatsapp.trim()) lines.push(`*WhatsApp:* ${form.whatsapp.trim()}`);
    if (form.idea.trim()) lines.push("", `*Ideia:*`, form.idea.trim());
    if (form.bodyPlace.trim()) lines.push("", `*Local do corpo:* ${form.bodyPlace.trim()}`);
    if (form.size.trim()) lines.push(`*Tamanho aproximado:* ${form.size.trim()}`);
    if (form.references.trim()) lines.push("", `*Referências:*`, form.references.trim());
    if (form.notes.trim()) lines.push("", `*Observações:*`, form.notes.trim());
    return lines.join("\n");
  };

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (error && event.target.value.trim()) setError(false);
  };

  const updateWhatsapp = (event: React.ChangeEvent<HTMLInputElement>) => {
    const whatsapp = formatBrazilPhone(event.target.value);
    setForm((current) => ({ ...current, whatsapp }));
  };

  const budgetSteps = [
    { title: content.stepOneTitle, text: content.stepOneText },
    { title: content.stepTwoTitle, text: content.stepTwoText },
    { title: content.stepThreeTitle, text: content.stepThreeText },
  ];

  if (!isPageVisible(content)) return <HiddenPageRedirect />;

  const showBriefing = isSectionVisible(content, "briefing");
  const showForm = isSectionVisible(content, "formulario");

  return (
    <>
      {(showBriefing || showForm) ? (
        <section className="ks-section ks-budget-section">
          {showBriefing ? (
            <div className="ks-budget-intro">
              <BrandStar variant={3} size={126} className="ks-budget-intro-star" />
              <span className="ks-label-caps ks-gold">{content.introEyebrow}</span>
              <h1 className="ks-headline-md">Quero um orçamento</h1>
              <p className="ks-body-lg ks-muted">
                {content.introText}
              </p>
              <div className="ks-budget-flow">
                {budgetSteps.map((step, index) => (
                  <article key={step.title}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
          {showForm ? (
        <form
          className="ks-budget-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.idea.trim() && !form.references.trim()) {
              setError(true);
              return;
            }
            window.open(wa(buildMessage()), "_blank", "noopener,noreferrer");
          }}
        >
          <div className="ks-budget-form-header">
            <span className="ks-budget-form-icon"><HeartHandshake size={20} /></span>
            <div>
              <span className="ks-label-caps ks-gold">{content.formEyebrow}</span>
              {showBriefing ? (
                <h3>{content.formTitle}</h3>
              ) : (
                <h1 className="ks-headline-md">{content.formTitle || "Quero um orçamento"}</h1>
              )}
            </div>
          </div>

          <div className="ks-budget-fields">
            <label className="ks-budget-field" htmlFor="budget-name">
              <span className="ks-budget-label">Nome</span>
              <input id="budget-name" className="ks-budget-input" placeholder="Seu nome" value={form.name} onChange={update("name")} />
            </label>

            <label className="ks-budget-field" htmlFor="budget-whatsapp">
              <span className="ks-budget-label">WhatsApp</span>
              <input id="budget-whatsapp" className="ks-budget-input" placeholder="(21) 99999-9999" inputMode="tel" autoComplete="tel" value={form.whatsapp} onChange={updateWhatsapp} />
            </label>

            <label className="ks-budget-field is-full" htmlFor="budget-idea">
              <span className="ks-budget-label">Ideia da tattoo</span>
              <textarea
                id="budget-idea"
                className="ks-budget-textarea"
                rows={4}
                placeholder="Ex.: quero uma tattoo botânica delicada, com flores e um olho no centro..."
                value={form.idea}
                aria-invalid={error}
                onChange={update("idea")}
              />
            </label>

            <label className="ks-budget-field" htmlFor="budget-place">
              <span className="ks-budget-label">Local do corpo</span>
              <input id="budget-place" className="ks-budget-input" placeholder="Braço, costela, costas..." value={form.bodyPlace} onChange={update("bodyPlace")} />
            </label>

            <label className="ks-budget-field" htmlFor="budget-size">
              <span className="ks-budget-label">Tamanho aproximado</span>
              <input id="budget-size" className="ks-budget-input" placeholder="Ex.: 8 cm, palma da mão..." value={form.size} onChange={update("size")} />
            </label>

            <label className="ks-budget-field is-full" htmlFor="budget-refs">
              <span className="ks-budget-label">Referências</span>
              <textarea id="budget-refs" className="ks-budget-textarea is-compact" rows={3} placeholder="Cole links, descreva imagens ou diga o estilo que você gosta." value={form.references} onChange={update("references")} />
            </label>

            <label className="ks-budget-field is-full" htmlFor="budget-notes">
              <span className="ks-budget-label">Observações</span>
              <textarea id="budget-notes" className="ks-budget-textarea is-compact" rows={3} placeholder="Disponibilidade, dúvidas, cobertura, cicatriz, primeira tattoo..." value={form.notes} onChange={update("notes")} />
            </label>
          </div>

          {error && (
            <span className="ks-budget-error" role="alert">
              Conte sua ideia ou envie referências antes de chamar no WhatsApp.
            </span>
          )}
          <div className="ks-budget-submit-row">
            <p>{content.submitHelper}</p>
            <button type="submit" className="ks-primary-link">
              {content.submitButton} <WhatsAppIcon />
            </button>
          </div>
        </form>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="ks-section-title">
      <span className="ks-label-caps ks-gold">{eyebrow}</span>
      <h2 className="ks-headline-lg">{title}</h2>
      <p className="ks-body-lg ks-muted">{text}</p>
    </div>
  );
}

function FlashCard({
  name,
  status,
  text,
  img,
  index,
}: {
  name: string;
  status: string;
  text: string;
  img?: string;
  index: number;
}) {
  return (
    <article className="ks-flash-page-card">
      <div className="ks-flash-page-card-media">
        {img ? (
          <img src={img} alt={name} loading={index < 2 ? "eager" : "lazy"} />
        ) : (
          <NumberedPlaceholder number={String(index + 1).padStart(2, "0")} />
        )}
      </div>
      <div className="ks-flash-page-card-body">
        <StencilCrosshair size={14} color="#806E85" />
        <span className={`ks-status ${status.toLowerCase()}`}>{status}</span>
        <h3>{name}</h3>
        <p>{text}</p>
        <a
          className="ks-primary-link"
          href={wa("Olá, Karina Sarte! Vim pelo site e queria saber se esse flash tattoo ainda está disponível.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Consultar disponibilidade do flash ${name} pelo WhatsApp`}
        >
          Quero esse flash <WhatsAppIcon />
        </a>
      </div>
    </article>
  );
}

function MiniCard({ number, title, text }: { number?: string; title: string; text: string }) {
  return (
    <article className="ks-card">
      {number && <span className="ks-label-caps ks-gold">{number}</span>}
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}





function ProductFaq({ full = false }: { full?: boolean }) {
  const questions = useFaqItems();
  const [open, setOpen] = useState<number | null>(null);
  const list = questions.slice(0, full ? questions.length : 4);

  if (list.length === 0) return null;

  return (
    <section className="ks-section">
      <SectionTitle eyebrow="FAQ" title={full ? "Dúvidas frequentes" : "FAQ rápido sobre produtos"} text="Informações essenciais para consulta, reserva e atendimento." />
      <div className="ks-faq-list">
        {list.map((item, i) => (
          <motion.div
            key={item.id || item.title}
            className={`ks-faq-item${open === i ? " open" : ""}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
          >
            <button
              className="ks-faq-question"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span>{item.title}</span>
              <motion.span
                className="ks-faq-icon"
                animate={{ rotate: open === i ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  className="ks-faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <p>{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function AboutBastidorSection({
  imageUrl,
  caption,
}: {
  imageUrl: string;
  caption: string;
}) {
  const tags = ["tablet", "referências", "rabisco", "strogonoff", "ideia do nada"];
  const displayCaption =
    caption ||
    "Eu depois de comer strogonoff com feijão e decidir que era uma ótima hora pra criar arte.";

  return (
    <section className="ks-section ks-about-bastidor">
      <div className="ks-about-bastidor-grid">
        <motion.div
          className="ks-about-bastidor-copy"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <p className="ks-label-caps ks-gold">Bastidor</p>
          <h2 className="ks-headline-md">Nem toda ideia nasce séria.</h2>
          <span className="ks-about-bastidor-rule" aria-hidden="true" />
          <p className="ks-about-bastidor-lead">
            Entre uma referência, um rabisco no tablet e uma pausa meio aleatória, as ideias vão aparecendo. Nem sempre o processo é poético — às vezes ele só começa depois de comer strogonoff com feijão mesmo.
          </p>
          <ul className="ks-about-bastidor-tags">
            {tags.map((tag, index) => (
              <motion.li
                key={tag}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.2 + index * 0.06 }}
              >
                {tag}
              </motion.li>
            ))}
          </ul>
          <p className="ks-about-bastidor-aside">Criação real, sem pose.</p>
        </motion.div>

        <motion.figure
          className="ks-about-bastidor-media"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.95, ease: EASE, delay: 0.08 }}
        >
          <BrandStar variant={2} size={96} className="ks-about-bastidor-star" />
          <div className="ks-about-bastidor-frame">
            {imageUrl ? (
              <img src={imageUrl} alt="Karina Sarte criando no tablet" loading="lazy" />
            ) : (
              <div className="ks-about-bastidor-placeholder" aria-hidden="true">
                <img src="/assets/brand/star-karina-filled.png" alt="" />
                <img src="/assets/brand/star-karina-outline.png" alt="" />
              </div>
            )}
          </div>
          <figcaption>{displayCaption}</figcaption>
        </motion.figure>
      </div>
    </section>
  );
}

function AboutStudioSection({
  inviteImageUrl,
  steps,
}: {
  inviteImageUrl: string;
  steps: AboutStudioStep[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const tourSteps = [...steps].filter((item) => item.active && item.imageUrl).sort((a, b) => a.order - b.order);
  const coverImage = inviteImageUrl || tourSteps[0]?.imageUrl || "";

  const openTour = () => {
    if (tourSteps.length === 0) return;
    setStep(0);
    setOpen(true);
  };

  const closeTour = () => setOpen(false);

  return (
    <>
      <section className="ks-section ks-studio-invite">
        <div className="ks-studio-invite-media" aria-hidden="true">
          {coverImage ? <img src={coverImage} alt="" loading="lazy" /> : null}
        </div>
        <div className="ks-studio-invite-veil" aria-hidden="true" />
        <BrandStar variant={3} size={88} className="ks-studio-invite-star ks-studio-invite-star-a" />
        <BrandStar variant={2} size={36} className="ks-studio-invite-star ks-studio-invite-star-b" />

        <motion.div
          className="ks-studio-invite-content"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <p className="ks-label-caps">Meu studio</p>
          <h2 className="ks-headline-md">Quer entrar no meu espaço?</h2>
          <p>
            Se quiser, eu te mostro um pouco do lugar onde desenho, preparo cada detalhe e recebo quem chega para tatuar comigo.
          </p>
          {tourSteps.length > 0 ? (
            <button type="button" className="ks-primary-link" onClick={openTour}>
              Entrar no studio
              <ArrowRight size={16} />
            </button>
          ) : null}
        </motion.div>
      </section>

      <AnimatePresence onExitComplete={refreshScrollMetrics}>
        {open && tourSteps.length > 0 ? (
          <StudioTourExperience
            steps={tourSteps}
            step={step}
            onStepChange={setStep}
            onClose={closeTour}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function StudioTourExperience({
  steps,
  step,
  onStepChange,
  onClose,
}: {
  steps: AboutStudioStep[];
  step: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const current = steps[step] ?? steps[0]!;
  const isLast = step === steps.length - 1;
  const progress = String(step + 1).padStart(2, "0");

  const goPrev = useCallback(() => {
    onStepChange(Math.max(0, step - 1));
  }, [onStepChange, step]);

  const goNext = useCallback(() => {
    onStepChange(Math.min(steps.length - 1, step + 1));
  }, [onStepChange, step, steps.length]);

  useEffect(() => {
    lockScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNext, goPrev, onClose]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  return (
    <motion.div
      className="ks-studio-tour"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-tour-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="ks-studio-tour-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.imageUrl || current.id}
            className="ks-studio-tour-frame"
            initial={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <img src={current.imageUrl} alt={current.title} />
          </motion.div>
        </AnimatePresence>
        <div className="ks-studio-tour-veil" aria-hidden="true" />
        <BrandStar variant={3} size={72} className="ks-studio-tour-star ks-studio-tour-star-a" />
        <BrandStar variant={2} size={28} className="ks-studio-tour-star ks-studio-tour-star-b" />
      </div>

      <button type="button" className="ks-studio-tour-close" onClick={onClose} aria-label="Fechar tour do studio">
        <X size={20} />
      </button>

      <div className="ks-studio-tour-top">
        <span className="ks-studio-tour-progress" aria-live="polite">
          {progress} / 0{steps.length}
        </span>
        <nav className="ks-studio-tour-labels" aria-label="Etapas do studio">
          {steps.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`ks-studio-tour-label${index === step ? " is-active" : ""}`}
              onClick={() => onStepChange(index)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="ks-studio-tour-copy"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <p className="ks-label-caps">{current.label}</p>
          <h2 id="studio-tour-title" className="ks-headline-md">{current.title}</h2>
          <p>{current.text}</p>
          {isLast && (
            <PrimaryLink to="/orcamento" special>
              Falar comigo sobre minha tattoo
            </PrimaryLink>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="ks-studio-tour-nav">
        <button
          type="button"
          className="ks-studio-tour-arrow"
          onClick={goPrev}
          disabled={step === 0}
          aria-label="Etapa anterior"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          className="ks-studio-tour-arrow"
          onClick={goNext}
          disabled={isLast}
          aria-label="Próxima etapa"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function FeatureStrip({
  eyebrow,
  title,
  text,
  cards,
}: {
  eyebrow: string;
  title: string;
  text: string;
  cards: { id: string; title: string; text: string }[];
}) {
  const [lineDrawn, setLineDrawn] = useState(false);

  if (!cards.length) return null;

  return (
    <section className="ks-section ks-care-path">
      <div className="ks-care-path-backdrop" aria-hidden="true">
        <div className="ks-care-path-grain" />
      </div>
      <BrandStar variant={2} size={280} className="ks-care-path-deco ks-care-path-deco-a" />
      <BrandStar variant={3} size={160} className="ks-care-path-deco ks-care-path-deco-b" />

      <motion.header
        className="ks-care-path-intro"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 0.85, ease: EASE }}
      >
        <p className="ks-label-caps ks-gold">{eyebrow}</p>
        <h2 className="ks-headline-md">{title}</h2>
        <p className="ks-care-path-lead">{text}</p>
      </motion.header>

      <motion.div
        className="ks-care-path-track"
        style={{ "--ks-care-cols": Math.min(cards.length, 4) } as React.CSSProperties}
        onViewportEnter={() => setLineDrawn(true)}
        viewport={{ once: true, margin: "-10%" }}
      >
        <div className={`ks-care-path-line${lineDrawn ? " is-drawn" : ""}`} aria-hidden="true">
          <span className="ks-care-path-line-draw" />
        </div>

        <ol className="ks-care-path-steps">
          {cards.map((card, index) => {
            const num = String(index + 1).padStart(2, "0");
            const offset = index % 3;

            return (
              <motion.li
                key={card.id}
                className={`ks-care-path-step ks-care-path-step-${offset}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.75, ease: EASE, delay: 0.22 + index * 0.12 }}
              >
                <span className="ks-care-path-marker" aria-hidden="true">
                  <StarGlyph size={14} color="#5B4964" pulse />
                </span>
                <div className="ks-care-path-copy">
                  <span className="ks-care-path-num">{num}</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </motion.div>
    </section>
  );
}

function IntroPage({ path, children }: { path: keyof typeof SECTION_INTRO_TITLES; children: React.ReactNode }) {
  const location = useLocation();
  const skipIntro = Boolean((location.state as { fromProductsTransition?: boolean } | null)?.fromProductsTransition);
  const [contentReady, setContentReady] = useState(false);
  const title = SECTION_INTRO_TITLES[path];
  const pageClassName = `ks-page-sections ks-page-sections-${path.slice(1)}`;

  if (skipIntro) {
    return <div className={pageClassName}>{children}</div>;
  }

  const handleReveal = () => {
    setContentReady(true);
    requestAnimationFrame(() => refreshScrollMetrics());
  };

  return (
    <>
      <SectionIntro title={title} onReveal={handleReveal} />
      <motion.div
        className={pageClassName}
        initial={{ opacity: 0 }}
        animate={{ opacity: contentReady ? 1 : 0 }}
        transition={{ duration: 0.75, ease: FLUID_EASE }}
      >
        {children}
      </motion.div>
    </>
  );
}

function SectionIntro({ title, onReveal }: { title: string; onReveal?: () => void }) {
  const [visible, setVisible] = useState(true);
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      onRevealRef.current?.();
      setVisible(false);
    }, 1850);

    return () => clearTimeout(revealTimer);
  }, []);

  return (
    <AnimatePresence onExitComplete={refreshScrollMetrics}>
      {visible && (
        <motion.div
          className="ks-section-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: FLUID_EASE }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7, delay: 0.15, ease: FLUID_EASE }}
          >
            {title}
          </motion.h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CtaBand({
  title,
  text,
  cta,
  to,
  href,
  artwork,
}: {
  title: string;
  text: string;
  cta: string;
  to?: string;
  href?: string;
  artwork?: string;
}) {
  return (
    <section className="ks-cta-band">
      {artwork && <img className="ks-cta-band-artwork" src={artwork} alt="" aria-hidden="true" />}
      <h2 className="ks-headline-md">{title}</h2>
      <p className="ks-body-lg ks-muted">{text}</p>
      {to ? <PrimaryLink to={to}>{cta}</PrimaryLink> : <a className="ks-primary-link" href={href}>{cta}<ArrowRight size={16} /></a>}
    </section>
  );
}

function PrimaryLink({ to, children, special = false }: { to: string; children: React.ReactNode; special?: boolean }) {
  return (
    <GuardedLink className={`ks-primary-link${special ? " special" : ""}`} to={to} data-cursor="cta">
      {children}
      <ArrowRight size={16} />
    </GuardedLink>
  );
}

function TextLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <GuardedLink className="ks-text-link" to={to}>
      {children}
      <ArrowRight size={14} />
    </GuardedLink>
  );
}

function NotFoundPage() {
  const waHref = wa("Olá, Karina! Vim pelo site e queria conversar sobre uma tattoo.");

  return (
    <section className="ks-section ks-not-found" aria-labelledby="ks-not-found-title">
      <BrandStar variant={2} size={180} className="ks-not-found-deco" />
      <div className="ks-not-found-inner">
        <span className="ks-label-caps ks-gold">404</span>
        <h1 id="ks-not-found-title" className="ks-headline-md">
          Ops, essa arte saiu do caminho.
        </h1>
        <p className="ks-body-lg ks-muted">
          A página que você tentou acessar não foi encontrada. Volte para o início, veja o portfólio ou
          fale comigo pelo WhatsApp.
        </p>
        <div className="ks-not-found-actions ks-actions">
          <PrimaryLink to="/">Voltar para o início</PrimaryLink>
          <TextLink to="/portfolio">Ver portfólio</TextLink>
          <a
            className="ks-primary-link"
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar com a Karina Sarte pelo WhatsApp"
          >
            Falar com a Karina <WhatsAppIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

function FloatingWhatsApp() {
  const location = useLocation();
  const message = useMemo(
    () => (location.pathname === "/produtos" ? WA_PRODUCTS : WA_DEFAULT),
    [location.pathname],
  );
  return (
    <a
      className="ks-floating-whatsapp"
      href={wa(message)}
      aria-label="Oi, vamos conversar? Abrir WhatsApp"
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="cta"
    >
      <WhatsAppIcon />
      <span className="ks-floating-whatsapp-label">Oi, vamos conversar?</span>
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.522 5.851L.054 23.25a.75.75 0 0 0 .916.916l5.453-1.474A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.964-1.363l-.357-.214-3.685.997.985-3.594-.234-.371A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
    </svg>
  );
}

function wa(message: string) {
  return `${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export default function App() {
  return <AppShell />;
}
