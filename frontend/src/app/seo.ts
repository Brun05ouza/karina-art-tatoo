/** Configuração e utilitários de SEO — fonte única para meta tags e JSON-LD. */

export const SITE = {
  name: "Karina Sarte Tattoo",
  shortName: "Karina Sarte",
  baseUrl: "https://karinasarte.com.br",
  locale: "pt_BR",
  language: "pt-BR",
  twitter: "@karinasarte",
  instagram: "https://www.instagram.com/karina.sarte",
  email: "contato@karinasarte.com.br",
  phone: "+5521990724477",
  phoneDisplay: "(21) 99072-4477",
  themeColor: "#2E173A",
  ogImagePath: "/og/karina-sarte-og.jpg",
  ogImageAlt: "Karina Sarte Tattoo — Tatuagem autoral em Teresópolis, RJ",
  address: {
    locality: "Teresópolis",
    region: "RJ",
    country: "BR",
  },
  geo: {
    latitude: -22.4122,
    longitude: -42.9763,
  },
} as const;

/** FAQ usado no bloco de produtos (não há rota /faq). */
export const FAQ_ITEMS: ReadonlyArray<readonly [string, string]> = [
  ["Como faço um orçamento?", "Envie sua ideia pelo WhatsApp com referências, tamanho aproximado e local do corpo."],
  ["Faço desenhos personalizados?", "Sim. Crio projetos conforme a ideia e o estilo que você deseja."],
  ["Tem flash tattoo disponível?", "Sim. Os flashes disponíveis ficam na página Flash Tattoos ou podem ser consultados comigo pelo WhatsApp."],
  ["Como funcionam os produtos?", "Os produtos e artes ficam na página Produtos. A compra ou consulta é feita diretamente comigo pelo WhatsApp."],
  ["Preciso pagar sinal?", "A regra de reserva pode ser confirmada no atendimento, conforme agenda e projeto."],
  ["Quais formas de pagamento são aceitas?", "As formas de pagamento são combinadas diretamente comigo pelo WhatsApp."],
];

export type PageSeo = {
  path: string;
  title: string;
  description: string;
  keywords: string;
  breadcrumb: string;
  changefreq: "weekly" | "monthly" | "yearly";
  priority: number;
  noindex?: boolean;
};

/** Rotas públicas indexáveis. Sem /cuidados, /faq, /como-funciona, /depoimentos. */
export const PAGE_SEO: Record<string, PageSeo> = {
  "/": {
    path: "/",
    title: "Karina Sarte | Tatuagem Autoral em Teresópolis, RJ",
    description:
      "Tatuagens autorais, flash tattoos e projetos personalizados em Teresópolis, RJ. Conheça o portfólio da Karina Sarte e peça seu orçamento.",
    keywords:
      "tatuadora em Teresópolis, tatuagem autoral em Teresópolis, flash tattoo Teresópolis, tattoo personalizada RJ, Karina Sarte Tattoo",
    breadcrumb: "Início",
    changefreq: "weekly",
    priority: 1,
  },
  "/sobre": {
    path: "/sobre",
    title: "Sobre a Karina Sarte | Tatuadora Autoral em Teresópolis",
    description:
      "Conheça a Karina Sarte, tatuadora em Teresópolis que cria projetos autorais com escuta, cuidado, referências botânicas e composições personalizadas.",
    keywords:
      "Karina Sarte tatuadora, tatuadora autoral Teresópolis, estúdio de tattoo Teresópolis, processo criativo tattoo",
    breadcrumb: "Sobre",
    changefreq: "monthly",
    priority: 0.8,
  },
  "/portfolio": {
    path: "/portfolio",
    title: "Portfólio de Tatuagens | Karina Sarte Tattoo",
    description:
      "Veja o portfólio de tatuagens da Karina Sarte: trabalhos autorais, fine line, botânicos, ornamentais, blackwork, flash tattoos e projetos personalizados.",
    keywords:
      "portfólio de tatuagem, tattoos autorais, tatuagem fine line, tattoo botânica, tatuagem ornamental, blackwork tattoo",
    breadcrumb: "Portfólio",
    changefreq: "weekly",
    priority: 0.9,
  },
  "/reformulacoes": {
    path: "/reformulacoes",
    title: "Reformulação de Tattoo em Teresópolis | Karina Sarte",
    description:
      "Reformulações de tattoos com cuidado, reconstrução de desenho, ajustes de composição e novos caminhos para artes já existentes na pele.",
    keywords:
      "reformulação de tattoo, cobertura de tatuagem, reconstrução de tatuagem, corrigir tattoo, tattoo antiga reformulada",
    breadcrumb: "Reformulações",
    changefreq: "monthly",
    priority: 0.85,
  },
  "/flash-tattoos": {
    path: "/flash-tattoos",
    title: "Flash Tattoos Disponíveis | Karina Sarte Tattoo",
    description:
      "Conheça flash tattoos autorais da Karina Sarte, com desenhos prontos para tatuar, disponibilidade limitada e orçamento pelo WhatsApp.",
    keywords:
      "flash tattoo Teresópolis, flash tattoos disponíveis, flash tattoo autoral, desenhos prontos para tatuar",
    breadcrumb: "Flash Tattoos",
    changefreq: "weekly",
    priority: 0.85,
  },
  "/produtos": {
    path: "/produtos",
    title: "Produtos Autorais | Karina Sarte",
    description:
      "Conheça produtos, prints, artes e coleções autorais da Karina Sarte, criados a partir do universo visual da tattoo e da ilustração.",
    keywords:
      "produtos autorais tattoo, prints de tattoo, artes autorais, flash tattoo produto, coleção Karina Sarte",
    breadcrumb: "Produtos",
    changefreq: "weekly",
    priority: 0.75,
  },
  "/orcamento": {
    path: "/orcamento",
    title: "Orçamento de Tattoo em Teresópolis | Karina Sarte",
    description:
      "Envie sua ideia, referências e dúvidas para receber um orçamento personalizado de tattoo com a Karina Sarte em Teresópolis, RJ.",
    keywords:
      "orçamento tattoo Teresópolis, orçamento tatuagem, pedir orçamento tattoo, tatuagem personalizada preço",
    breadcrumb: "Orçamento",
    changefreq: "monthly",
    priority: 0.9,
  },
  "/bio": {
    path: "/bio",
    title: "Links da Karina Sarte | Tattoo, Portfólio e Orçamento",
    description:
      "Acesse os principais links da Karina Sarte: WhatsApp, portfólio, flash tattoos, produtos, Instagram e orçamento de tattoo.",
    keywords: "Karina Sarte links, bio Karina Sarte, Instagram Karina Sarte, WhatsApp Karina Sarte",
    breadcrumb: "Links",
    changefreq: "monthly",
    priority: 0.6,
  },
  "/404": {
    path: "/404",
    title: "Página não encontrada | Karina Sarte",
    description:
      "A página que você tentou acessar não foi encontrada. Volte para o site da Karina Sarte ou peça um orçamento de tattoo.",
    keywords: "Karina Sarte, página não encontrada",
    breadcrumb: "Página não encontrada",
    changefreq: "yearly",
    priority: 0,
    noindex: true,
  },
};

/** Rotas do sitemap (exclui /404). */
export const SITEMAP_ROUTES = Object.values(PAGE_SEO).filter((page) => page.path !== "/404" && !page.noindex);

export function getPageSeo(pathname: string): PageSeo {
  if (pathname in PAGE_SEO) return PAGE_SEO[pathname]!;
  return PAGE_SEO["/404"]!;
}

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function upsertMeta(attributes: Record<string, string>) {
  const isOg = "property" in attributes;
  const key = isOg ? "property" : "name";
  const value = attributes[key]!;
  const selector = `meta[${key}="${value}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(key, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", attributes.content);
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  let selector = `link[rel="${rel}"]`;
  if (extra?.hreflang) selector += `[hreflang="${extra.hreflang}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (extra?.hreflang) el.setAttribute("hreflang", extra.hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

const BUSINESS_ID = `${SITE.baseUrl}/#business`;
const WEBSITE_ID = `${SITE.baseUrl}/#website`;
const PERSON_ID = `${SITE.baseUrl}/#karina`;

/** TODO SEO: preencher endereço completo e horário de atendimento caso a Karina queira divulgar. */
function buildLocalBusiness() {
  return {
    "@type": "TattooParlor",
    "@id": BUSINESS_ID,
    name: SITE.name,
    alternateName: SITE.shortName,
    description:
      "Tatuagens autorais, flash tattoos e projetos personalizados em Teresópolis, RJ.",
    url: SITE.baseUrl,
    telephone: SITE.phone,
    email: SITE.email,
    image: absoluteUrl(SITE.ogImagePath),
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    areaServed: {
      "@type": "City",
      name: "Teresópolis",
      containedInPlace: { "@type": "State", name: "Rio de Janeiro" },
    },
    sameAs: [SITE.instagram],
  };
}

function buildWebSite() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.baseUrl,
    name: SITE.name,
    description: "Tatuagens autorais, flash tattoos e projetos personalizados em Teresópolis, RJ.",
    inLanguage: SITE.language,
    publisher: { "@id": BUSINESS_ID },
  };
}

function buildPerson() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.shortName,
    jobTitle: "Tatuadora",
    description:
      "Tatuadora autoral em Teresópolis, RJ, com foco em projetos personalizados, flash tattoos e reformulações.",
    url: absoluteUrl("/sobre"),
    worksFor: { "@id": BUSINESS_ID },
    sameAs: [SITE.instagram],
  };
}

function buildServices() {
  const services: Array<{ id: string; name: string; description: string; serviceType: string }> = [
    {
      id: "service-tatuagem-autoral",
      name: "Tatuagem autoral",
      description: "Projetos de tatuagem personalizados criados a partir de referências, história e intenção.",
      serviceType: "Tatuagem autoral",
    },
    {
      id: "service-flash-tattoo",
      name: "Flash tattoo",
      description: "Desenhos autorais prontos para tatuar, com disponibilidade limitada.",
      serviceType: "Flash tattoo",
    },
    {
      id: "service-reformulacao",
      name: "Reformulação de tattoo",
      description: "Reconstrução de desenho, composição e leitura visual de tattoos já existentes na pele.",
      serviceType: "Reformulação de tatuagem",
    },
    {
      id: "service-projeto-personalizado",
      name: "Projeto personalizado",
      description: "Criação de tattoo sob medida, do briefing ao desenho final para o corpo.",
      serviceType: "Projeto de tatuagem personalizada",
    },
    {
      id: "service-produtos-autorais",
      name: "Produtos autorais",
      description: "Prints, artes e coleções criadas a partir do universo visual da tattoo.",
      serviceType: "Produtos autorais",
    },
  ];

  return services.map((service) => ({
    "@type": "Service",
    "@id": `${SITE.baseUrl}/#${service.id}`,
    name: service.name,
    description: service.description,
    serviceType: service.serviceType,
    provider: { "@id": BUSINESS_ID },
    areaServed: { "@type": "City", name: "Teresópolis" },
  }));
}

function buildWebPage(page: PageSeo, url: string) {
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: SITE.language,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": BUSINESS_ID },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      contentUrl: absoluteUrl(SITE.ogImagePath),
      name: SITE.ogImageAlt,
    },
  };
}

function buildBreadcrumb(page: PageSeo, url: string) {
  const items = [{ "@type": "ListItem", position: 1, name: "Início", item: SITE.baseUrl }];
  if (page.path !== "/" && page.path !== "/404") {
    items.push({ "@type": "ListItem", position: 2, name: page.breadcrumb, item: url });
  }
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items,
  };
}

function buildFaqPage() {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl("/produtos")}#faq`,
    mainEntity: FAQ_ITEMS.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

function buildPageGraph(pathname: string) {
  const page = getPageSeo(pathname);
  const url = absoluteUrl(page.path === "/404" ? pathname : page.path);
  const graph: unknown[] = [
    buildLocalBusiness(),
    buildWebSite(),
    buildPerson(),
    ...buildServices(),
    buildWebPage(page, url),
    buildBreadcrumb(page, url),
  ];
  if (pathname === "/produtos") graph.push(buildFaqPage());
  return { "@context": "https://schema.org", "@graph": graph };
}

/** Aplica title, meta tags, Open Graph, Twitter e JSON-LD da rota atual. */
export function applyPageSeo(pathname: string) {
  const page = getPageSeo(pathname);
  const pageUrl = page.path === "/404" ? absoluteUrl(pathname) : absoluteUrl(page.path);
  const canonicalHref = page.path === "/404" ? absoluteUrl("/") : absoluteUrl(page.path);
  const ogImage = absoluteUrl(SITE.ogImagePath);

  document.documentElement.lang = SITE.language;
  document.title = page.title;

  upsertMeta({ name: "description", content: page.description });
  upsertMeta({ name: "keywords", content: page.keywords });
  upsertMeta({ name: "author", content: SITE.shortName });
  upsertMeta({
    name: "robots",
    content: page.noindex
      ? "noindex, follow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  });
  upsertMeta({ name: "theme-color", content: SITE.themeColor });
  upsertMeta({ name: "format-detection", content: "telephone=no" });

  upsertLink("canonical", canonicalHref);
  upsertLink("alternate", canonicalHref, { hreflang: SITE.language });

  upsertMeta({ property: "og:type", content: "website" });
  upsertMeta({ property: "og:site_name", content: SITE.name });
  upsertMeta({ property: "og:locale", content: SITE.locale });
  upsertMeta({ property: "og:url", content: page.path === "/404" ? canonicalHref : pageUrl });
  upsertMeta({ property: "og:title", content: page.title });
  upsertMeta({ property: "og:description", content: page.description });
  upsertMeta({ property: "og:image", content: ogImage });
  upsertMeta({ property: "og:image:alt", content: SITE.ogImageAlt });
  upsertMeta({ property: "og:image:width", content: "1200" });
  upsertMeta({ property: "og:image:height", content: "630" });

  upsertMeta({ name: "twitter:card", content: "summary_large_image" });
  upsertMeta({ name: "twitter:site", content: SITE.twitter });
  upsertMeta({ name: "twitter:title", content: page.title });
  upsertMeta({ name: "twitter:description", content: page.description });
  upsertMeta({ name: "twitter:image", content: ogImage });
  upsertMeta({ name: "twitter:image:alt", content: SITE.ogImageAlt });

  upsertJsonLd("ks-page-jsonld", buildPageGraph(pathname));
}
