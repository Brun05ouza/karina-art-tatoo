/** Configuração e utilitários de SEO — fonte única para meta tags e JSON-LD. */

export const SITE = {
  name: "Karina Sarte",
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
  ogImagePath: "/assets/hero-home.png",
  ogImageAlt: "Tatuagem autoral de pantera por Karina Sarte em Teresópolis, RJ",
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
  changefreq: "weekly" | "monthly";
  priority: number;
};

export const PAGE_SEO: Record<string, PageSeo> = {
  "/": {
    path: "/",
    title: "Karina Sarte | Tatuadora em Teresópolis, RJ",
    description:
      "Tatuagens autorais, flash tattoos e projetos personalizados com Karina Sarte em Teresópolis, RJ. Fine line, botânica e arte com identidade.",
    keywords:
      "tatuagem Teresópolis, tatuadora RJ, Karina Sarte, tattoo autoral, flash tattoo, fine line, tatuagem feminina",
    breadcrumb: "Início",
    changefreq: "weekly",
    priority: 1,
  },
  "/sobre": {
    path: "/sobre",
    title: "Sobre Karina Sarte | Tatuadora Autoral em Teresópolis",
    description:
      "Conheça Karina Sarte: tatuadora autoral em Teresópolis, RJ. Traço fino, botânica, símbolos e projetos pensados para a pele e a história de cada cliente.",
    keywords: "sobre Karina Sarte, tatuadora Teresópolis, artista tattoo RJ, estúdio autoral",
    breadcrumb: "Sobre",
    changefreq: "monthly",
    priority: 0.8,
  },
  "/portfolio": {
    path: "/portfolio",
    title: "Portfólio de Tatuagens | Karina Sarte",
    description:
      "Portfólio de tattoos autorais: fine line, botânica, blackwork e projetos personalizados. Trabalhos recentes da Karina Sarte em Teresópolis, RJ.",
    keywords: "portfólio tattoo, tatuagens autorais, fine line Teresópolis, blackwork RJ, trabalhos Karina Sarte",
    breadcrumb: "Portfólio",
    changefreq: "weekly",
    priority: 0.9,
  },
  "/reformulacoes": {
    path: "/reformulacoes",
    title: "Reformulação e Reconstrução de Tattoo | Karina Sarte",
    description:
      "Reformulação e reconstrução de tatuagens com Karina Sarte em Teresópolis, RJ. Aprimoramento de desenhos, linhas, composição e integração de novos detalhes.",
    keywords:
      "reformulação de tatuagem Teresópolis, reconstrução de tattoo RJ, melhorar tatuagem antiga, correção de tattoo, Karina Sarte",
    breadcrumb: "Reformulações",
    changefreq: "monthly",
    priority: 0.8,
  },
  "/flash-tattoos": {
    path: "/flash-tattoos",
    title: "Flash Tattoos Disponíveis | Karina Sarte — Teresópolis",
    description:
      "Flash tattoos autorais prontas para tatuar com Karina Sarte. Artes exclusivas, disponibilidade limitada. Consulte pelo WhatsApp em Teresópolis, RJ.",
    keywords: "flash tattoo Teresópolis, tattoo pronta RJ, flash autoral, artes para tatuar",
    breadcrumb: "Flash Tattoos",
    changefreq: "weekly",
    priority: 0.85,
  },
  "/produtos": {
    path: "/produtos",
    title: "Produtos, Prints e Artes | Karina Sarte",
    description:
      "Prints, artes autorais, kits e coleções da Karina Sarte. Produtos do universo tattoo para colecionar, presentear ou levar além da pele.",
    keywords: "prints tattoo, produtos autorais, artes Karina Sarte, coleções tattoo Teresópolis",
    breadcrumb: "Produtos",
    changefreq: "weekly",
    priority: 0.9,
  },
  "/como-funciona": {
    path: "/como-funciona",
    title: "Como Funciona | Orçamento e Sessão — Karina Sarte",
    description:
      "Entenda como funciona o atendimento: orçamento pelo WhatsApp, criação do desenho, agendamento e sessão de tattoo com Karina Sarte em Teresópolis.",
    keywords: "como tatuar, processo tattoo, orçamento tatuagem, agendamento Teresópolis",
    breadcrumb: "Como funciona",
    changefreq: "monthly",
    priority: 0.7,
  },
  "/cuidados": {
    path: "/cuidados",
    title: "Cuidados com a Tattoo | Antes, Durante e Depois",
    description:
      "Orientações de cuidados com tattoo: preparo da pele, higiene na sessão, cicatrização e pós-tattoo. Guia completo da Karina Sarte.",
    keywords: "cuidados tattoo, cicatrização tatuagem, pós tattoo, higiene sessão",
    breadcrumb: "Cuidados",
    changefreq: "monthly",
    priority: 0.7,
  },
  "/depoimentos": {
    path: "/depoimentos",
    title: "Depoimentos | Clientes da Karina Sarte",
    description:
      "Relatos e experiências de quem já tatuou com Karina Sarte em Teresópolis, RJ. Feedback sobre atendimento, processo criativo e resultado.",
    keywords: "depoimentos tattoo Teresópolis, avaliações tatuadora RJ, experiências clientes",
    breadcrumb: "Depoimentos",
    changefreq: "monthly",
    priority: 0.6,
  },
  "/faq": {
    path: "/faq",
    title: "FAQ | Dúvidas sobre Tattoo e Atendimento",
    description:
      "Perguntas frequentes sobre orçamento, desenhos personalizados, flash tattoos, produtos, sinal e formas de pagamento — Karina Sarte.",
    keywords: "faq tatuagem, dúvidas tattoo Teresópolis, orçamento flash tattoo",
    breadcrumb: "FAQ",
    changefreq: "monthly",
    priority: 0.6,
  },
  "/orcamento": {
    path: "/orcamento",
    title: "Orçamento de Tattoo | Fale com Karina Sarte",
    description:
      "Solicite orçamento de tattoo com Karina Sarte pelo WhatsApp. Envie referências, tamanho e local do corpo. Atendimento em Teresópolis, RJ.",
    keywords: "orçamento tattoo Teresópolis, orçamento tatuagem RJ, WhatsApp tatuadora",
    breadcrumb: "Orçamento",
    changefreq: "monthly",
    priority: 0.85,
  },
};

export const SITEMAP_ROUTES = Object.values(PAGE_SEO);

export function getPageSeo(pathname: string): PageSeo {
  return PAGE_SEO[pathname] ?? PAGE_SEO["/"];
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

function buildLocalBusiness() {
  return {
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE.baseUrl}/#tattoo-parlor`,
    name: SITE.name,
    description:
      "Estúdio de tatuagem autoral em Teresópolis, RJ. Fine line, botânica, flash tattoos e projetos personalizados com Karina Sarte.",
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
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    sameAs: [SITE.instagram],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços de Tatuagem",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tatuagem autoral personalizada" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Flash tattoo" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fine line e botânica" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Prints e artes autorais" } },
      ],
    },
  };
}

function buildWebSite() {
  return {
    "@type": "WebSite",
    "@id": `${SITE.baseUrl}/#website`,
    name: SITE.name,
    url: SITE.baseUrl,
    inLanguage: SITE.language,
    publisher: { "@id": `${SITE.baseUrl}/#tattoo-parlor` },
    potentialAction: {
      "@type": "ContactAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.baseUrl}/orcamento`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      name: "Solicitar orçamento de tattoo",
    },
  };
}

function buildWebPage(page: PageSeo, url: string) {
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: SITE.language,
    isPartOf: { "@id": `${SITE.baseUrl}/#website` },
    about: { "@id": `${SITE.baseUrl}/#tattoo-parlor` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };
}

function buildBreadcrumb(page: PageSeo, url: string) {
  const items = [
    { "@type": "ListItem", position: 1, name: "Início", item: SITE.baseUrl },
  ];
  if (page.path !== "/") {
    items.push({ "@type": "ListItem", position: 2, name: page.breadcrumb, item: url });
  }
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items,
  };
}

function buildFaqPage(url: string) {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: FAQ_ITEMS.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

function buildPageGraph(pathname: string) {
  const page = getPageSeo(pathname);
  const url = absoluteUrl(page.path);
  const graph: unknown[] = [buildLocalBusiness(), buildWebSite(), buildWebPage(page, url), buildBreadcrumb(page, url)];
  if (pathname === "/faq") graph.push(buildFaqPage(url));
  return { "@context": "https://schema.org", "@graph": graph };
}

/** Aplica title, meta tags, Open Graph, Twitter e JSON-LD da rota atual. */
export function applyPageSeo(pathname: string) {
  const page = getPageSeo(pathname);
  const url = absoluteUrl(page.path);
  const ogImage = absoluteUrl(SITE.ogImagePath);

  document.documentElement.lang = SITE.language;
  document.title = page.title;

  upsertMeta({ name: "description", content: page.description });
  upsertMeta({ name: "keywords", content: page.keywords });
  upsertMeta({ name: "author", content: SITE.shortName });
  upsertMeta({ name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" });
  upsertMeta({ name: "theme-color", content: SITE.themeColor });
  upsertMeta({ name: "format-detection", content: "telephone=no" });

  upsertLink("canonical", url);
  upsertLink("alternate", url, { hreflang: SITE.language });

  upsertMeta({ property: "og:type", content: "website" });
  upsertMeta({ property: "og:site_name", content: SITE.name });
  upsertMeta({ property: "og:locale", content: SITE.locale });
  upsertMeta({ property: "og:url", content: url });
  upsertMeta({ property: "og:title", content: page.title });
  upsertMeta({ property: "og:description", content: page.description });
  upsertMeta({ property: "og:image", content: ogImage });
  upsertMeta({ property: "og:image:alt", content: SITE.ogImageAlt });

  upsertMeta({ name: "twitter:card", content: "summary_large_image" });
  upsertMeta({ name: "twitter:site", content: SITE.twitter });
  upsertMeta({ name: "twitter:title", content: page.title });
  upsertMeta({ name: "twitter:description", content: page.description });
  upsertMeta({ name: "twitter:image", content: ogImage });
  upsertMeta({ name: "twitter:image:alt", content: SITE.ogImageAlt });

  upsertJsonLd("ks-page-jsonld", buildPageGraph(pathname));
}
