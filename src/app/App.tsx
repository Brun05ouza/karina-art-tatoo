import { useEffect, useMemo, useRef, useState } from "react";
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
} from "react-router";

import { Preloader } from "./components/Preloader";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { StarGlyph } from "./components/StarGlyph";
import { StencilCrosshair } from "./components/StencilCrosshair";
import {
  observeScrollRoot,
  refreshScrollMetrics,
  registerLenis,
  resetScrollPosition,
  lockScroll,
  unlockScroll,
  unregisterLenis,
  unobserveScrollRoot,
} from "./scroll";

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FLUID_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const WHATSAPP = "https://wa.me/5521990724477";

const SECTION_INTRO_TITLES: Record<string, string> = {
  "/sobre": "Sobre mim",
  "/portfolio": "Portfolio",
  "/flash-tattoos": "Flash Tattoos",
  "/produtos": "Coleções da Kah",
  "/como-funciona": "Como funciona",
  "/cuidados": "Cuidados",
  "/depoimentos": "Depoimentos",
  "/faq": "FAQ",
};
const BUDGET_WHATSAPP_PREFIX = "Olá Karina, vim do seu site, minha ideia de tatoo seria: ";

function productWhatsAppMessage(productName: string) {
  return `Olá Karina, vim do seu site, me interessei por ${productName} e gostaria de saber mais.`;
}

function tattooChoiceMessage(tattooName: string) {
  return `Olá Karina, vim do seu site e escolhi a tattoo "${tattooName}". Gostaria de saber mais.`;
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
    img: "https://images.unsplash.com/photo-1726924244999-95eb16972c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Tatuagem botânica delicada em fine line",
  },
  {
    title: "Traço ornamental",
    category: "Autoral",
    img: "https://images.unsplash.com/photo-1712256877407-c5181b2cfa89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Projeto autoral de tatuagem ornamental",
  },
  {
    title: "Freehand orgânico",
    category: "Blackwork",
    img: "https://images.unsplash.com/photo-1589299784109-62eec2521302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Tatuagem autoral criada em freehand",
  },
  {
    title: "Símbolos pequenos",
    category: "Minimalista",
    img: "https://images.unsplash.com/photo-1499001720097-29ee4e4fc261?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Tatuagens pequenas e minimalistas",
  },
  {
    title: "Floral cicatrizado",
    category: "Cicatrizada",
    img: "https://images.unsplash.com/photo-1776843013036-71e03b131c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Tatuagem floral cicatrizada",
  },
  {
    title: "Flash autoral",
    category: "Flash Tattoo",
    img: "https://images.unsplash.com/photo-1542727365-19732a80dcfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Flash tattoo autoral em preto",
  },
];

const flashItems = [
  {
    name: "Floral lunar",
    status: "Disponível",
    text: "Composição delicada para braço, costela ou tornozelo.",
    img: "https://images.unsplash.com/photo-1726924244999-95eb16972c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Ornamento estrela",
    status: "Reservado",
    text: "Linhas finas com presença mística e tamanho médio.",
    img: "https://images.unsplash.com/photo-1499001720097-29ee4e4fc261?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Ramo livre",
    status: "Disponível",
    text: "Flash botânico único, ideal para antebraço ou nuca.",
    img: "https://images.unsplash.com/photo-1776843013036-71e03b131c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Selo autoral",
    status: "Tatuado",
    text: "Referência de flash já executado para inspiração.",
    img: "https://images.unsplash.com/photo-1542727365-19732a80dcfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Traço ornamental",
    status: "Disponível",
    text: "Linhas ornamentais autorais, perfeitas para antebraço ou panturrilha.",
    img: "https://images.unsplash.com/photo-1712256877407-c5181b2cfa89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Freehand orgânico",
    status: "Disponível",
    text: "Formas orgânicas criadas em freehand, com traço único e presença autoral.",
    img: "https://images.unsplash.com/photo-1589299784109-62eec2521302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

const productGroups = [
  {
    title: "Planos de Tattoo",
    cta: "Consultar",
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    title: "Flash Tattoos",
    cta: "Ver flashes",
    img: "https://images.unsplash.com/photo-1542727365-19732a80dcfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    title: "Prints & Artes",
    cta: "Ver artes",
    img: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    title: "Kits e Produtos",
    cta: "Consultar",
    img: "https://images.unsplash.com/photo-1776843013036-71e03b131c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
];

const tattooGalleryItems = [
  {
    name: "Fine line botânica",
    category: "Fine Line",
    status: "Disponível",
    description: "Composição botânica delicada em traço fino. Ideal para antebraço, costela ou tornozelo.",
    img: "https://images.unsplash.com/photo-1726924244999-95eb16972c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Traço ornamental",
    category: "Autoral",
    status: "Disponível",
    description: "Projeto autoral com linhas ornamentais que acompanham a anatomia do corpo.",
    img: "https://images.unsplash.com/photo-1712256877407-c5181b2cfa89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Freehand orgânico",
    category: "Blackwork",
    status: "Disponível",
    description: "Desenho criado em freehand com formas orgânicas e presença autoral.",
    img: "https://images.unsplash.com/photo-1589299784109-62eec2521302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Símbolos pequenos",
    category: "Minimalista",
    status: "Disponível",
    description: "Símbolos minimalistas para quem busca algo delicado e significativo.",
    img: "https://images.unsplash.com/photo-1499001720097-29ee4e4fc261?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Floral lunar",
    category: "Flash Tattoo",
    status: "Disponível",
    description: "Flash botânico com referência lunar, perfeito para braço ou nuca.",
    img: "https://images.unsplash.com/photo-1726924244999-95eb16972c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Ornamento estrela",
    category: "Flash Tattoo",
    status: "Reservado",
    description: "Linhas finas com presença mística e tamanho médio. Consulte disponibilidade.",
    img: "https://images.unsplash.com/photo-1499001720097-29ee4e4fc261?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Ramo livre",
    category: "Flash Tattoo",
    status: "Disponível",
    description: "Flash botânico único, ideal para antebraço, tornozelo ou costela.",
    img: "https://images.unsplash.com/photo-1776843013036-71e03b131c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Floral cicatrizado",
    category: "Referência",
    status: "Tatuado",
    description: "Referência de trabalho cicatrizado para inspirar novos projetos autorais.",
    img: "https://images.unsplash.com/photo-1776843013036-71e03b131c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Flash autoral",
    category: "Blackwork",
    status: "Disponível",
    description: "Flash autoral em preto, com traço firme e a minha identidade visual.",
    img: "https://images.unsplash.com/photo-1542727365-19732a80dcfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    name: "Selo autoral",
    category: "Autoral",
    status: "Referência",
    description: "Referência de flash já executado, útil para entender estilo e proporção.",
    img: "https://images.unsplash.com/photo-1542727365-19732a80dcfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

const seo: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Kah Sarte Tattoo | Tatuagens Autorais e Flash Tattoos",
    description:
      "Crio tatuagens autorais, flash tattoos e produtos artísticos em Teresópolis, RJ. Kah Sarte Tattoo.",
  },
  "/sobre": {
    title: "Sobre mim | Kah Sarte Tattoo",
    description: "Minha trajetória, estilo artístico e processo criativo na Kah Sarte Tattoo.",
  },
  "/portfolio": {
    title: "Portfolio de Tattoos | Kah Sarte Tattoo",
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
    title: "Cuidados com Tattoo e Biossegurança | Kah Sarte Tattoo",
    description: "Orientações de cuidados antes e depois da tattoo, cicatrização e biossegurança no meu atendimento.",
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
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      autoRaf: false,
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
      <div className="ks-grain" aria-hidden="true" />
      <Preloader
        onComplete={() => {
          setPreloaderDone(true);
          window.setTimeout(() => refreshScrollMetrics(), 100);
        }}
      />
      <div
        style={{
          background: "#131412",
          color: "#F2EDE2",
          minHeight: "100vh",
          opacity: preloaderDone ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        <Header />
        <AnimatedRoutes />
        <Footer />
        <FloatingWhatsApp />
      </div>
    </BrowserRouter>
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
    const pageSeo = seo[location.pathname] ?? seo["/"];
    document.title = pageSeo.title;
    const meta = document.querySelector("meta[name='description']") ?? document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", pageSeo.description);
    document.head.appendChild(meta);

    const timers = [
      window.setTimeout(() => refreshScrollMetrics(), 200),
      window.setTimeout(() => refreshScrollMetrics(), 800),
      window.setTimeout(() => refreshScrollMetrics(), 1600),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
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
  image,
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
      {image && <img className="ks-page-hero-image" src={image} alt="" aria-hidden="true" />}
      <div className="ks-page-hero-shade" />
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

function HomePage() {
  return (
    <>
      <PageHero
        kicker="Teresopolis - RJ"
        title="Tatuagens autorais com identidade, cuidado e arte em cada detalhe."
        text="Crio projetos personalizados, flash tattoos e artes exclusivas para transformar ideias em arte na pele."
        image="https://images.unsplash.com/photo-1589299784109-62eec2521302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800"
      >
        <div className="ks-actions">
          <PrimaryLink to="/orcamento">Quero fazer um orçamento</PrimaryLink>
          <TextLink to="/portfolio">Ver portfolio</TextLink>
        </div>
      </PageHero>
      <PreviewSection
        eyebrow="Como eu penso para cada tattoo"
        title="Arte pensada para conversar com o corpo."
        text="Crio tatuagens autorais traduzindo histórias, símbolos e ideias em traços únicos. Cada projeto respeita quem você é, o seu corpo e a proposta artística que faz sentido para você."
        image="https://images.unsplash.com/photo-1726924244999-95eb16972c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
        imageAlt="Detalhe de tatuagem fine line botânica"
      />
      <PortfolioPreview />
      <FlashPreview />
      <CareHomeSection />
      <ProductsPreview />
      <AboutMeSection />
      <CtaBand
        title="Vamos criar sua próxima tattoo?"
        text="Envie sua ideia, referências, tamanho aproximado e local do corpo para receber uma orientação personalizada."
        cta="Quero um orçamento"
        to="/orcamento"
      />
    </>
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
}: {
  eyebrow: string;
  title: string;
  text: string;
  image?: string;
  imageAlt?: string;
  to?: string;
  cta?: string;
}) {
  return (
    <section className={`ks-section ks-two-col${image ? " ks-two-col-has-image" : ""}`}>
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
  const flashWhatsAppHref = wa("Olá Karina, vim do seu site e queria ver os flash tattoos disponíveis.");

  return (
    <section className="ks-section ks-surface-band ks-flash-showcase">
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
    <section className="ks-section">
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
    <section className="ks-section ks-products-preview">
      <div className="ks-products-header">
        <span className="ks-label-caps ks-gold">Artes &amp; Produtos</span>
        <h2 className="ks-headline-lg">Arte para usar,<br />colecionar e levar na pele.</h2>
      </div>
      <div className="ks-products-grid">
        {productGroups.map((group, index) => (
          <ProductVisualCard key={group.title} group={group} index={index} to="/produtos" />
        ))}
      </div>
      <div className="ks-center-action" style={{ marginTop: "clamp(28px, 4vw, 48px)" }}>
        <PrimaryLink to="/produtos" special>Ver coleção completa</PrimaryLink>
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
        kicker="Sobre mim"
        title="Projetos autorais que unem arte, identidade e cuidado."
        text="Penso cada tattoo de forma personalizada, respeitando o seu corpo, a sua história e o estilo de quem escolhe levar aquela arte na pele."
        image="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800"
      >
        <PrimaryLink to="/orcamento">Quero criar minha tattoo</PrimaryLink>
      </PageHero>
      <section className="ks-section ks-two-col">
        <h2 className="ks-headline-lg">Processo criativo com escuta e presença.</h2>
        <div className="ks-stack">
          <p className="ks-body-lg ks-muted">Minha trajetória nasce da pesquisa de símbolos, botânica, linha fina e composições que acompanham a anatomia. Construo cada desenho para fazer sentido visual e afetivo.</p>
          <p className="ks-body-lg ks-muted">Meu atendimento é feito com cuidado desde a primeira conversa: referências, tamanho, local do corpo, disponibilidade e orientações de biossegurança entram no mesmo fluxo.</p>
        </div>
      </section>
      <FeatureStrip />
    </>
  );
}

function PortfolioPage() {
  const categories = ["Todos", "Fine Line", "Minimalista", "Blackwork", "Projetos Autorais", "Flash Tattoo", "Tattoos Cicatrizadas"];
  return (
    <>
      <PageHero
        kicker="Portfolio de tattoos"
        title="Trabalhos recentes, autorais e personalizados."
        text="Uma seleção de tatuagens fine line, minimalistas, blackwork, flash tattoo e projetos criados para histórias específicas."
        image="https://images.unsplash.com/photo-1726924244999-95eb16972c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800"
      />
      <section className="ks-section">
        <div className="ks-filter-row">
          {categories.map((category) => <button key={category}>{category}</button>)}
        </div>
        <ImageGrid items={galleryItems} />
        <CtaBand title="Gostei desse estilo, quero um orçamento" text="Me envie referências para construirmos uma proposta personalizada." cta="Começar orçamento" to="/orcamento" />
      </section>
    </>
  );
}

function FlashPage() {
  return (
    <>
      <PageHero
        kicker="Flash Tattoos"
        title="Artes autorais prontas para tatuar."
        text="Cada flash tem identidade própria e disponibilidade limitada. Me consulte antes de reservar."
      />
      <section className="ks-section">
        <div className="ks-card-grid four">
          {flashItems.concat(flashItems).map((item, index) => (
            <FlashCard key={`${item.name}-${index}`} {...item} />
          ))}
        </div>
      </section>
    </>
  );
}

function ProductsPage() {
  return (
    <>
      <PageHero
        kicker="Coleções da Kah"
        title="Arte para usar, colecionar e levar na pele."
        text="Produtos autorais, prints, kits e flashes para quem se identifica com meu universo visual."
        image="https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800"
      >
        <a className="ks-primary-link" href={wa("Olá Karina, vim do seu site e queria falar sobre tattoos, artes ou produtos disponíveis.")}>
          Falar comigo <WhatsAppIcon />
        </a>
      </PageHero>
      <section className="ks-section">
        <SectionTitle
          eyebrow="Galeria de tatuagens"
          title="Escolha a arte que combina com você"
          text="Toque em uma tattoo para ver detalhes e reservar direto pelo WhatsApp."
        />
        <TattooGallery />
      </section>
      <HowToBuy />
      <ProductFaq />
      <CtaBand
        title="Quer uma arte, produto ou tattoo exclusiva comigo?"
        text="Me chame no WhatsApp para consultar disponibilidade, valores e opções personalizadas."
        cta="Falar comigo"
        href={wa("Olá Karina, vim do seu site e queria falar sobre tattoos, artes ou produtos disponíveis.")}
      />
    </>
  );
}

function ProcessPage() {
  const steps = ["Envie sua ideia", "Receba uma orientação", "Agende sua sessão", "Faça sua tattoo"];
  return (
    <>
      <PageHero kicker="Como funciona" title="Como funciona o atendimento" text="Da primeira mensagem ao cuidado final, organizo um processo direto, acolhedor e claro com você." />
      <section className="ks-section">
        <StepSection steps={steps} />
      </section>
      <CtaBand title="Começar meu orçamento" text="Conte sua ideia, local do corpo, tamanho aproximado e referências." cta="Começar agora" to="/orcamento" />
    </>
  );
}

function CarePage() {
  return (
    <>
      <PageHero kicker="Cuidados" title="Cuidado, segurança e responsabilidade" text="Para mim, a experiência começa antes da sessão e continua nos cuidados após o procedimento." />
      <section className="ks-section">
        <div className="ks-card-grid three">
          {["Antes da tattoo", "Durante a sessão", "Depois da tattoo", "Cicatrização", "O que evitar", "Biossegurança"].map((title) => (
            <MiniCard key={title} title={title} text="Dou orientações claras, uso materiais adequados e acompanho você para uma boa cicatrização." />
          ))}
        </div>
      </section>
    </>
  );
}

function TestimonialsPage() {
  return (
    <>
      <PageHero kicker="Depoimentos" title="Quem já tatuou comigo" text="Relatos sobre resultado, cuidado e experiência de atendimento comigo." />
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
      <PageHero kicker="FAQ" title="Perguntas frequentes" text="Respostas rápidas sobre orçamento, desenhos personalizados, flash tattoos, produtos e cuidados pós-tattoo." />
      <ProductFaq full />
    </>
  );
}

function BudgetPage() {
  const [idea, setIdea] = useState("");
  const [error, setError] = useState(false);
  const trimmedIdea = idea.trim();
  const whatsappMessage = `${BUDGET_WHATSAPP_PREFIX}${trimmedIdea}`;

  return (
    <>
      <PageHero
        kicker="Orçamento"
        title="Vamos criar sua próxima tattoo?"
        text="Descreva sua ideia abaixo e envie direto pelo WhatsApp. Analiso sua proposta e oriento o melhor caminho."
        image="https://images.unsplash.com/photo-1726924244999-95eb16972c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800"
      />
      <section className="ks-section ks-two-col">
        <div>
          <h2 className="ks-headline-md">O que enviar</h2>
          <p className="ks-body-lg ks-muted">Conte sua ideia, referências visuais, local do corpo, tamanho aproximado e qualquer detalhe importante para personalizar o orçamento.</p>
        </div>
        <form
          className="ks-budget-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!trimmedIdea) {
              setError(true);
              return;
            }
            window.open(wa(whatsappMessage), "_blank", "noopener,noreferrer");
          }}
        >
          <label className="ks-budget-label" htmlFor="tattoo-idea">
            Sua ideia de tattoo
          </label>
          <textarea
            id="tattoo-idea"
            className="ks-budget-textarea"
            rows={6}
            placeholder="Ex.: flor minimalista no pulso, traço fino, referência botânica..."
            value={idea}
            aria-invalid={error}
            onChange={(event) => {
              setIdea(event.target.value);
              if (error && event.target.value.trim()) setError(false);
            }}
          />
          {error && (
            <span className="ks-budget-error" role="alert">
              Conte um pouco sobre sua ideia antes de enviar.
            </span>
          )}
          <p className="ks-budget-preview">
            <span className="ks-budget-preview-label">Prévia da mensagem</span>
            {BUDGET_WHATSAPP_PREFIX}
            <span className="ks-budget-preview-idea">{trimmedIdea || "sua ideia aqui"}</span>
          </p>
          <button type="submit" className="ks-primary-link">
            Enviar no WhatsApp <WhatsAppIcon />
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
          <div>
            <span className="ks-label-caps ks-muted">{item.category}</span>
            <h3>{item.title}</h3>
          </div>
        </article>
      ))}
    </div>
  );
}

function FlashCard({ name, status, text }: { name: string; status: string; text: string }) {
  return (
    <article className="ks-card">
      <StencilCrosshair size={14} color="#263C86" />
      <span className={`ks-status ${status.toLowerCase()}`}>{status}</span>
      <h3>{name}</h3>
      <p>{text}</p>
      <a href={wa(`Olá Karina, vim do seu site e queria saber se o flash "${name}" ainda está disponível.`)}>Quero esse flash</a>
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
  const [contentReady, setContentReady] = useState(false);
  const title = SECTION_INTRO_TITLES[path];

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
    () => location.pathname === "/produtos"
      ? "Olá Karina, vim do seu site e queria saber mais sobre os produtos disponíveis."
      : "Olá Karina, vim do seu site e queria fazer um orçamento.",
    [location.pathname],
  );
  return (
    <a className="ks-floating-whatsapp" href={wa(message)} aria-label="Falar comigo pelo WhatsApp" target="_blank" rel="noopener noreferrer">
      <WhatsAppIcon />
      <span>Falar comigo</span>
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
