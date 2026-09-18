import { useEffect, useState } from "react";

/**
 * Conteúdo da Home vindo do admin (Neon, tabela content_entries, key "home").
 *
 * Tipo e cópia padrão são próprios deste arquivo, sem importar de
 * src/admin — mesma separação que o admin já faz ao replicar a Home em
 * HomePreview.tsx em vez de importar App.tsx (que traria GSAP e Lenis pro
 * bundle do admin). Aqui é o caminho inverso: o site público não depende do
 * admin, cada lado guarda sua própria cópia da estrutura.
 *
 * Imagens nos defaults ficam vazias — a mídia vem só do CMS (exceto
 * estrelas / eye-heart / estúdio, tratados no JSX).
 */
export type HomeCard = {
  id: string;
  title: string;
  text: string;
  url: string;
  cta: string;
  imageUrl: string;
  active: boolean;
  order: number;
};

export type HomeContent = {
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
  processSteps: { id: string; label: string; active: boolean; order: number }[];

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

  youtubeActive: boolean;
  youtubeEyebrow: string;
  youtubeTitle: string;
  youtubeText: string;
  youtubeButton: string;
  youtubeUrl: string;
  youtubeMeta: string;
  youtubeThumbUrl: string;
  youtubeTrailerUrl: string;

  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  ctaButtonUrl: string;
  hiddenSections?: string[];
};

/** Cópia publicada hoje — usada no primeiro paint e como base enquanto o Neon não responde. */
export const defaultHomeContent: HomeContent = {
  heroEyebrow: "Teresópolis · RJ",
  heroTitle: "Arte na pele com identidade, cuidado e intenção.",
  heroText: "Tatuagens autorais, flash tattoos e criações exclusivas pensadas para transformar ideias em arte.",
  heroButton: "Quero fazer um orçamento",
  heroButtonUrl: "/orcamento",
  heroSecondaryButton: "Ver portfólio",
  heroSecondaryUrl: "/portfolio",
  heroImageUrl: "/assets/hero.webp",

  processEyebrow: "Processo criativo",
  processTitle: "Da conversa nasce uma composição autoral.",
  processText: "Referências, memória e proporção do corpo viram um desenho pensado para ter presença na pele, com equilíbrio, identidade e cuidado em cada detalhe.",
  processButton: "Conhecer a artista",
  processButtonUrl: "/sobre",
  processImageUrl: "/assets/karina-2.webp",
  processPortraitUrl: "/assets/karina-sarte-retrato.webp",
  processSteps: [
    { id: "1", label: "01 · Referência", active: true, order: 1 },
    { id: "2", label: "02 · Desenho", active: true, order: 2 },
    { id: "3", label: "03 · Pele", active: true, order: 3 },
  ],

  servicesEyebrow: "Serviços",
  servicesTitle: "O que você encontra por aqui",
  servicesText: "Projetos autorais, flash tattoos e produtos criados para quem busca arte com personalidade.",
  serviceCards: [
    { id: "service-1", title: "Tatuagens Autorais", text: "Projetos personalizados criados a partir da sua ideia, referência e estilo.", url: "/portfolio", cta: "Ver projetos", imageUrl: "", active: true, order: 1 },
    { id: "service-2", title: "Flash Tattoos", text: "Artes prontas e exclusivas, com disponibilidade limitada para tatuar.", url: "/flash-tattoos", cta: "Ver flashes", imageUrl: "", active: true, order: 2 },
    { id: "service-3", title: "Produtos Autorais", text: "Produtos, prints e coleções criadas dentro do universo visual da Karina Sarte.", url: "/produtos", cta: "Ver produtos", imageUrl: "", active: true, order: 3 },
    { id: "service-4", title: "Cuidados e Experiência", text: "Atendimento com cuidado, orientação e responsabilidade em todas as etapas.", url: "/orcamento", cta: "Saiba mais", imageUrl: "", active: true, order: 4 },
  ],

  portfolioEyebrow: "Portfólio",
  portfolioTitle: "Trabalhos recentes",
  portfolioText: "Um recorte do processo criativo, com o vídeo como destaque e cards editoriais para conduzir a navegação.",
  portfolioMode: "automatico",
  portfolioIds: [],

  collectionsEyebrow: "Coleções",
  collectionsTitle: "Coleções da Karina Sarte",
  collectionsText: "Arte para usar, colecionar e levar na pele. Além das tatuagens, a Karina Sarte também cria produtos, artes, flashes e coleções exclusivas para quem se identifica com seu universo visual.",
  collectionsButton: "Ver mais produtos",
  collectionCards: [
    { id: "collection-1", title: "Planos de Tattoo", text: "Opções para tattoos pequenas, projetos autorais e sessões personalizadas.", url: "/produtos", cta: "Consultar planos", imageUrl: "", active: true, order: 1 },
    { id: "collection-2", title: "Flash Tattoos", text: "Artes prontas com identidade própria e disponibilidade limitada.", url: "/produtos", cta: "Ver flashes disponíveis", imageUrl: "", active: true, order: 2 },
    { id: "collection-3", title: "Prints & Artes", text: "Ilustrações autorais para decorar, presentear ou colecionar.", url: "/produtos", cta: "Consultar artes", imageUrl: "", active: true, order: 3 },
    { id: "collection-4", title: "Adesivos", text: "Adesivos autorais para colecionar, presentear e levar a arte da Karina para outros lugares.", url: "/produtos", cta: "Consultar adesivos", imageUrl: "", active: true, order: 4 },
  ],

  youtubeActive: true,
  youtubeEyebrow: "Karina Sarte no YouTube",
  youtubeTitle: "Bastidores, rotina e arte na pele.",
  youtubeText: "Acompanhe de perto a rotina da Karina, o espaço de criação e tudo o que acontece entre a primeira ideia e a tattoo finalizada.",
  youtubeButton: "Ver vídeo completo",
  youtubeUrl: "",
  youtubeMeta: "Tattoo vlog · rotina de estúdio · processo criativo",
  youtubeThumbUrl: "",
  youtubeTrailerUrl: "",

  ctaTitle: "Vamos criar sua próxima tattoo?",
  ctaText: "Envie sua ideia, referências, tamanho aproximado e local do corpo. A Karina Sarte analisa sua proposta e orienta o melhor caminho para transformar sua ideia em arte na pele.",
  ctaButton: "Quero um orçamento",
  ctaButtonUrl: "/orcamento",
};

export async function loadHomeContent(): Promise<HomeContent> {
  return defaultHomeContent;
}

export function useHomeContent(): HomeContent & { loaded: boolean } {
  const [data, setData] = useState<HomeContent>(defaultHomeContent);

  useEffect(() => {
    let active = true;
    loadHomeContent().then((next) => {
      if (!active) return;
      setData(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return { ...data, loaded: true };
}
