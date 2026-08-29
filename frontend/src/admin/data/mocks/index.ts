import type {
  AboutDocument,
  BackstageDocument,
  BudgetPageDocument,
  FaqItem,
  FlashPageDocument,
  FlashTattoo,
  HomeDocument,
  LinkBioDocument,
  MediaItem,
  PortfolioItem,
  PortfolioPageDocument,
  ProductItem,
  ProductsPageDocument,
  ReformulationItem,
  ReformulationsDocument,
  SettingsDocument,
  SiteModeDocument,
} from "../types";

export const mockPortfolioItems: PortfolioItem[] = [
  { id: "portfolio-1", order: 1, active: true, title: "Orquídeas", description: "Composição botânica autoral.", category: "Fine Line", status: "Publicado", bodyLocation: "Pescoço", style: "Fine line", featured: true, imageUrl: "", imageKey: "" },
  { id: "portfolio-2", order: 2, active: true, title: "Lua botânica", description: "Traço delicado e elementos naturais.", category: "Minimalista", status: "Publicado", bodyLocation: "Braço", style: "Minimalista", featured: true, imageUrl: "", imageKey: "" },
  { id: "portfolio-3", order: 3, active: true, title: "Kira", description: "Retrato pet em preto e cinza.", category: "Projetos Autorais", status: "Publicado", bodyLocation: "Antebraço", style: "Blackwork", featured: false, imageUrl: "", imageKey: "" },
  { id: "portfolio-4", order: 4, active: true, title: "Columbina", description: "Personagem em composição autoral.", category: "Blackwork", status: "Publicado", bodyLocation: "Coxa", style: "Blackwork", featured: false, imageUrl: "", imageKey: "" },
  { id: "portfolio-5", order: 5, active: true, title: "Mandala", description: "Geometria ornamental delicada.", category: "Fine Line", status: "Rascunho", bodyLocation: "Costas", style: "Ornamental", featured: false, imageUrl: "", imageKey: "" },
];

export const mockFlashTattoos: FlashTattoo[] = [
  { id: "flash-1", order: 1, active: true, title: "Olho floral", description: "Flash autoral disponível uma única vez.", category: "Botânico", status: "Disponível", price: "R$ 450", size: "12 cm", imageUrl: "", imageKey: "" },
  { id: "flash-2", order: 2, active: true, title: "Olho coração", description: "Desenho autoral em preto e vermelho.", category: "Símbolos", status: "Reservado", price: "R$ 380", size: "10 cm", imageUrl: "", imageKey: "" },
  { id: "flash-3", order: 3, active: true, title: "Estrela violeta", description: "Peça gráfica com identidade Sarte.", category: "Gráfico", status: "Disponível", price: "R$ 320", size: "8 cm", imageUrl: "", imageKey: "" },
];

export const mockProducts: ProductItem[] = [
  { id: "product-1", order: 1, active: true, title: "Adesivos autorais", description: "Seleção de adesivos da Karina Sarte.", category: "Adesivos", status: "Publicado", price: "R$ 25", whatsappMessage: "Olá! Quero saber sobre os adesivos autorais.", link: "", imageUrl: "", imageKey: "" },
  { id: "product-2", order: 2, active: true, title: "Print botânico", description: "Impressão artística em papel de alta gramatura.", category: "Prints & Artes", status: "Publicado", price: "R$ 65", whatsappMessage: "Olá! Quero saber sobre o print botânico.", link: "", imageUrl: "", imageKey: "" },
  { id: "product-3", order: 3, active: true, title: "Plano tattoo pequena", description: "Opção para projetos delicados e objetivos.", category: "Planos de Tattoo", status: "Rascunho", price: "Sob consulta", whatsappMessage: "Olá! Quero conhecer o plano de tattoo pequena.", link: "", imageUrl: "", imageKey: "" },
];

export const mockReformulacoes: ReformulationItem[] = [
  { id: "reform-1", order: 1, active: true, title: "Cobertura botânica", description: "Releitura com folhagens e novas linhas.", category: "Cobertura", status: "Publicado", beforeImageUrl: "", afterImageUrl: "", problem: "Traços antigos sem definição.", solution: "Composição botânica criada para integrar a tattoo existente.", internalNote: "Solicitar foto cicatrizada.", imageUrl: "", imageKey: "" },
  { id: "reform-2", order: 2, active: true, title: "Renovação ornamental", description: "Redesenho e recuperação de contraste.", category: "Revitalização", status: "Publicado", beforeImageUrl: "", afterImageUrl: "", problem: "Pigmento desgastado.", solution: "Reforço de contraste e inclusão de elementos ornamentais.", internalNote: "", imageUrl: "", imageKey: "" },
];

export const mockFaqs: FaqItem[] = [
  { id: "faq-1", order: 1, active: true, title: "Como funciona o orçamento?", answer: "Envie suas referências, local do corpo e tamanho aproximado pelo formulário ou WhatsApp.", category: "Orçamento", status: "Publicado" },
  { id: "faq-2", order: 2, active: true, title: "Posso levar meu próprio desenho?", answer: "Referências são bem-vindas, mas cada projeto recebe uma composição autoral.", category: "Projeto", status: "Publicado" },
  { id: "faq-3", order: 3, active: true, title: "Como cuidar da tattoo?", answer: "As orientações completas são entregues ao final da sessão e variam conforme o projeto.", category: "Cuidados", status: "Publicado" },
  { id: "faq-4", order: 4, active: true, title: "Quais formas de pagamento?", answer: "O sinal reserva a data e o restante é combinado antes da sessão.", category: "Pagamento", status: "Rascunho" },
];

/** Copy inicial igual à que está publicada hoje em /flash-tattoos. */
export const mockFlashPage: FlashPageDocument = {
  heroKicker: "Flash Tattoos",
  heroTitle: "Flash Tattoos disponíveis",
  heroText: "Artes autorais prontas para tatuar, com disponibilidade limitada.",
  heroImageUrl: "",
};

/** Copy inicial igual à que está publicada hoje em /portfolio. */
export const mockPortfolioPage: PortfolioPageDocument = {
  heroKicker: "Portfólio",
  heroTitle: "Portfólio",
  heroText: "Conheça tattoos, flashes e projetos autorais criados pela Karina Sarte.",
  heroImageUrl: "",
};

export const mockProductsPage: ProductsPageDocument = {
  heroKicker: "Coleções",
  heroTitle: "Coleções da Karina Sarte",
  heroText1: "Arte para usar, colecionar e levar na pele.",
  heroText2: "Produtos autorais, planos, flashes, prints e criações exclusivas feitas para aproximar ainda mais a arte da Karina Sarte de quem acompanha seu trabalho.",
  heroButton: "Consultar produtos pelo WhatsApp",
  heroImageUrl: "",
  ctaTitle: "Quer levar a arte da Karina Sarte para além da pele?",
  ctaText: "Consulte disponibilidade, valores e opções personalizadas pelo WhatsApp.",
  ctaButton: "Consultar pelo WhatsApp",
};

export const mockBudgetPage: BudgetPageDocument = {
  heroKicker: "Orçamento",
  heroTitle: "Me conta a sua ideia?",
  heroText: "Me manda suas referências, o local do corpo, o tamanho aproximado e tudo que você já imaginou. Com esse contexto eu consigo entender o desenho com cuidado e te orientar pelo WhatsApp.",
  heroImageUrl: "",

  introEyebrow: "Briefing inicial",
  introTitle: "Quanto mais você me conta, melhor eu consigo te orientar.",
  introText: "Não precisa chegar com tudo fechado. Pode me mandar uma ideia solta, referências, dúvidas e o que você sente que combina com você — eu organizo o caminho a partir disso.",

  stepOneTitle: "Me conta a ideia",
  stepOneText: "Escreve do seu jeito: tema, referências, estilo, tamanho e onde você imagina tatuar.",
  stepTwoTitle: "Eu analiso com calma",
  stepTwoText: "Olho proporção, detalhes, encaixe no corpo e o melhor caminho para o desenho funcionar na pele.",
  stepThreeTitle: "Te respondo no WhatsApp",
  stepThreeText: "Depois te retorno com orientação inicial, próximos passos e tudo que eu precisar alinhar com você.",

  formEyebrow: "Me chama no WhatsApp",
  formTitle: "Conta pra mim",
  submitHelper: "Ao enviar, eu recebo sua mensagem já organizada no WhatsApp.",
  submitButton: "Enviar para a Karina",
  whatsappIntro: "Oi, Karina! Vim pelo site e queria te contar uma ideia de tattoo ✨",
};

export const mockMediaItems: MediaItem[] = [
  { id: "media-1", order: 1, active: true, title: "Hero da Home", description: "Imagem principal do site.", category: "Home", type: "Imagem", publicUrl: "", usage: "Home / Hero", imageUrl: "" },
  { id: "media-2", order: 2, active: true, title: "Retrato Karina", description: "Retrato usado na apresentação.", category: "Sobre", type: "Imagem", publicUrl: "", usage: "Home e Sobre", imageUrl: "" },
  { id: "media-3", order: 3, active: true, title: "Arte olho floral", description: "Arte das coleções.", category: "Produtos", type: "Imagem", publicUrl: "", usage: "Produtos / Hero", imageUrl: "" },
  { id: "media-4", order: 4, active: true, title: "Processo criativo", description: "Poster do vídeo.", category: "Bastidores", type: "Imagem", publicUrl: "", usage: "Home / Processo", imageUrl: "" },
];

/** Copy inicial igual à que está publicada hoje na home. */
export const mockHome: HomeDocument = {
  heroEyebrow: "Teresópolis · RJ",
  heroTitle: "Arte na pele com identidade, cuidado e intenção.",
  heroText: "Tatuagens autorais, flash tattoos e criações exclusivas pensadas para transformar ideias em arte.",
  heroButton: "Quero fazer um orçamento",
  heroButtonUrl: "/orcamento",
  heroSecondaryButton: "Ver portfólio",
  heroSecondaryUrl: "/portfolio",
  heroImageUrl: "",

  processEyebrow: "Processo criativo",
  processTitle: "Da conversa nasce uma composição autoral.",
  processText:
    "Referências, memória e proporção do corpo viram um desenho pensado para ter presença na pele, com equilíbrio, identidade e cuidado em cada detalhe.",
  processButton: "Conhecer a artista",
  processButtonUrl: "/sobre",
  // Mesmo arquivo que o site usa na coluna do Processo criativo
  // (tattooImages.artistDetail).
  processImageUrl: "",
  processPortraitUrl: "",
  processSteps: [
    { id: "step-1", label: "01 · Referência", active: true, order: 1 },
    { id: "step-2", label: "02 · Desenho", active: true, order: 2 },
    { id: "step-3", label: "03 · Pele", active: true, order: 3 },
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
  portfolioIds: ["portfolio-1", "portfolio-2", "portfolio-3"],

  collectionsEyebrow: "Coleções",
  collectionsTitle: "Coleções da Karina Sarte",
  collectionsText:
    "Arte para usar, colecionar e levar na pele. Além das tatuagens, a Karina Sarte também cria produtos, artes, flashes e coleções exclusivas para quem se identifica com seu universo visual.",
  collectionsButton: "Ver mais produtos",
  collectionCards: [
    { id: "collection-1", title: "Planos de Tattoo", text: "Opções para tattoos pequenas, projetos autorais e sessões personalizadas.", url: "/produtos", cta: "Consultar planos", imageUrl: "", active: true, order: 1 },
    { id: "collection-2", title: "Flash Tattoos", text: "Artes prontas e disponíveis para tatuar, com disponibilidade limitada.", url: "/flash-tattoos", cta: "Ver flashes disponíveis", imageUrl: "", active: true, order: 2 },
    { id: "collection-3", title: "Prints & Artes", text: "Impressões e artes autorais para colecionar.", url: "/produtos", cta: "Ver prints", imageUrl: "", active: true, order: 3 },
    { id: "collection-4", title: "Adesivos", text: "Adesivos autorais do universo visual da Karina.", url: "/produtos", cta: "Ver adesivos", imageUrl: "", active: true, order: 4 },
  ],

  youtubeEyebrow: "Karina Sarte no YouTube",
  youtubeTitle: "Bastidores, rotina e arte na pele.",
  youtubeText:
    "Acompanhe de perto a rotina da Karina, o espaço de criação e tudo o que acontece entre a primeira ideia e a tattoo finalizada.",
  youtubeButton: "Ver vídeo completo",
  youtubeUrl: "https://youtu.be/zntCZqs4rEE",
  youtubeMeta: "Tattoo vlog · rotina de estúdio · processo criativo",
  youtubeThumbUrl: "",
  youtubeTrailerUrl: "",
  youtubeActive: true,

  ctaTitle: "Vamos criar sua próxima tattoo?",
  ctaText: "Conte sua ideia e receba uma orientação para o projeto.",
  ctaButton: "Enviar minha ideia",
  ctaButtonUrl: "/orcamento",
};

export const mockAbout: AboutDocument = {
  eyebrow: "A artista",
  title: "Sobre a Karina Sarte",
  intro: "Karina Sarte cria projetos que unem arte, identidade e cuidado. Cada tattoo é pensada de forma personalizada, respeitando a história, o corpo e o estilo de quem escolhe levar aquela arte na pele.",
  heroImageUrl: "",
  biography: "Minha estética é autoral, com traço fino e referências botânicas. Construo projetos que equilibram delicadeza e presença. Todo atendimento começa com escuta: quero entender suas referências, as proporções e o significado por trás da ideia.\n\nEm Teresópolis, criei um espaço de criação e cuidado. Da primeira mensagem à cicatrização, acompanho cada etapa com orientação clara e muita atenção.",
  approachCards: [
    { id: "1", active: true, order: 1, title: "Processo criativo", text: "Penso cada projeto como uma conversa entre sua história, seu corpo e minha linguagem visual." },
    { id: "2", active: true, order: 2, title: "Atendimento cuidadoso", text: "Escuto com calma desde a primeira mensagem para entender o que você quer levar na pele." },
    { id: "3", active: true, order: 3, title: "Ambiente seguro", text: "Trabalho com materiais adequados, biossegurança e orientações claras em cada etapa." }
  ],
  imageUrl: "",
  quote: "Crio projetos que abraçam o corpo e são uma extensão da sua personalidade.",
  behindScenesImageUrl: "",
  behindScenesCaption: "Eu depois de comer strogonoff com feijão e decidir que era uma ótima hora pra criar arte.",
  studioInviteImageUrl: "/assets/studio/studio-1.jpeg",
  studioTourSteps: [
    { id: "entrada", order: 1, active: true, label: "Entrada", title: "Essa é a entrada.", text: "É daqui que começa a experiência: um espaço mais íntimo, calmo e preparado para te receber.", imageUrl: "/assets/studio/studio-1.jpeg" },
    { id: "espaco", order: 2, active: true, label: "Espaço", title: "Meu cantinho de criação.", text: "É aqui que eu desenho, organizo referências e preparo cada detalhe antes da tattoo acontecer.", imageUrl: "/assets/studio/studio-3.jpeg" },
    { id: "processo", order: 3, active: true, label: "Processo", title: "Onde o projeto ganha forma.", text: "Entre conversas, traços e ajustes, cada ideia vai encontrando o próprio lugar.", imageUrl: "/assets/studio/studio-5.jpeg" },
    { id: "vista", order: 4, active: true, label: "Vista", title: "Uma vista que acompanha o processo.", text: "Meu studio também carrega um pouco de Teresópolis — e isso faz parte do clima do espaço.", imageUrl: "/assets/studio/studio-8.jpeg" },
    { id: "cuidado", order: 5, active: true, label: "Cuidado", title: "Tudo pensado com cuidado.", text: "Do ambiente aos materiais, eu gosto que cada detalhe faça a experiência ser leve, segura e especial.", imageUrl: "/assets/studio/studio-11.jpeg" },
  ],
};

/** Copy inicial igual à que está publicada hoje em /reformulacoes. */
export const mockReformulacoesTextos: ReformulationsDocument = {
  heroEyebrow: "Reformulação · reconstrução · aprimoramento",
  heroTitle: "Reformulações",
  heroText: "Um novo projeto criado a partir da tattoo que você já tem, para melhorar desenho, composição e leitura sem apagar sua história.",
  heroButton: "Quero avaliar minha tattoo",
  heroButtonUrl: "/orcamento",
  heroImageUrl: "",

  introEyebrow: "Reconstruir para evoluir",
  introTitle: "A tattoo continua sendo sua. O desenho evolui.",
  introText: "Partimos do desenho existente para corrigir, reorganizar e aprimorar o que já está na sua pele.",
  panelEyebrow: "Análise individual",
  panelTextOne: "A reformulação começa com uma leitura cuidadosa da tattoo atual: desenho, linhas, pigmento, cicatrização e região do corpo.",
  panelTextTwo: "A partir disso, reconstruímos o trabalho existente para chegar a uma versão mais equilibrada, coerente e próxima do que você deseja levar na pele.",
  panelPoints: [
    { id: "ponto-1", label: "Desenho original", active: true, order: 1 },
    { id: "ponto-2", label: "Linhas e proporções", active: true, order: 2 },
    { id: "ponto-3", label: "Integração no corpo", active: true, order: 3 },
  ],

  portfolioEyebrow: "Portfólio de reformulações",
  portfolioTitle: "A evolução de cada desenho",
  portfolioText: "Cada caso será apresentado com a tattoo original e o resultado depois da reconstrução, mantendo o antes e o depois lado a lado.",
  caseNote: "Fotos reais do processo serão adicionadas neste espaço.",

  possibilitiesEyebrow: "Possibilidades",
  possibilitiesTitle: "Como a tattoo pode evoluir",
  possibilitiesText: "A solução respeita o desenho que já existe e aquilo que você deseja melhorar nele.",
  possibilityCards: [
    { id: "possib-1", active: true, order: 1, title: "Reconstrução do desenho", text: "A estrutura existente é redesenhada para recuperar formas, intenção e uma leitura mais clara na pele." },
    { id: "possib-2", active: true, order: 2, title: "Correção e equilíbrio", text: "Linhas, proporções, pesos e contrastes são ajustados para melhorar a composição sem apagar sua essência." },
    { id: "possib-3", active: true, order: 3, title: "Ampliação e integração", text: "Novos elementos podem completar o desenho e integrar a tattoo existente a uma composição mais bem resolvida." },
  ],

  ctaTitle: "Vamos reconstruir e melhorar sua tattoo?",
  ctaText: "Envie uma foto e conte o que você gostaria de ajustar. A avaliação de cada reformulação é feita de forma individual.",
  ctaButton: "Quero avaliar minha tattoo",
  ctaButtonUrl: "/orcamento",
};

export const mockBastidores: BackstageDocument = {
  eyebrow: "Bastidores",
  title: "O processo também faz parte da obra",
  intro: "Veja desenhos, estudos, preparação e fragmentos do cotidiano no ateliê.",
  videoUrl: "",
  videoPoster: "",
  processTitle: "Do papel para a pele",
  processText: "Cada linha passa por pesquisa, desenho e ajustes antes de chegar ao corpo.",
  active: true,
};

export const mockLinkBio: LinkBioDocument = {
  eyebrow: "Link da bio",
  name: "Karina Sarte",
  bio: "Tatuagem autoral · Teresópolis, RJ",
  avatarUrl: "",
  backgroundUrl: "",
  instagram: "@karinasarte",
  footerLabel: "Site completo",
  footerUrl: "/",
  buttons: [
    {
      id: "link-1",
      label: "Solicitar orçamento",
      url: "https://wa.me/5521990724477?text=" + encodeURIComponent("Olá Karina, vim pelo seu link da bio e queria fazer um orçamento de tattoo."),
      icon: "WhatsApp",
      active: true,
      order: 1,
    },
    { id: "link-2", label: "Portfólio", url: "/portfolio", icon: "Images", active: true, order: 2 },
    { id: "link-3", label: "Flash Tattoos", url: "/flash-tattoos", icon: "Sparkles", active: true, order: 3 },
    { id: "link-4", label: "Produtos", url: "/produtos", icon: "ShoppingBag", active: true, order: 4 },
    { id: "link-5", label: "TikTok", url: "https://www.tiktok.com/@karinasarte", icon: "TikTok", active: true, order: 5 },
    { id: "link-6", label: "YouTube", url: "https://www.youtube.com/@karinasarte", icon: "YouTube", active: true, order: 6 },
    { id: "link-7", label: "Instagram", url: "https://www.instagram.com/karinasarte", icon: "Instagram", active: true, order: 7 },
  ],
  highlights: [],

  stylesLabel: "linguagem visual",
  stylesTitle: "Estilos que atravessam meu trabalho",
  stylesText: "Traços, símbolos e referências que aparecem nas minhas criações autorais.",
  styleChips: [
    { id: "chip-1", label: "blackwork", active: true, order: 1 },
    { id: "chip-2", label: "botânica", active: true, order: 2 },
    { id: "chip-3", label: "ornamental", active: true, order: 3 },
    { id: "chip-4", label: "suminagashi", active: true, order: 4 },
    { id: "chip-5", label: "fineline", active: true, order: 5 },
    { id: "chip-6", label: "neotradicional", active: true, order: 6 },
  ],

  flashLabel: "flash tattoos",
  flashTitle: "Flashs disponíveis",
  flashText: "Desenhos autorais prontos para tatuar, com disponibilidade limitada.",
  flashCta: "Ver todos os flashs",

  testimonialsLabel: "depoimentos",
  testimonialsTitle: "Quem já passou por aqui",
  testimonialsCta: "Quero viver essa experiência também",
  testimonials: [
    { id: "quote-1", text: "Ficou simplesmente perfeita!", active: true, order: 1 },
    { id: "quote-2", text: "Me senti ouvida em cada detalhe.", active: true, order: 2 },
    { id: "quote-3", text: "Melhor que eu esperava.", active: true, order: 3 },
    { id: "quote-4", text: "O trabalho ficou surreal.", active: true, order: 4 },
  ],

  studioLabel: "meu studio",
  studioTitle: "Um espaço para criar com calma",
  studioText: "É aqui que eu desenho, preparo cada detalhe e recebo quem chega para transformar ideia em pele.",
  studioImageUrl: "/assets/studio/studio-5.jpeg",
  studioButton: "Conhecer o studio",
  studioButtonUrl: "/sobre",

  finalTitle: "Vamos criar sua próxima tattoo?",
  finalText: "Me chama com sua ideia, referência ou dúvida e a gente começa a pensar no projeto.",
  finalButton: "Solicitar orçamento",
};

export const mockSettings: SettingsDocument = {
  siteName: "Karina Sarte — Tattoo & Arte",
  city: "Teresópolis, RJ",
  whatsapp: "5521999999999",
  instagram: "https://instagram.com/karinasarte",
  portfolioUrl: "https://brunosouza.dev.br",
  seoTitle: "Karina Sarte | Tatuagem autoral em Teresópolis",
  seoDescription: "Tatuagens autorais, flash tattoos, reformulações e arte por Karina Sarte.",
  shareImageUrl: "",
  whatsappBudget: "Olá, Karina! Vim pelo site e gostaria de solicitar um orçamento.",
  whatsappFlash: "Olá, Karina! Quero saber sobre os flash tattoos disponíveis.",
  whatsappProducts: "Olá, Karina! Quero conhecer os produtos disponíveis.",
  whatsappReformulation: "Olá, Karina! Gostaria de avaliar uma reformulação de tattoo.",
};

export const mockSiteMode: SiteModeDocument = {
  developmentMode: false,
  developmentEyebrow: "Karina Sarte",
  developmentTitle: "Esse site está em desenvolvimento",
  developmentText: "Estou preparando esse espaço com carinho. Em breve tudo aparece por aqui com mais detalhes, arte e intenção.",
  developmentImageUrl: "",
  developmentButton: "Falar comigo no WhatsApp",
  developmentButtonUrl: "https://wa.me/5521990724477?text=Oi%2C%20Karina%21%20Vim%20pelo%20site%20e%20queria%20falar%20com%20voc%C3%AA.",
};
