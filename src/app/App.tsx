import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  X,
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
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { StarGlyph } from "./components/StarGlyph";
import { StencilCrosshair } from "./components/StencilCrosshair";
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
} from "./scroll";
import { tattooImages } from "./tattoo-images";

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FLUID_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const WHATSAPP = "https://wa.me/5521990724477";
const PAGE_HERO_DEFAULT_IMAGE = tattooImages.sessionWide;

/** Mocks únicos por flash (evita repetir a mesma foto) */
const flashMocks = [
  tattooImages.fineLineBotanical,
  tattooImages.minimalSymbols,
  tattooImages.floralHealed,
  tattooImages.flashSheet,
  tattooImages.armTattoo,
  tattooImages.blackworkOrganic,
] as const;

const WA_DEFAULT = "Olá, Kah! Vim pelo site e queria fazer um orçamento.";
const WA_PRODUCTS = "Olá, Kah! Vim pelo site e queria saber mais sobre os produtos disponíveis.";

const ProductsNavContext = createContext<(() => void) | null>(null);

const SECTION_INTRO_TITLES: Record<string, string> = {
  "/sobre": "Sobre a Kah",
  "/portfolio": "Portfólio",
  "/flash-tattoos": "Flash Tattoos",
  "/produtos": "Coleções da Kah",
  "/como-funciona": "Como funciona",
  "/cuidados": "Cuidados",
  "/depoimentos": "Depoimentos",
  "/faq": "FAQ",
};
const BUDGET_WHATSAPP_INTRO = "Olá, Kah! Vim pelo site e queria fazer um orçamento de tattoo.";

function productWhatsAppMessage(productName: string) {
  return `Olá, Kah! Vim pelo site e me interessei por ${productName}. Gostaria de saber mais.`;
}

function tattooChoiceMessage(tattooName: string) {
  return `Olá, Kah! Vim pelo site e escolhi a tattoo "${tattooName}". Gostaria de saber mais.`;
}

function filterPortfolioCategory(itemCategory: string, filter: string) {
  if (filter === "Projetos Autorais") return itemCategory === "Autoral";
  if (filter === "Cicatrizadas") return itemCategory === "Cicatrizada";
  return itemCategory === filter;
}

function tattooStatusClass(status: string) {
  const normalized = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (normalized === "reservado" || normalized === "tatuado" || normalized === "referencia") {
    return normalized;
  }
  return "";
}

const galleryItems = [
  {
    title: "Fine line botânica",
    category: "Fine Line",
    img: tattooImages.fineLineBotanical,
    alt: "Tatuagem botânica delicada em fine line",
  },
  {
    title: "Traço ornamental",
    category: "Autoral",
    img: tattooImages.ornamental,
    alt: "Projeto autoral de tatuagem ornamental",
  },
  {
    title: "Freehand orgânico",
    category: "Blackwork",
    img: tattooImages.blackworkOrganic,
    alt: "Tatuagem autoral em blackwork orgânico",
  },
  {
    title: "Símbolos pequenos",
    category: "Minimalista",
    img: tattooImages.minimalSymbols,
    alt: "Tatuagens pequenas e minimalistas",
  },
  {
    title: "Floral cicatrizado",
    category: "Cicatrizada",
    img: tattooImages.floralHealed,
    alt: "Tatuagem floral cicatrizada",
  },
  {
    title: "Flash autoral",
    category: "Flash Tattoo",
    img: tattooImages.flashSheet,
    alt: "Flash tattoo autoral em preto",
  },
];

const flashItems = [
  {
    name: "Floral lunar",
    status: "Disponível",
    text: "Composição delicada para braço, costela ou tornozelo.",
    img: flashMocks[0],
  },
  {
    name: "Ornamento estrela",
    status: "Reservado",
    text: "Linhas finas com presença mística e tamanho médio.",
    img: flashMocks[1],
  },
  {
    name: "Ramo livre",
    status: "Disponível",
    text: "Flash botânico único, ideal para antebraço ou nuca.",
    img: flashMocks[2],
  },
  {
    name: "Selo autoral",
    status: "Tatuado",
    text: "Referência de flash já executado para inspiração.",
    img: flashMocks[3],
  },
  {
    name: "Traço ornamental",
    status: "Disponível",
    text: "Linhas ornamentais autorais, perfeitas para antebraço ou panturrilha.",
    img: flashMocks[4],
  },
  {
    name: "Freehand orgânico",
    status: "Disponível",
    text: "Formas orgânicas criadas em freehand, com traço único e presença autoral.",
    img: flashMocks[5],
  },
];

const productGroups = [
  {
    title: "Planos de Tattoo",
    cta: "Consultar planos",
    hoverText: "Opções para tattoos pequenas, projetos autorais e sessões personalizadas.",
    img: tattooImages.cardAutoral,
  },
  {
    title: "Flash Tattoos",
    cta: "Ver flashes disponíveis",
    hoverText: "Artes prontas com identidade própria e disponibilidade limitada.",
    img: tattooImages.cardFlash,
  },
  {
    title: "Prints & Artes",
    cta: "Consultar artes",
    hoverText: "Ilustrações autorais para decorar, presentear ou colecionar.",
    img: tattooImages.cardPrint,
  },
  {
    title: "Kits e Produtos",
    cta: "Consultar disponibilidade",
    hoverText: "Itens selecionados e kits ligados ao universo da tattoo.",
    img: tattooImages.cardKits,
  },
];

const productCategories = [
  {
    title: "Planos de Tattoo",
    description:
      "Opções para tattoos pequenas, projetos autorais, sessões personalizadas e flashes exclusivos.",
    cta: "Consultar planos",
    img: productGroups[0].img,
    message: "Olá, Kah! Vim pelo site e gostaria de consultar os planos de tattoo.",
  },
  {
    title: "Flash Tattoos",
    description: "Artes prontas e disponíveis para tatuar, com identidade própria e disponibilidade limitada.",
    cta: "Ver flashes disponíveis",
    img: productGroups[1].img,
    message: "Olá, Kah! Vim pelo site e gostaria de ver os flash tattoos disponíveis.",
    link: "/flash-tattoos",
  },
  {
    title: "Prints & Artes",
    description: "Ilustrações autorais para decorar, presentear ou colecionar.",
    cta: "Consultar artes",
    img: productGroups[2].img,
    message: "Olá, Kah! Vim pelo site e gostaria de consultar prints e artes.",
  },
  {
    title: "Kits e Produtos",
    description: "Produtos selecionados, itens personalizados e possíveis kits ligados ao universo da tattoo.",
    cta: "Consultar disponibilidade",
    img: productGroups[3].img,
    message: "Olá, Kah! Vim pelo site e gostaria de consultar kits e produtos.",
  },
] as const;

const tattooGalleryMocks = [
  tattooImages.fineLineBotanical,
  tattooImages.ornamental,
  tattooImages.blackworkOrganic,
  tattooImages.minimalSymbols,
  tattooImages.floralHealed,
  tattooImages.flashSheet,
  tattooImages.armTattoo,
  tattooImages.healedWork,
  tattooImages.flashDesign,
  tattooImages.healedDetail,
] as const;

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

const seo: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Kah Sarte Tattoo | Tatuagens Autorais e Flash Tattoos",
    description:
      "Crio tatuagens autorais, flash tattoos e produtos artísticos em Teresópolis, RJ. Kah Sarte Tattoo.",
  },
  "/sobre": {
    title: "Sobre a Kah | Kah Sarte Tattoo",
    description: "Conheça a Kah Sarte Tattoo: tatuagens autorais, identidade visual e processo criativo em Teresópolis, RJ.",
  },
  "/portfolio": {
    title: "Portfólio de Tattoos | Kah Sarte Tattoo",
    description:
      "Veja meus trabalhos recentes: fine line, minimalistas, blackwork e projetos personalizados na Kah Sarte Tattoo.",
  },
  "/flash-tattoos": {
    title: "Flash Tattoos Disponíveis | Kah Sarte Tattoo",
    description: "Confira meus flash tattoos autorais disponíveis para tatuar na Kah Sarte Tattoo.",
  },
  "/produtos": {
    title: "Produtos Autorais, Prints e Planos de Tattoo | Kah Sarte Tattoo",
    description:
      "Produtos autorais, prints, artes, kits, flash tattoos e planos de tattoo disponíveis na Kah Sarte Tattoo.",
  },
  "/como-funciona": {
    title: "Como Funciona o Atendimento | Kah Sarte Tattoo",
    description: "Entenda meu processo de orçamento, criação, agenda e sessão na Kah Sarte Tattoo.",
  },
  "/cuidados": {
    title: "Cuidados com Tattoo | Kah Sarte Tattoo",
    description: "Orientações de cuidados antes, durante e depois da tattoo, cicatrização e experiência de atendimento.",
  },
  "/depoimentos": {
    title: "Depoimentos | Kah Sarte Tattoo",
    description: "Relatos de quem já tatuou comigo na Kah Sarte Tattoo.",
  },
  "/faq": {
    title: "FAQ | Kah Sarte Tattoo",
    description: "Perguntas frequentes sobre orçamento, flash tattoos, produtos e cuidados com tattoo.",
  },
  "/orcamento": {
    title: "Orçamento de Tattoo | Kah Sarte Tattoo",
    description: "Envie sua ideia e fale comigo pelo WhatsApp para orçamento de tattoo.",
  },
};

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
      <AppLayout preloaderDone={preloaderDone} setPreloaderDone={setPreloaderDone} />
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
      <div className="ks-grain" aria-hidden="true" />
      <Preloader
        onComplete={() => {
          setPreloaderDone(true);
          window.setTimeout(() => refreshScrollMetrics(), 100);
        }}
      />
      <div
        className="ks-shell"
        style={{
          opacity: preloaderDone ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        <ProductsNavContext.Provider value={startProductsTransition}>
          <Header />
          <AnimatedRoutes />
          <Footer />
          <FloatingWhatsApp />
        </ProductsNavContext.Provider>
      </div>
      <ProductsTransitionOverlay active={productsTransition} onComplete={completeProductsTransition} />
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const hasSectionIntro = Boolean(SECTION_INTRO_TITLES[location.pathname]);

  useEffect(() => {
    const main = document.getElementById("ks-scroll-root");
    if (main) observeScrollRoot(main);

    return () => unobserveScrollRoot();
  }, []);

  useEffect(() => {
    const BASE = "https://kahsartetattoo.com.br";
    const pageSeo = seo[location.pathname] ?? seo["/"];
    const url = BASE + location.pathname;

    // title
    document.title = pageSeo.title;

    // helper: upsert <meta> / <link> by selector
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        const tag = selector.startsWith("link") ? "link" : "meta";
        el = document.createElement(tag);
        const [a, v] = selector.replace(/[\[\]'"]/g, " ").trim().split(/\s+/);
        el.setAttribute(a, v ?? "");
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta("meta[name='description']",           "content", pageSeo.description);
    setMeta("link[rel='canonical']",               "href",    url);
    setMeta("meta[property='og:url']",             "content", url);
    setMeta("meta[property='og:title']",           "content", pageSeo.title);
    setMeta("meta[property='og:description']",     "content", pageSeo.description);
    setMeta("meta[name='twitter:title']",          "content", pageSeo.title);
    setMeta("meta[name='twitter:description']",    "content", pageSeo.description);

    // Um único refresh após o conteúdo da rota se estabilizar.
    // O onAnimationComplete já dispara refreshScrollMetrics() ao fim da animação de entrada;
    // este timeout cobre conteúdo que carrega levemente depois (fontes, imagens lazy).
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
          key={location.pathname}
          initial={hasSectionIntro ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={hasSectionIntro ? { opacity: 0 } : { opacity: 0, y: -14 }}
          transition={{ duration: hasSectionIntro ? 0.3 : 0.5, ease: EASE }}
          onAnimationComplete={(definition) => {
            if (definition === "animate") refreshScrollMetrics();
          }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/sobre" element={<IntroPage path="/sobre"><AboutPage /></IntroPage>} />
            <Route path="/portfolio" element={<IntroPage path="/portfolio"><PortfolioPage /></IntroPage>} />
            <Route path="/flash-tattoos" element={<IntroPage path="/flash-tattoos"><FlashPage /></IntroPage>} />
            <Route path="/produtos" element={<IntroPage path="/produtos"><ProductsPage /></IntroPage>} />
            <Route path="/como-funciona" element={<IntroPage path="/como-funciona"><ProcessPage /></IntroPage>} />
            <Route path="/cuidados" element={<IntroPage path="/cuidados"><CarePage /></IntroPage>} />
            <Route path="/depoimentos" element={<IntroPage path="/depoimentos"><TestimonialsPage /></IntroPage>} />
            <Route path="/faq" element={<IntroPage path="/faq"><FaqPage /></IntroPage>} />
            <Route path="/orcamento" element={<BudgetPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function PageHero({
  kicker,
  title,
  text,
  image = PAGE_HERO_DEFAULT_IMAGE,
  children,
}: {
  kicker: string;
  title: string;
  text: string;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="ks-page-hero">
      <img className="ks-page-hero-image" src={image} alt="" aria-hidden="true" loading="eager" />
      <div className="ks-page-hero-shade" aria-hidden="true" />
      <motion.div
        className="ks-page-hero-content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <span className="ks-label-caps ks-muted">{kicker}</span>
        <h1 className="ks-display-xl">{title}</h1>
        <p className="ks-body-lg">{text}</p>
        {children}
      </motion.div>
    </section>
  );
}

const homeServiceCards = [
  {
    title: "Tatuagens Autorais",
    text: "Projetos personalizados criados a partir da sua ideia, referência e estilo.",
    img: tattooImages.cardAutoral,
    to: "/portfolio",
    cta: "Ver projetos",
  },
  {
    title: "Flash Tattoos",
    text: "Artes prontas e exclusivas, com disponibilidade limitada para tatuar.",
    img: tattooImages.cardFlash,
    to: "/flash-tattoos",
    cta: "Ver flashes",
  },
  {
    title: "Produtos Autorais",
    text: "Produtos, prints e coleções criadas dentro do universo visual da Kah.",
    img: tattooImages.cardPrint,
    to: "/produtos",
    cta: "Ver produtos",
  },
  {
    title: "Cuidados e Experiência",
    text: "Atendimento com cuidado, orientação e responsabilidade em todas as etapas.",
    img: tattooImages.cardCare,
    to: "/cuidados",
    cta: "Saiba mais",
  },
] as const;

const muralLayout = ["ks-mural-a", "ks-mural-b", "ks-mural-c", "ks-mural-d", "ks-mural-e", "ks-mural-f"] as const;

function HomePage() {
  return (
    <div className="ks-home-flow">
      <HomeHero />
      <EditorialSplitSection />
      <HomeServicesSection />
      <MuralPortfolioPreview />
      <ProductsPreview />
      <CtaBand
        title="Vamos criar sua próxima tattoo?"
        text="Envie sua ideia, referências, tamanho aproximado e local do corpo. A Kah analisa sua proposta e orienta o melhor caminho para transformar sua ideia em arte na pele."
        cta="Quero um orçamento"
        to="/orcamento"
      />
    </div>
  );
}

function HomeHero() {
  return (
    <section className="ks-home-hero">
      <img
        className="ks-home-hero-bg"
        src={tattooImages.hero}
        alt=""
        aria-hidden="true"
        loading="eager"
      />
      <div className="ks-home-hero-shade" aria-hidden="true" />
      <div className="ks-home-hero-ornament" aria-hidden="true">
        <StarGlyph size={40} color="#6b2e35" />
      </div>
      <motion.div
        className="ks-home-hero-content"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <span className="ks-label-caps">Teresópolis · RJ</span>
        <h1 className="ks-display-xl">Arte na pele com identidade, cuidado e intenção.</h1>
        <p className="ks-body-lg">
          Tatuagens autorais, flash tattoos e criações exclusivas pensadas para transformar ideias em arte.
        </p>
        <div className="ks-actions">
          <PrimaryLink to="/orcamento">Quero fazer um orçamento</PrimaryLink>
          <TextLink to="/portfolio">Ver portfólio</TextLink>
        </div>
      </motion.div>
    </section>
  );
}

function EditorialSplitSection() {
  return (
    <section className="ks-editorial-split">
      <motion.div
        className="ks-editorial-split-text"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <span className="ks-label-caps ks-gold">Manifesto</span>
        <h2 className="ks-headline-lg">Entre o traço, a pele e a história.</h2>
        <p className="ks-body-lg ks-muted">
          Cada projeto nasce de uma ideia, uma referência ou uma memória. A proposta da Kah é transformar esse ponto de
          partida em uma tattoo com identidade, equilíbrio e cuidado em cada detalhe.
        </p>
        <PrimaryLink to="/sobre">Conhecer a artista</PrimaryLink>
      </motion.div>
      <div className="ks-editorial-split-media">
        <img
          src={tattooImages.tattooInProgress}
          alt="Sessão de tatuagem em andamento"
          loading="lazy"
        />
      </div>
      <motion.div
        className="ks-editorial-float"
        initial={{ opacity: 0, y: 32, rotate: -6 }}
        whileInView={{ opacity: 1, y: 0, rotate: -3 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
      >
        <img
          src={tattooImages.lineDetail}
          alt="Detalhe de tatuagem em traço fino"
          loading="lazy"
        />
      </motion.div>
    </section>
  );
}

function HomeServicesSection() {
  return (
    <section className="ks-services-section">
      <SectionTitle
        eyebrow="Serviços"
        title="O que você encontra por aqui"
        text="Projetos autorais, flash tattoos e produtos criados para quem busca arte com personalidade."
      />
      <div className="ks-services-grid">
        {homeServiceCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.65, delay: index * 0.08, ease: EASE }}
          >
            <Link className="ks-service-card" to={card.to}>
              <div className="ks-service-card-media">
                <img src={card.img} alt={card.title} loading="lazy" />
              </div>
              <div className="ks-service-card-body">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <span className="ks-service-card-link">{card.cta}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MuralPortfolioPreview() {
  const items = galleryItems.slice(0, 6);

  return (
    <section className="ks-mural-section">
      <SectionTitle
        eyebrow="Portfólio"
        title="Trabalhos recentes"
        text="Uma seleção de tattoos, flashes e projetos autorais criados pela Kah."
      />
      <div className="ks-mural-grid">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            className={`ks-mural-item ${muralLayout[index]}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
          >
            <Link to="/portfolio" style={{ display: "block", height: "100%" }}>
              <img src={item.img} alt={item.alt} loading={index < 2 ? "eager" : "lazy"} />
              <div className="ks-mural-item-caption">
                <span>{item.category}</span>
                <strong>{item.title}</strong>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
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
          <span className="ks-about-me-tag">Karina · Kah Sarte</span>
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
  const flashWhatsAppHref = wa("Olá, Kah! Vim pelo site e queria ver os flash tattoos disponíveis.");

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
                <a className="ks-primary-link ks-flash-feature-cta" href={flashWhatsAppHref} target="_blank" rel="noopener noreferrer">
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

function ProductsPreview() {
  return (
    <section className="ks-section ks-products-preview ks-section-cream">
      <div className="ks-products-header">
        <span className="ks-label-caps ks-gold">Coleções</span>
        <h2 className="ks-headline-lg">Coleções da Kah</h2>
        <p className="ks-body-lg ks-muted" style={{ marginTop: 16, maxWidth: 640 }}>
          Arte para usar, colecionar e levar na pele. Além das tatuagens, a Kah também cria produtos, artes, flashes e
          coleções exclusivas para quem se identifica com seu universo visual.
        </p>
      </div>
      <div className="ks-products-grid">
        {productGroups.map((group, index) => (
          <ProductVisualCard key={group.title} group={group} index={index} to="/produtos" />
        ))}
      </div>
      <div className="ks-center-action" style={{ marginTop: "clamp(28px, 4vw, 48px)" }}>
        <ProductsEntryLink>Ver mais produtos</ProductsEntryLink>
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
  group: (typeof productGroups)[0];
  index: number;
  to?: string;
}) {
  const motionProps = {
    className: "ks-product-visual-card",
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-8%" },
    transition: { duration: 0.7, delay: index * 0.08, ease: EASE },
  };

  const content = (
    <>
      <img src={group.img} alt={group.title} loading="lazy" />
      <div className="ks-product-visual-overlay">
        <span className="ks-label-caps">{String(index + 1).padStart(2, "0")}</span>
        <h3>{group.title}</h3>
        <p className="ks-product-visual-hover-text">{group.hoverText}</p>
        <span className="ks-product-visual-cta">
          {group.cta} <ArrowRight size={12} />
        </span>
      </div>
    </>
  );

  if (to) {
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
          >
            Eu escolho essa <WhatsAppIcon />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AboutPage() {
  return (
    <>
      <PageHero
        kicker="A artista"
        title="Sobre a Kah"
        text="A Kah Sarte Tattoo cria projetos que unem arte, identidade e cuidado. Cada tattoo é pensada de forma personalizada, respeitando a história, o corpo e o estilo de quem escolhe levar aquela arte na pele."
        image={tattooImages.heroAbout}
      >
        <PrimaryLink to="/orcamento">Quero criar minha tattoo</PrimaryLink>
      </PageHero>
      <section className="ks-section ks-two-col ks-section-cream">
        <motion.div
          className="ks-preview-image"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <img
            src={tattooImages.artistTattooing}
            alt="Artista realizando tatuagem"
            loading="lazy"
          />
        </motion.div>
        <div className="ks-stack">
          <blockquote className="ks-about-me-quote">
            “Cada traço carrega intenção — a tattoo precisa conversar com quem você é e com o corpo que a recebe.”
          </blockquote>
          <p className="ks-body-lg ks-muted">
            Com estética autoral, traço fino e referências botânicas, a Kah constrói projetos que equilibram delicadeza e
            presença. O atendimento começa com escuta: entender referências, proporções e o significado por trás da ideia.
          </p>
          <p className="ks-body-lg ks-muted">
            Em Teresópolis, o estúdio é um espaço de criação e cuidado — da primeira mensagem à cicatrização, com
            orientação clara em cada etapa.
          </p>
          <PrimaryLink to="/orcamento">Quero criar minha tattoo</PrimaryLink>
        </div>
      </section>
      <FeatureStrip />
    </>
  );
}

function PortfolioPage() {
  const categories = ["Todos", "Fine Line", "Minimalista", "Blackwork", "Projetos Autorais", "Flash Tattoo", "Cicatrizadas"];
  const [activeCategory, setActiveCategory] = useState("Todos");
  const filteredItems =
    activeCategory === "Todos"
      ? galleryItems
      : galleryItems.filter((item) => filterPortfolioCategory(item.category, activeCategory));

  return (
    <>
      <PageHero
        kicker="Portfólio"
        title="Portfólio"
        text="Conheça tattoos, flashes e projetos autorais criados pela Kah."
        image={tattooImages.heroPortfolio}
      />
      <section className="ks-section">
        <div className="ks-filter-row">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <ImageGrid items={filteredItems} />
        <CtaBand
          title="Gostei desse estilo, quero um orçamento"
          text="Envie sua ideia e referências para construirmos uma proposta personalizada."
          cta="Quero um orçamento"
          to="/orcamento"
        />
      </section>
    </>
  );
}

function FlashPage() {
  return (
    <>
      <PageHero
        kicker="Flash Tattoos"
        title="Flash Tattoos disponíveis"
        text="Artes autorais prontas para tatuar, com disponibilidade limitada."
        image={tattooImages.heroFlash}
      />
      <section className="ks-section">
        <div className="ks-flash-page-grid">
          {flashItems.map((item) => (
            <FlashCard key={item.name} {...item} img={item.img} />
          ))}
        </div>
      </section>
    </>
  );
}

function ProductsPage() {
  const location = useLocation();
  const stagger = Boolean((location.state as { fromProductsTransition?: boolean } | null)?.fromProductsTransition);

  return (
    <>
      <section className="ks-products-page-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span className="ks-label-caps ks-gold">Coleções</span>
          <h1 className="ks-display-xl">Coleções da Kah</h1>
          <p className="ks-body-lg ks-muted" style={{ maxWidth: 680, marginTop: 18 }}>
            Arte para usar, colecionar e levar na pele.
          </p>
          <p className="ks-body-lg ks-muted" style={{ maxWidth: 720, marginTop: 12 }}>
            Produtos autorais, planos, flashes, prints e criações exclusivas feitas para aproximar ainda mais a arte da
            Kah de quem acompanha seu trabalho.
          </p>
          <a className="ks-primary-link" href={wa(WA_PRODUCTS)} style={{ marginTop: 28 }}>
            Consultar produtos pelo WhatsApp <WhatsAppIcon />
          </a>
        </motion.div>
      </section>
      <section className="ks-section ks-products-catalog">
        <motion.div
          className="ks-products-category-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: stagger ? 0.12 : 0.06 } },
          }}
        >
          {productCategories.map((category, index) => (
            <ProductCategoryCard key={category.title} category={category} index={index} />
          ))}
        </motion.div>
      </section>
      <HowToBuy />
      <ProductFaq />
      <CtaBand
        title="Quer levar a arte da Kah para além da pele?"
        text="Consulte disponibilidade, valores e opções personalizadas pelo WhatsApp."
        cta="Consultar pelo WhatsApp"
        href={wa(WA_PRODUCTS)}
      />
    </>
  );
}

function ProductCategoryCard({
  category,
  index,
}: {
  category: (typeof productCategories)[number];
  index: number;
}) {
  const inner = (
    <>
      <div className="ks-products-category-media">
        <img src={category.img} alt={category.title} loading="lazy" />
      </div>
      <div className="ks-products-category-body">
        <span className="ks-label-caps ks-muted">{String(index + 1).padStart(2, "0")}</span>
        <h2 className="ks-headline-md">{category.title}</h2>
        <p className="ks-body-md ks-muted">{category.description}</p>
        <span className="ks-products-category-cta">
          {category.cta} <ArrowRight size={14} />
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
      {"link" in category && category.link ? (
        <Link to={category.link}>{inner}</Link>
      ) : (
        <a href={wa(category.message)} target="_blank" rel="noopener noreferrer">
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
            Coleções da Kah
          </motion.h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductsEntryLink({ children }: { children: React.ReactNode }) {
  const startTransition = useContext(ProductsNavContext);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      className={`ks-primary-link special${pressed ? " is-expanding" : ""}`}
      data-cursor="cta"
      onClick={() => {
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

function ProcessPage() {
  const steps = ["Envie sua ideia", "Receba uma orientação", "Agende sua sessão", "Faça sua tattoo"];
  return (
    <>
      <PageHero
        kicker="Como funciona"
        title="Como funciona o atendimento"
        text="Da primeira mensagem ao cuidado final, organizo um processo direto, acolhedor e claro com você."
        image={tattooImages.heroProcess}
      />
      <section className="ks-section">
        <StepSection steps={steps} />
      </section>
      <CtaBand title="Começar meu orçamento" text="Conte sua ideia, local do corpo, tamanho aproximado e referências." cta="Começar agora" to="/orcamento" />
    </>
  );
}

const careBlocks = [
  ["Antes da tattoo", "Prepare o corpo e a pele: hidratação, descanso e evitar álcool ajudam na sessão. Envie referências e tire dúvidas antes do dia."],
  ["Durante a sessão", "Ambiente acolhedor, materiais descartáveis e biossegurança em cada etapa. Você é orientada durante todo o processo."],
  ["Depois da tattoo", "Siga as orientações de limpeza e proteção. A cicatrização é parte do projeto — respeite os prazos indicados."],
  ["Cicatrização", "Coçar, exposição solar e tecidos apertados podem comprometer o resultado. Acompanhe as fases da pele com calma."],
  ["O que evitar", "Piscina, mar, sol direto e exercícios intensos nas primeiras semanas, conforme orientação personalizada."],
  ["Dúvidas comuns", "Qualquer sinal fora do esperado deve ser comunicado. Estou disponível para orientar durante a cicatrização."],
] as const;

function CarePage() {
  return (
    <>
      <PageHero
        kicker="Cuidados"
        title="Cuidado antes, durante e depois da tattoo"
        text="A experiência da tattoo envolve escuta, preparo, segurança e orientação. Cada etapa é pensada para que o processo seja mais tranquilo, responsável e cuidadoso."
        image={tattooImages.heroCare}
      />
      <section className="ks-section">
        <div className="ks-card-grid three">
          {careBlocks.map(([title, text]) => (
            <MiniCard key={title} title={title} text={text} />
          ))}
        </div>
      </section>
    </>
  );
}

function TestimonialsPage() {
  return (
    <>
      <PageHero
        kicker="Depoimentos"
        title="Quem já tatuou comigo"
        text="Relatos sobre resultado, cuidado e experiência de atendimento comigo."
        image={tattooImages.heroTestimonials}
      />
      <section className="ks-section">
        <div className="ks-card-grid three">
          {["Amei o resultado, ficou exatamente do jeito que eu queria.", "Além da tattoo linda, o atendimento foi super cuidadoso.", "Me senti segura durante todo o processo."].map((text, index) => (
            <article className="ks-card" key={text}>
              <BadgeCheck size={18} />
              <p className="ks-body-lg">"{text}"</p>
              <span className="ks-label-caps ks-muted">Cliente {String(index + 1).padStart(2, "0")}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function FaqPage() {
  return (
    <>
      <PageHero
        kicker="FAQ"
        title="Perguntas frequentes"
        text="Respostas rápidas sobre orçamento, desenhos personalizados, flash tattoos, produtos e cuidados pós-tattoo."
        image={tattooImages.heroFaq}
      />
      <ProductFaq full />
    </>
  );
}

function BudgetPage() {
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
    const lines = [BUDGET_WHATSAPP_INTRO, ""];
    if (form.name.trim()) lines.push(`Nome: ${form.name.trim()}`);
    if (form.whatsapp.trim()) lines.push(`WhatsApp: ${form.whatsapp.trim()}`);
    if (form.idea.trim()) lines.push(`Ideia: ${form.idea.trim()}`);
    if (form.bodyPlace.trim()) lines.push(`Local do corpo: ${form.bodyPlace.trim()}`);
    if (form.size.trim()) lines.push(`Tamanho aproximado: ${form.size.trim()}`);
    if (form.references.trim()) lines.push(`Referências: ${form.references.trim()}`);
    if (form.notes.trim()) lines.push(`Observações: ${form.notes.trim()}`);
    return lines.join("\n");
  };

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (error && event.target.value.trim()) setError(false);
  };

  return (
    <>
      <PageHero
        kicker="Orçamento"
        title="Vamos criar sua próxima tattoo?"
        text="Envie sua ideia, referências, tamanho aproximado e local do corpo. A Kah analisa sua proposta e orienta o melhor caminho para transformar sua ideia em arte na pele."
        image={tattooImages.heroBudget}
      />
      <section className="ks-section ks-two-col">
        <div>
          <h2 className="ks-headline-md">O que enviar</h2>
          <p className="ks-body-lg ks-muted">
            Preencha o que puder — todos os campos são opcionais, mas quanto mais contexto, melhor a orientação inicial.
          </p>
        </div>
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
          <label className="ks-budget-label" htmlFor="budget-name">Nome</label>
          <input id="budget-name" className="ks-budget-input" value={form.name} onChange={update("name")} />

          <label className="ks-budget-label" htmlFor="budget-whatsapp">WhatsApp</label>
          <input id="budget-whatsapp" className="ks-budget-input" value={form.whatsapp} onChange={update("whatsapp")} />

          <label className="ks-budget-label" htmlFor="budget-idea">Ideia da tattoo</label>
          <textarea
            id="budget-idea"
            className="ks-budget-textarea"
            rows={4}
            placeholder="Descreva sua ideia..."
            value={form.idea}
            aria-invalid={error}
            onChange={update("idea")}
          />

          <label className="ks-budget-label" htmlFor="budget-place">Local do corpo</label>
          <input id="budget-place" className="ks-budget-input" value={form.bodyPlace} onChange={update("bodyPlace")} />

          <label className="ks-budget-label" htmlFor="budget-size">Tamanho aproximado</label>
          <input id="budget-size" className="ks-budget-input" value={form.size} onChange={update("size")} />

          <label className="ks-budget-label" htmlFor="budget-refs">Referências</label>
          <textarea id="budget-refs" className="ks-budget-textarea" rows={3} value={form.references} onChange={update("references")} />

          <label className="ks-budget-label" htmlFor="budget-notes">Observações</label>
          <textarea id="budget-notes" className="ks-budget-textarea" rows={3} value={form.notes} onChange={update("notes")} />

          {error && (
            <span className="ks-budget-error" role="alert">
              Conte sua ideia ou envie referências antes de chamar no WhatsApp.
            </span>
          )}
          <button type="submit" className="ks-primary-link">
            Chamar no WhatsApp <WhatsAppIcon />
          </button>
        </form>
      </section>
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

function ImageGrid({ items }: { items: typeof galleryItems }) {
  return (
    <div className="ks-image-grid">
      {items.map((item) => (
        <article className="ks-image-card" key={item.title}>
          <img src={item.img} alt={item.alt} loading="lazy" />
          <div className="ks-image-card-overlay">
            <span className="ks-label-caps">{item.category}</span>
            <h3>{item.title}</h3>
          </div>
        </article>
      ))}
    </div>
  );
}

function FlashCard({ name, status, text, img }: { name: string; status: string; text: string; img?: string }) {
  return (
    <article className="ks-flash-page-card">
      {img && (
        <div className="ks-flash-page-card-media">
          <img src={img} alt={`Flash ${name}`} loading="lazy" />
        </div>
      )}
      <div className="ks-flash-page-card-body">
        <StencilCrosshair size={14} color="#4a5c6e" />
        <span className={`ks-status ${status.toLowerCase()}`}>{status}</span>
        <h3>{name}</h3>
        <p>{text}</p>
        <a className="ks-primary-link" href={wa("Olá, Kah! Vim pelo site e queria saber se esse flash tattoo ainda está disponível.")}>
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


function HowToBuy() {
  return (
    <section className="ks-section ks-surface-band">
      <SectionTitle eyebrow="Como comprar" title="Consulta simples pelo WhatsApp" text="Minha vitrine funciona como catálogo comercial, sem carrinho ou checkout nesta fase." />
      <StepSection steps={["Escolha o produto ou plano", "Chame no WhatsApp", "Confirme disponibilidade", "Finalize a compra"]} />
    </section>
  );
}

function StepSection({ steps }: { steps: string[] }) {
  return (
    <div className="ks-step-grid">
      {steps.map((step, index) => (
        <article className="ks-step" key={step}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h3>{step}</h3>
          <p>Te oriento sobre valores, prazos, tamanho, disponibilidade e próximos passos.</p>
        </article>
      ))}
    </div>
  );
}

function ProductFaq({ full = false }: { full?: boolean }) {
  const questions = [
    ["Como faço um orçamento?", "Envie sua ideia pelo WhatsApp com referências, tamanho aproximado e local do corpo."],
    ["Faço desenhos personalizados?", "Sim. Crio projetos conforme a ideia e o estilo que você deseja."],
    ["Tem flash tattoo disponível?", "Sim. Os flashes disponíveis ficam na página Flash Tattoos ou podem ser consultados comigo pelo WhatsApp."],
    ["Como funcionam os produtos?", "Os produtos e artes ficam na página Produtos. A compra ou consulta é feita diretamente comigo pelo WhatsApp."],
    ["Preciso pagar sinal?", "A regra de reserva pode ser confirmada no atendimento, conforme agenda e projeto."],
    ["Quais formas de pagamento são aceitas?", "As formas de pagamento são combinadas diretamente comigo pelo WhatsApp."],
  ];
  const [open, setOpen] = useState<number | null>(null);
  const list = questions.slice(0, full ? questions.length : 4);

  return (
    <section className="ks-section">
      <SectionTitle eyebrow="FAQ" title={full ? "Dúvidas frequentes" : "FAQ rápido sobre produtos"} text="Informações essenciais para consulta, reserva e atendimento." />
      <div className="ks-faq-list">
        {list.map(([q, a], i) => (
          <motion.div
            key={q}
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
              <span>{q}</span>
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
                  <p>{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeatureStrip() {
  const features = [
    ["Processo criativo", "Penso cada projeto como uma conversa entre sua história, seu corpo e minha linguagem visual."],
    ["Atendimento cuidadoso", "Escuto com calma desde a primeira mensagem para entender o que você quer levar na pele."],
    ["Ambiente seguro", "Trabalho com materiais adequados, biossegurança e orientações claras em cada etapa."],
  ] as const;

  return (
    <section className="ks-section ks-surface-band">
      <div className="ks-card-grid three">
        {features.map(([title, text]) => (
          <article className="ks-card" key={title}>
            <HeartHandshake size={18} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function IntroPage({ path, children }: { path: keyof typeof SECTION_INTRO_TITLES; children: React.ReactNode }) {
  const location = useLocation();
  const skipIntro = Boolean((location.state as { fromProductsTransition?: boolean } | null)?.fromProductsTransition);
  const [contentReady, setContentReady] = useState(false);
  const title = SECTION_INTRO_TITLES[path];

  if (skipIntro) {
    return <>{children}</>;
  }

  const handleReveal = () => {
    setContentReady(true);
    requestAnimationFrame(() => refreshScrollMetrics());
  };

  return (
    <>
      <SectionIntro title={title} onReveal={handleReveal} />
      <motion.div
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

function CtaBand({ title, text, cta, to, href }: { title: string; text: string; cta: string; to?: string; href?: string }) {
  return (
    <section className="ks-cta-band">
      <h2 className="ks-headline-md">{title}</h2>
      <p className="ks-body-lg ks-muted">{text}</p>
      {to ? <PrimaryLink to={to}>{cta}</PrimaryLink> : <a className="ks-primary-link" href={href}>{cta}<ArrowRight size={16} /></a>}
    </section>
  );
}

function PrimaryLink({ to, children, special = false }: { to: string; children: React.ReactNode; special?: boolean }) {
  return (
    <Link className={`ks-primary-link${special ? " special" : ""}`} to={to} data-cursor="cta">
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}

function TextLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <Link className="ks-text-link" to={to}>{children}<ArrowRight size={14} /></Link>;
}

function FloatingWhatsApp() {
  const location = useLocation();
  const message = useMemo(
    () => (location.pathname === "/produtos" ? WA_PRODUCTS : WA_DEFAULT),
    [location.pathname],
  );
  return (
    <a className="ks-floating-whatsapp" href={wa(message)} aria-label="Falar comigo pelo WhatsApp" target="_blank" rel="noopener noreferrer">
      <WhatsAppIcon />
      <span>Falar com a Kah</span>
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
