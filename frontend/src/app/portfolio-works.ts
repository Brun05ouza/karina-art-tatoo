/**
 * Dados do portfólio — fonte única compartilhada.
 *
 * Vive fora do App.tsx porque a prévia ao vivo da área administrativa também
 * consome estes dados, e importar o App.tsx de lá arrastaria GSAP, Lenis e as
 * páginas públicas inteiras para o bundle do admin.
 *
 * TODO(neon): virá de GET /api/content/portfolio.
 */

/**
 * Categorias do portfólio, na mesma ordem e com os mesmos rótulos usados na área
 * administrativa. Manter idênticos elimina a tradução que existia aqui antes
 * (o item dizia "Autoral" e o filtro "Projetos Autorais") e é o que permitirá
 * ligar a página ao banco sem mapeamento no meio.
 */
export const PORTFOLIO_CATEGORIES = [
  "Fine Line",
  "Minimalista",
  "Blackwork",
  "Projetos Autorais",
  "Flash Tattoo",
  "Cicatrizadas",
] as const;

/**
 * Fonte única do portfólio: alimenta a página /portfolio e o bloco "Trabalhos
 * recentes" da home. Antes eram dois arrays separados, e o da página apontava
 * seis vezes para a mesma foto.
 *
 * - `category` é canônica (PORTFOLIO_CATEGORIES) e serve ao filtro.
 * - `label` é o rótulo mostrado no card, mais descritivo que a categoria.
 * - `featured` marca o que aparece na home, espelhando "destaque na Home" do
 *   painel administrativo.
 *
 * As fotos e os textos são os que já existiam em /assets/recent-projects.
 */
export const galleryItems = [
  {
    title: "Orquídeas",
    category: "Projetos Autorais",
    label: "Vídeo de processo",
    img: "/assets/recent-projects/orquideas-poster.jpg",
    alt: "Processo de criação de tatuagem de orquídeas",
    featured: true,
    processVideo: {
      poster: "/assets/recent-projects/orquideas-poster.jpg",
      src: "/assets/recent-projects/orquideas-processo.mp4",
    },
  },
  {
    title: "Columbina",
    category: "Projetos Autorais",
    label: "Projeto autoral",
    img: "/assets/recent-projects/columbina.jpg",
    alt: "Tatuagem autoral Columbina com composição floral e olhar",
    featured: true,
  },
  {
    title: "Mandala autoral",
    category: "Projetos Autorais",
    label: "Ornamental",
    img: "/assets/recent-projects/mandala.jpg",
    alt: "Tatuagem de mandala ornamental autoral",
    featured: true,
  },
  {
    title: "Orquídea",
    category: "Fine Line",
    label: "Fine line",
    img: "/assets/recent-projects/orquidea-pescoco.jpg",
    alt: "Tatuagem de orquídea em traço fino no pescoço",
    featured: true,
  },
  {
    title: "Kira",
    category: "Projetos Autorais",
    label: "Pet tattoo",
    img: "/assets/recent-projects/kira.jpg",
    alt: "Tatuagem autoral de cachorro chamada Kira",
    featured: true,
  },
  {
    title: "Lua botânica",
    category: "Projetos Autorais",
    label: "Projeto autoral",
    img: "/assets/recent-projects/lua-botanica.jpg",
    alt: "Tatuagem autoral de lua, folhas e andorinha",
    featured: true,
  },
];
export type PortfolioWork = (typeof galleryItems)[number];
