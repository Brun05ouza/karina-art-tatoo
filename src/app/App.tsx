import { useEffect, useMemo, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
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

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const WHATSAPP = "https://wa.me/5521990724477";

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
];

const productGroups = [
  {
    title: "Planos de Tattoo",
    cta: "Consultar",
    message: "Olá, Kah! Vim pelo site e queria saber mais sobre os planos de tattoo.",
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    title: "Flash Tattoos",
    cta: "Ver flashes",
    message: "Olá, Kah! Vim pelo site e queria ver os flash tattoos disponíveis.",
    img: "https://images.unsplash.com/photo-1542727365-19732a80dcfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    title: "Prints & Artes",
    cta: "Ver artes",
    message: "Olá, Kah! Vim pelo site e queria saber mais sobre os prints e artes autorais.",
    img: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    title: "Kits e Produtos",
    cta: "Consultar",
    message: "Olá, Kah! Vim pelo site e queria saber quais kits ou produtos estão disponíveis.",
    img: "https://images.unsplash.com/photo-1776843013036-71e03b131c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
];

const seo: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Kah Sarte Tattoo | Tatuagens Autorais e Flash Tattoos",
    description:
      "Conheça o trabalho da Kah Sarte Tattoo, com tatuagens autorais, flash tattoos, projetos personalizados e produtos artísticos.",
  },
  "/sobre": {
    title: "Sobre a Kah | Kah Sarte Tattoo",
    description: "Conheça a trajetória, estilo artístico e processo criativo da Kah Sarte Tattoo.",
  },
  "/portfolio": {
    title: "Portfolio de Tattoos | Kah Sarte Tattoo",
    description:
      "Veja trabalhos recentes, tatuagens autorais, fine line, minimalistas, blackwork e projetos personalizados da Kah Sarte Tattoo.",
  },
  "/flash-tattoos": {
    title: "Flash Tattoos Disponíveis | Kah Sarte Tattoo",
    description: "Confira flash tattoos autorais disponíveis para tatuar com a Kah Sarte Tattoo.",
  },
  "/produtos": {
    title: "Produtos Autorais, Prints e Planos de Tattoo | Kah Sarte Tattoo",
    description:
      "Conheça os produtos autorais, prints, artes, kits, flash tattoos e planos de tattoo disponíveis na Kah Sarte Tattoo.",
  },
  "/como-funciona": {
    title: "Como Funciona o Atendimento | Kah Sarte Tattoo",
    description: "Entenda o processo de orçamento, criação, agenda e sessão com a Kah Sarte Tattoo.",
  },
  "/cuidados": {
    title: "Cuidados com Tattoo e Biossegurança | Kah Sarte Tattoo",
    description: "Veja orientações de cuidados antes e depois da tattoo, cicatrização e biossegurança.",
  },
  "/depoimentos": {
    title: "Depoimentos | Kah Sarte Tattoo",
    description: "Veja relatos de quem já tatuou com a Kah Sarte Tattoo.",
  },
  "/faq": {
    title: "FAQ | Kah Sarte Tattoo",
    description: "Perguntas frequentes sobre orçamento, flash tattoos, produtos e cuidados com tattoo.",
  },
  "/orcamento": {
    title: "Orçamento de Tattoo | Kah Sarte Tattoo",
    description: "Solicite seu orçamento de tattoo, envie sua ideia e fale diretamente com a Kah pelo WhatsApp.",
  },
};

function AppShell() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      autoRaf: false,
    });

    lenis.on("scroll", () => ScrollTrigger.update());
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);
    setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="ks-grain" aria-hidden="true" />
      <Preloader onComplete={() => setPreloaderDone(true)} />
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    const pageSeo = seo[location.pathname] ?? seo["/"];
    document.title = pageSeo.title;
    const meta = document.querySelector("meta[name='description']") ?? document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", pageSeo.description);
    document.head.appendChild(meta);
  }, [location.pathname]);

  return (
    <main>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/sobre" element={<Navigate to="/" replace />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/flash-tattoos" element={<Navigate to="/" replace />} />
            <Route path="/produtos" element={<ProductsPage />} />
            <Route path="/como-funciona" element={<ProcessPage />} />
            <Route path="/cuidados" element={<Navigate to="/" replace />} />
            <Route path="/depoimentos" element={<TestimonialsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/orcamento" element={<BudgetPage />} />
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
        text="Projetos personalizados, flash tattoos e criações exclusivas feitas para transformar ideias em arte na pele."
        image="https://unsplash.com/photos/1GkrGVoFuWA/download?force=true&w=1800"
      >
        <div className="ks-actions">
          <PrimaryLink to="/orcamento">Quero fazer um orçamento</PrimaryLink>
          <TextLink to="/portfolio">Ver portfolio</TextLink>
        </div>
      </PageHero>
      <PreviewSection
        eyebrow="Sobre a Kah"
        title="Arte pensada para conversar com o corpo."
        text="A Kah Sarte Tattoo cria tatuagens autorais pensadas para traduzir histórias, símbolos e ideias em traços únicos. Cada projeto respeita a identidade, o corpo e a proposta artistica de cada pessoa."
      />
      <PortfolioPreview />
      <FlashPreview />
      <CareHomeSection />
      <ProductsPreview />
      <CtaBand
        title="Vamos criar sua próxima tattoo?"
        text="Envie sua ideia, referências, tamanho aproximado e local do corpo para receber uma orientação personalizada."
        cta="Quero um orçamento"
        to="/orcamento"
      />
    </>
  );
}

function PreviewSection({
  eyebrow,
  title,
  text,
  to,
  cta,
}: {
  eyebrow: string;
  title: string;
  text: string;
  to?: string;
  cta?: string;
}) {
  return (
    <section className="ks-section ks-two-col">
      <div>
        <span className="ks-label-caps ks-gold">{eyebrow}</span>
        <h2 className="ks-headline-lg">{title}</h2>
      </div>
      <div>
        <p className="ks-body-lg ks-muted">{text}</p>
        {to && cta && <TextLink to={to}>{cta}</TextLink>}
      </div>
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
  const active = flashItems[activeIndex];

  return (
    <section className="ks-section ks-surface-band ks-flash-showcase">
      <SectionTitle eyebrow="Flash Tattoos disponíveis" title="Artes autorais prontas para tatuar" text="Disponibilidade limitada, consulta direta pelo WhatsApp." />
      <div className="ks-flash-scroll-layout">
        <div className="ks-flash-feature">
          <AnimatePresence mode="sync">
            <motion.img
              key={active.img}
              src={active.img}
              alt={`${active.name} flash tattoo`}
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
            />
          </AnimatePresence>
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <span className="ks-status">{active.status}</span>
                <h3>{active.name}</h3>
                <p>{active.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="ks-flash-strip">
          {flashItems.map((item, index) => (
            <FlashMiniCard
              key={item.name}
              item={item}
              index={index}
              active={index === activeIndex}
              onHover={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
      <div className="ks-center-action">
        <a className="ks-primary-link" href={wa("Olá, Kah! Vim pelo site e queria ver os flash tattoos disponíveis.")}>
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
  onHover,
}: {
  item: (typeof flashItems)[0];
  index: number;
  active: boolean;
  onHover: () => void;
}) {
  return (
    <motion.article
      className={`ks-flash-mini-card${active ? " active" : ""}`}
      initial={{ opacity: 0, x: 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: EASE }}
      onHoverStart={onHover}
      onFocus={onHover}
      onClick={onHover}
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
        text="Cada atendimento é realizado com atencao à biossegurança, materiais adequados e orientações antes, durante e depois da tattoo."
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
          <ProductVisualCard key={group.title} group={group} index={index} />
        ))}
      </div>
      <div className="ks-center-action" style={{ marginTop: "clamp(28px, 4vw, 48px)" }}>
        <PrimaryLink to="/produtos" special>Ver coleção completa</PrimaryLink>
      </div>
    </section>
  );
}

function ProductVisualCard({
  group,
  index,
}: {
  group: (typeof productGroups)[0];
  index: number;
}) {
  return (
    <motion.a
      href={wa(group.message)}
      className="ks-product-visual-card"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE }}
    >
      <img src={group.img} alt={group.title} loading="lazy" />
      <div className="ks-product-visual-overlay">
        <span className="ks-label-caps">{String(index + 1).padStart(2, "0")}</span>
        <h3>{group.title}</h3>
        <span className="ks-product-visual-cta">
          {group.cta} <ArrowRight size={12} />
        </span>
      </div>
    </motion.a>
  );
}

function AboutPage() {
  return (
    <>
      <PageHero
        kicker="Sobre a Kah"
        title="Projetos autorais que unem arte, identidade e cuidado."
        text="Cada tattoo é pensada de forma personalizada, respeitando o corpo, a história e o estilo de quem escolhe levar aquela arte na pele."
        image="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800"
      >
        <PrimaryLink to="/orcamento">Quero criar minha tattoo</PrimaryLink>
      </PageHero>
      <section className="ks-section ks-two-col">
        <h2 className="ks-headline-lg">Processo criativo com escuta e presenca.</h2>
        <div className="ks-stack">
          <p className="ks-body-lg ks-muted">A trajetória da Kah nasce da pesquisa de símbolos, botânica, linha fina e composições que acompanham a anatomia. O desenho é construído para fazer sentido visual e afetivo.</p>
          <p className="ks-body-lg ks-muted">O atendimento é feito com cuidado desde a primeira conversa: referências, tamanho, local do corpo, disponibilidade e orientacoes de biossegurança entram no mesmo fluxo.</p>
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
      />
      <section className="ks-section">
        <div className="ks-filter-row">
          {categories.map((category) => <button key={category}>{category}</button>)}
        </div>
        <ImageGrid items={galleryItems} />
        <CtaBand title="Gostei desse estilo, quero um orçamento" text="Fale com a Kah e envie referências para construir uma proposta personalizada." cta="Começar orçamento" to="/orcamento" />
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
        text="Cada flash possui identidade própria e disponibilidade limitada. Consulte antes de reservar."
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
      <ProductIntro />
      <PageHero
        kicker="Coleções da Kah"
        title="Arte para usar, colecionar e levar na pele."
        text="Produtos autorais, prints, kits, flash tattoos e planos para quem se identifica com o universo visual da Kah."
        image="https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800"
      >
        <a className="ks-primary-link" href={wa("Olá, Kah! Vim pelo site e queria falar sobre tattoos, artes ou produtos disponíveis.")}>
          Falar com a Kah <WhatsAppIcon />
        </a>
      </PageHero>
      <section className="ks-section">
        <div className="ks-products-grid">
          {productGroups.map((group, index) => (
            <ProductVisualCard key={group.title} group={group} index={index} />
          ))}
        </div>
      </section>
      <HowToBuy />
      <ProductFaq />
      <CtaBand
        title="Quer uma arte, um produto ou uma tattoo exclusiva da Kah?"
        text="Chame no WhatsApp para consultar disponibilidade, valores e opções personalizadas."
        cta="Falar com a Kah"
        href={wa("Olá, Kah! Vim pelo site e queria falar sobre tattoos, artes ou produtos disponíveis.")}
      />
    </>
  );
}

function ProcessPage() {
  const steps = ["Envie sua ideia", "Receba uma orientação", "Agende sua sessão", "Faça sua tattoo"];
  return (
    <>
      <PageHero kicker="Como funciona" title="Como funciona o atendimento" text="Da primeira mensagem ao cuidado final, o processo é direto, acolhedor e organizado." />
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
      <PageHero kicker="Cuidados" title="Cuidado, segurança e responsabilidade" text="A experiência da tattoo comeca antes da sessão e continua nos cuidados após o procedimento." />
      <section className="ks-section">
        <div className="ks-card-grid three">
          {["Antes da tattoo", "Durante a sessão", "Depois da tattoo", "Cicatrização", "O que evitar", "Biossegurança"].map((title) => (
            <MiniCard key={title} title={title} text="Orientações claras, materiais adequados, higienizacao e acompanhamento para uma boa cicatrização." />
          ))}
        </div>
      </section>
    </>
  );
}

function TestimonialsPage() {
  return (
    <>
      <PageHero kicker="Depoimentos" title="Quem já tatuou com a Kah" text="Relatos de clientes sobre resultado, cuidado e experiência de atendimento." />
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
  return (
    <>
      <PageHero kicker="Orçamento" title="Vamos criar sua próxima tattoo?" text="Envie sua ideia, referências, tamanho aproximado e local do corpo. A Kah irá analisar sua proposta e orientar o melhor caminho." />
      <section className="ks-section ks-two-col">
        <div>
          <h2 className="ks-headline-md">O que enviar</h2>
          <p className="ks-body-lg ks-muted">Nome, WhatsApp, ideia da tattoo, local do corpo, tamanho aproximado, referências e observações importantes.</p>
        </div>
        <a className="ks-primary-link" href={wa("Olá, Kah! Vim pelo site e queria fazer um orçamento de tattoo.")}>
          Chamar no WhatsApp <WhatsAppIcon />
        </a>
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
      <a href={wa("Olá, Kah! Vim pelo site e queria saber se esse flash tattoo ainda esta disponível.")}>Quero esse flash</a>
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
      <SectionTitle eyebrow="Como comprar" title="Consulta simples pelo WhatsApp" text="A vitrine funciona como catalogo comercial, sem carrinho ou checkout nesta fase." />
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
          <p>Receba orientação clara sobre valores, prazos, tamanho, disponibilidade e próximos passos.</p>
        </article>
      ))}
    </div>
  );
}

function ProductFaq({ full = false }: { full?: boolean }) {
  const questions = [
    ["Como faço um orçamento?", "Envie sua ideia pelo WhatsApp com referências, tamanho aproximado e local do corpo."],
    ["A Kah faz desenhos personalizados?", "Sim. Os projetos podem ser criados conforme a ideia e o estilo desejado."],
    ["Tem flash tattoo disponível?", "Sim. Os flashes disponíveis ficam na página de Flash Tattoos ou podem ser consultados pelo WhatsApp."],
    ["Como funcionam os produtos?", "Os produtos e artes ficam na página Produtos. A compra ou consulta é feita diretamente pelo WhatsApp."],
    ["Preciso pagar sinal?", "A regra de reserva pode ser confirmada no atendimento, conforme agenda e projeto."],
    ["Quais formas de pagamento são aceitas?", "As formas de pagamento são combinadas diretamente com a Kah pelo WhatsApp."],
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
  return (
    <section className="ks-section ks-surface-band">
      <div className="ks-card-grid three">
        {["Processo criativo", "Atendimento cuidadoso", "Ambiente seguro"].map((title) => (
          <article className="ks-card" key={title}>
            <HeartHandshake size={18} />
            <h3>{title}</h3>
            <p>Uma experiência pensada para unir expressão artística, escuta e responsabilidade.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductIntro() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="ks-product-intro" exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
          <motion.div className="ks-drawn-line" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: EASE }} />
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35, ease: EASE }}>Coleções da Kah</motion.h2>
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
      ? "Olá, Kah! Vim pelo site e queria saber mais sobre os produtos disponíveis."
      : "Olá, Kah! Vim pelo site e queria fazer um orçamento.",
    [location.pathname],
  );
  return (
    <a className="ks-floating-whatsapp" href={wa(message)} aria-label="Falar com a Kah pelo WhatsApp" target="_blank" rel="noopener noreferrer">
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
