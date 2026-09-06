# Estado atual do projeto — auditoria pós-remoção

Data da auditoria: 2026-09-01  
Escopo: site estático React + Vite (`frontend/`), sem admin, sem API, sem CMS.  
Método: inspeção de código + `npm run build` + `vite preview` em `127.0.0.1:4173` + Lighthouse CLI.

> **Nota:** a Tarefa 0 (congelar conteúdo do Neon nos fallbacks) **não foi executada**. O site exibe apenas os fallbacks hardcodados atuais, que podem estar desatualizados em relação ao que estava no banco.

---

## Parte 1 — O que ficou vazio

Fonte: `frontend/src/app/*-content.ts`, `portfolio-works.ts`, `process-videos.ts`.

| Página | Campo | Valor atual | Impacto visual |
|---|---|---|---|
| `/` (home) | `heroImageUrl` | `""` | Hero sem foto principal (só layout/texto) |
| `/` | `processImageUrl` | `""` | Seção processo sem imagem de fundo |
| `/` | `processPortraitUrl` | `""` | Retrato do processo ausente |
| `/` | `serviceCards[0–3].imageUrl` | `""` (×4) | Cards de serviços sem thumbnail |
| `/` | `collectionCards[0–3].imageUrl` | `""` (×4) | Cards de coleções sem imagem |
| `/` | `portfolioIds` | `[]` | Modo “automático” sem IDs → recorte de portfólio vazio |
| `/` | `youtubeThumbUrl` | `""` | Bloco YouTube sem thumbnail local |
| `/` | `youtubeTrailerUrl` | `""` | Vídeo embutido/trailer não carrega |
| `/sobre` | `heroImageUrl` | `""` | Hero da página sem foto |
| `/sobre` | `imageUrl` | `""` | Foto ao lado da biografia ausente |
| `/sobre` | `behindScenesImageUrl` | `""` | Seção bastidores sem imagem |
| `/portfolio` | `heroImageUrl` | `""` | Hero sem imagem |
| `/portfolio` | `galleryItems[*].img` | `""` (7 itens) | **Galeria inteira sem fotos** — só títulos/categorias |
| `/portfolio` | `galleryItems` (comentário) | “scaffolds mortos” | Metadados de exemplo, não fotos reais |
| `/reformulacoes` | `heroImageUrl` | `""` | Hero sem imagem |
| `/reformulacoes` | `caseNote` | “Fotos reais do processo serão adicionadas neste espaço.” | Placeholder explícito |
| `/reformulacoes` | `defaultReformulationCases[*].beforeImageUrl` | `""` (×2) | Antes/depois sem “antes” |
| `/reformulacoes` | `defaultReformulationCases[*].afterImageUrl` | `""` (×2) | Antes/depois sem “depois” |
| `/flash-tattoos` | `defaultFlashItems` | `[]` | **Lista de flashes vazia** |
| `/flash-tattoos` | `heroImageUrl` | `""` | Hero sem imagem |
| `/produtos` | `heroImageUrl` | `""` | Hero sem imagem |
| `/produtos` | `defaultProductItems[*].imageUrl` | `""` (×3) | Cards de produto sem foto |
| `/produtos` | `defaultProductItems[*].link` | `""` (×3) | Links de produto vazios |
| `/orcamento` | `heroImageUrl` | `""` | Hero sem imagem |
| `/bio` | `backgroundUrl` | `""` | Fundo da bio ausente (layout cai no padrão) |
| `/bio` | `highlights` | `[]` | Destaques vazios |
| `/bio` | flashes (via `flash-content`) | `[]` | Seção de flashs na bio sem itens |
| `process-videos.ts` | `artProcess.src` / `poster` | `""` | Vídeo de processo na home não disponível |
| `site-mode` | `developmentImageUrl` | `""` | Sem impacto (modo dev desligado) |

**Campos preenchidos (referência):** textos de todas as páginas, FAQ (6 itens), produtos (3 itens com preço), portfólio (7 títulos sem foto), reformulações (2 casos sem imagem), bio (avatar `/assets/karina-sarte.png`, estúdio `/assets/studio/studio-5.jpeg`, depoimentos, chips de estilo).

### Páginas visivelmente incompletas para um visitante

1. **`/portfolio`** — galeria sem nenhuma imagem (impacto crítico).
2. **`/flash-tattoos`** — lista vazia; página parece “sem estoque”.
3. **`/` (home)** — hero, processo, cards, YouTube e recorte de portfólio sem mídia.
4. **`/produtos`** — produtos listados mas sem fotos.
5. **`/reformulacoes`** — texto ok, mas antes/depois vazios + nota de “em breve”.
6. **`/bio`** — funcional, mas sem flashes e sem background customizado.
7. **`/sobre`** — textos e tour do estúdio ok; faltam hero, retrato e bastidores.
8. **`/orcamento`** — formulário/textos ok; hero sem imagem.

---

## Parte 2 — Código órfão

### Ferramentas executadas

#### `npx knip` (saída resumida — exit 1)

**Arquivos não usados (62)** — amostra completa da ferramenta:

```
default_shadcn_theme.css
src/app/components/ArtistSection.tsx
src/app/components/BookingForm.tsx
src/app/components/DriftWall.tsx
src/app/components/EditorialGallery.tsx
src/app/components/figma/ImageWithFallback.tsx
src/app/components/Hero.tsx
src/app/components/Manifesto.tsx
src/app/components/PrivateAtelier.tsx
src/app/components/ProcessHorizontal.tsx
src/app/components/StudioScrollSection.tsx
src/app/components/ui/* (48 arquivos — lista completa no output do knip)
src/app/process-videos.ts
src/app/tattoo-images.ts
src/styles/globals.css
```

> **Interpretação:** o site vive quase inteiro em `App.tsx` (~3.200 linhas). Componentes como `Hero.tsx`, `ArtistSection.tsx` são **legado não importado**. O knip não lista `App.tsx` como entry por falta de `knip.json`/`tsconfig.json` no frontend — vários “unused exports” em `*-content.ts` são **falsos positivos** (defaults usados internamente).

#### `npx depcheck`

```
Unused dependencies: tw-animate-css
Unused devDependencies: postcss, tailwindcss, tar
Missing dependencies: @emotion/is-prop-valid (transitivo do motion, no bundle)
Falsos positivos: referências a frontend/functions e .wrangler/ (artefatos locais antigos ainda no disco)
```

#### `npx ts-prune`

```
Falhou: frontend/tsconfig.json ausente (removido na migração).
```

### Componentes `components/ui/` órfãos

| Métrica | Valor medido |
|---|---|
| Arquivos em `ui/` | **48** |
| Tamanho total em disco | **150,7 KB** (154.335 bytes) |
| Importados pelo site público | **0** (nenhum `from "./components/ui/..."` fora da própria pasta `ui/`) |
| Radix no bundle JS | **ausente** (`@radix-ui` não aparece no bundle) |
| `recharts` no bundle | **ausente** |

### Dependências sem import correspondente (confirmado)

Todas as 28 dependências `@radix-ui/*`, mais: `class-variance-authority`, `clsx`, `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `next-themes`, `react-day-picker`, `react-hook-form`, `react-resizable-panels`, `recharts`, `sonner`, `tailwind-merge`, `vaul`.

**Ainda usadas no bundle:** `gsap`, `lenis`, `motion`/`framer-motion`, `react-router`, `lucide-react`, `react`, `react-dom`.

### Assets em `public/assets/` possivelmente não referenciados

**41 arquivos** no total; **30** sem referência encontrada em `frontend/src/` (busca por path/nome):

```
assets/brand/eye-purple.png
assets/brand/products-hero-art.png
assets/brand/products-hero-flower-eye.png
assets/development/karina-waist-dev.jpg
assets/hero-home.png
assets/hero.jpeg
assets/karina-2.webp
assets/karina-sarte-bastidores.webp
assets/karina-sarte-detalhe.jpg
assets/karina-sarte-retrato.jpg
assets/link-bio/background.jpg
assets/process/art-process-poster.jpg
assets/process/art-process.mp4
assets/recent-projects/* (7 arquivos + 1 vídeo)
assets/studio/studio-{2,4,6,7,9,10,12,13}.jpeg
assets/youtube/tattoo-vlog-thumb.jpeg
assets/youtube/tattoo-vlog-trailer.mp4
```

> Há fotos de portfólio e YouTube no disco que **não estão ligadas** aos fallbacks vazios.

### Exports sem consumidor externo (knip)

`defaultAboutContent`, `defaultHomeContent`, `default*`, funções em `scroll.ts`, `section-visibility.ts`, `PAGE_SEO`, etc. — maioria são defaults internos ou API pública intencional; não indicam bug por si só.

### CSS morto do admin

- Classes `ksa-*` (admin): **0 ocorrências** em `kah-sarte.css` após remoção.
- Classes `ks-development-*`: **~100 regras** ainda em `kah-sarte.css` (modo “site em desenvolvimento” — inativo, mas CSS permanece no bundle).

---

## Parte 3 — Baseline de performance (medida)

### Ambiente

```bash
cd frontend && npm run build && npx vite preview --port 4173 --host 127.0.0.1
```

Lighthouse CLI (Chrome headless). Relatórios em `frontend/lighthouse/*.report.{json,html}`.

### Scores

| Página | Modo | Performance | Acessibilidade | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---:|---:|---:|---:|---|---|---|
| `/` | desktop (`--preset=desktop`) | **81** | **95** | **100** | **100** | 2,8 s | 0 | 90 ms |
| `/` | mobile (padrão) | **43** | **95** | **100** | **100** | 16,3 s | 0 | 800 ms |
| `/portfolio` | mobile | **50** | **100** | **100** | **100** | 15,2 s | 0 | 500 ms |
| `/bio` | mobile | **56** | **88** | **100** | **100** | 19,2 s | 0 | 280 ms |

> LCP alto no mobile reflete preloader (`useBootReady`, mín. ~900 ms + até 7 s), GIF de 2,1 MB no preloader, JS de 577 KB e fontes Google bloqueando renderização — medido neste ambiente local, não em Cloudflare CDN.

### Oportunidades Lighthouse (lista crua, ordenada por `numericValue`)

#### `/` desktop

| ID | Título | Valor reportado | numericValue |
|---|---|---|---:|
| `unused-javascript` | Reduce unused JavaScript | Est savings of 86 KiB | 80 |
| `unused-css-rules` | Reduce unused CSS | Est savings of 26 KiB | 40 |

Diagnósticos: `total-byte-weight` 2.965 KiB; `mainthread-work-breakdown` 2,1 s.

#### `/` mobile

| ID | Título | Valor reportado | numericValue |
|---|---|---|---:|
| `unused-javascript` | Reduce unused JavaScript | Est savings of 86 KiB | 600 |
| `unused-css-rules` | Reduce unused CSS | Est savings of 25 KiB | — |

Diagnósticos adicionais:

| ID | Título | Valor |
|---|---|---|
| `render-blocking-insight` | Render-blocking requests | Est savings of 1.950 ms |
| `image-delivery-insight` | Improve image delivery | Est savings of 2.137 KiB |
| `total-byte-weight` | Avoid enormous network payloads | Total size was 2.965 KiB |
| `mainthread-work-breakdown` | Minimize main-thread work | 8,9 s |
| `bootup-time` | Reduce JavaScript execution time | 1,7 s |

Detalhe `image-delivery` (home mobile):

- `assets/IMG_0430.GIF` — ~2,16 MB (principal vilão)
- `assets/brand/star-karina-filled.png` — ~65 KB
- `assets/brand/star-karina-outline.png` — ~54 KB

Detalhe `render-blocking` (home mobile):

- `fonts.googleapis.com/css2?family=Amatic+SC...` — bloqueante
- `assets/index-D2ntfyyy.css` — ~48 KB transferidos, ~604 ms

#### `/portfolio` mobile

| ID | Título | Valor reportado | numericValue |
|---|---|---|---:|
| `unused-javascript` | Reduce unused JavaScript | Est savings of 90 KiB | 750 |
| `unused-css-rules` | Reduce unused CSS | Est savings of 30 KiB | 150 |

`mainthread-work-breakdown`: 4,3 s.

#### `/bio` mobile

| ID | Título | Valor reportado | numericValue |
|---|---|---|---:|
| `unused-javascript` | Reduce unused JavaScript | Est savings of 99 KiB | 900 |
| `unused-css-rules` | Reduce unused CSS | Est savings of 31 KiB | 150 |

`total-byte-weight`: 3.387 KiB.

---

## Parte 4 — Anatomia do bundle

### Saída completa de `npm run build`

```
vite v6.4.3 building for production...
✓ 2045 modules transformed.
dist/index.html                   5.86 kB │ gzip:   1.72 kB
dist/assets/index-D2ntfyyy.css  275.04 kB │ gzip:  47.39 kB
dist/assets/index-7xdWMs9w.js   577.44 kB │ gzip: 187.92 kB
✓ built in ~8 s
```

### CSS (275 KB / 47 KB gzip)

| Fonte | Tamanho em disco | Papel |
|---|---:|---|
| `kah-sarte.css` | 248.238 bytes (~242 KB) | CSS custom do site — **maioria do bundle** |
| `theme.css` | 5.287 bytes | Tokens/variáveis |
| `tailwind.css` + utilities geradas | ~31 KB (delta medido: bundle − kah source) | Tailwind 4 + `tw-animate-css` |
| Bundle final minificado | 275.044 bytes | — |

**Configuração Tailwind** (`frontend/src/styles/tailwind.css`):

```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';
```

- Escaneia **todo** `src/`, incluindo os 48 arquivos `ui/` órfãos → risco de utilities geradas para código morto.
- **Sem CSS `ksa-*` do admin** no bundle (admin removido).
- **~100 regras `ks-development-*`** ainda presentes em `kah-sarte.css` (modo dev inativo).

`npx source-map-explorer` no CSS: não executado (sem source map de CSS). Estimativa por tamanho de arquivo-fonte acima.

### JS (577 KB / 188 KB gzip)

Composição estimada via `index-7xdWMs9w.js.map` (build local com `--sourcemap`, só para medição):

| Pacote | Tamanho fonte no map (aprox.) |
|---|---:|
| `gsap` | 368 KB |
| `react-router` | 363 KB |
| `motion-dom` | 337 KB |
| `react-dom` | 131 KB |
| `framer-motion` | 122 KB |
| `lenis` | 32 KB |
| `lucide-react` | 12 KB |
| `motion-utils` | 11 KB |
| `react` | 8 KB |

**Ausentes do bundle:** `recharts`, `@radix-ui/*`, `@ffmpeg/*`, `libheif-js`.

**Presentes no bundle:** `ScrollTrigger`, `Flip` (plugins GSAP registrados em `App.tsx`).

> Um único chunk — sem code-split por rota. `App.tsx` monolítico puxa GSAP + Lenis + Motion em todas as páginas.

---

## Parte 5 — Estado do SEO

### `frontend/src/app/seo.ts` (integral)

```ts
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
```

### `frontend/index.html` (integral)

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Karina Sarte | Tatuagem Autoral em Teresópolis, RJ</title>
    <meta name="description" content="Tatuagens autorais, flash tattoos e projetos personalizados em Teresópolis, RJ. Conheça o portfólio da Karina Sarte e peça seu orçamento." />
    <meta name="keywords" content="tatuadora em Teresópolis, tatuagem autoral em Teresópolis, flash tattoo Teresópolis, tattoo personalizada RJ, Karina Sarte Tattoo" />
    <meta name="author" content="Karina Sarte" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="theme-color" content="#2E173A" />
    <meta name="format-detection" content="telephone=no" />

    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="canonical" href="https://karinasarte.com.br/" />
    <link rel="alternate" hreflang="pt-BR" href="https://karinasarte.com.br/" />
    <link rel="manifest" href="/site.webmanifest" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Karina Sarte Tattoo" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:url" content="https://karinasarte.com.br/" />
    <meta property="og:title" content="Karina Sarte | Tatuagem Autoral em Teresópolis, RJ" />
    <meta property="og:description" content="Tatuagens autorais, flash tattoos e projetos personalizados em Teresópolis, RJ. Conheça o portfólio da Karina Sarte e peça seu orçamento." />
    <meta property="og:image" content="https://karinasarte.com.br/og/karina-sarte-og.jpg" />
    <meta property="og:image:alt" content="Karina Sarte Tattoo — Tatuagem autoral em Teresópolis, RJ" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@karinasarte" />
    <meta name="twitter:title" content="Karina Sarte | Tatuagem Autoral em Teresópolis, RJ" />
    <meta name="twitter:description" content="Tatuagens autorais, flash tattoos e projetos personalizados em Teresópolis, RJ." />
    <meta name="twitter:image" content="https://karinasarte.com.br/og/karina-sarte-og.jpg" />
    <meta name="twitter:image:alt" content="Karina Sarte Tattoo — Tatuagem autoral em Teresópolis, RJ" />

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TattooParlor",
          "@id": "https://karinasarte.com.br/#business",
          "name": "Karina Sarte Tattoo",
          "alternateName": "Karina Sarte",
          "description": "Tatuagens autorais, flash tattoos e projetos personalizados em Teresópolis, RJ.",
          "url": "https://karinasarte.com.br",
          "telephone": "+5521990724477",
          "email": "contato@karinasarte.com.br",
          "image": "https://karinasarte.com.br/og/karina-sarte-og.jpg",
          "priceRange": "$$",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Teresópolis",
            "addressRegion": "RJ",
            "addressCountry": "BR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "-22.4122",
            "longitude": "-42.9763"
          },
          "areaServed": {
            "@type": "City",
            "name": "Teresópolis",
            "containedInPlace": { "@type": "State", "name": "Rio de Janeiro" }
          },
          "sameAs": ["https://www.instagram.com/karina.sarte"]
        },
        {
          "@type": "WebSite",
          "@id": "https://karinasarte.com.br/#website",
          "name": "Karina Sarte Tattoo",
          "url": "https://karinasarte.com.br",
          "inLanguage": "pt-BR",
          "publisher": { "@id": "https://karinasarte.com.br/#business" }
        },
        {
          "@type": "Person",
          "@id": "https://karinasarte.com.br/#karina",
          "name": "Karina Sarte",
          "jobTitle": "Tatuadora",
          "url": "https://karinasarte.com.br/sobre",
          "worksFor": { "@id": "https://karinasarte.com.br/#business" },
          "sameAs": ["https://www.instagram.com/karina.sarte"]
        }
      ]
    }
    </script>

    <style>html, body { height: 100%; margin: 0; } #root { height: 100%; }</style>
  </head>

  <body>
    <noscript>
      <div style="max-width:720px;margin:2rem auto;padding:0 1.25rem;font-family:Georgia,serif;line-height:1.6;color:#111014;">
        <h1>Karina Sarte</h1>
        <p>Tatuagens autorais, flash tattoos e projetos personalizados em Teresópolis, RJ.</p>
        <nav aria-label="Navegação principal">
          <ul>
            <li><a href="/">Início</a></li>
            <li><a href="/sobre">Sobre</a></li>
            <li><a href="/portfolio">Portfólio</a></li>
            <li><a href="/reformulacoes">Reformulações</a></li>
            <li><a href="/flash-tattoos">Flash Tattoos</a></li>
            <li><a href="/produtos">Produtos</a></li>
            <li><a href="/orcamento">Orçamento</a></li>
            <li><a href="/bio">Links</a></li>
          </ul>
        </nav>
      </div>
    </noscript>
    <div id="root"></div>
    <script>
      (function () {
        if (location.pathname === "/bio") {
          document.documentElement.classList.add("ks-native-scroll");
        }
      })();
    </script>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `frontend/public/robots.txt` (integral)

```
User-agent: *
Allow: /

Sitemap: https://karinasarte.com.br/sitemap.xml
```

### `frontend/public/sitemap.xml` (integral)

Lista 8 URLs: `/`, `/sobre`, `/portfolio`, `/reformulacoes`, `/flash-tattoos`, `/produtos`, `/orcamento`, `/bio` — todas existem no router.

### Respostas SEO

| Pergunta | Resposta |
|---|---|
| `sitemap.xml` lista URLs válidas? | **Sim** — 8 rotas batem com o router público |
| `robots.txt` menciona `/admin`? | **Não** (removido) |
| JSON-LD `TattooParlor` completo? | **Parcial** — ver tabela abaixo |
| Titles/descriptions únicos? | **Sim** — via `applyPageSeo` por rota |
| Instagram consistente? | **Não** — ver abaixo |
| `og:image` definido? | **Sim** — arquivo existe **1200×630**, 106.451 bytes |

#### Campos JSON-LD `TattooParlor`

| Campo | Status |
|---|---|
| `streetAddress` | **Falta** |
| `addressLocality` | Presente (`Teresópolis`) |
| `postalCode` | **Falta** |
| `telephone` | Presente (`+5521990724477`) |
| `openingHours` | **Falta** |
| `geo` | Presente (lat/long) |
| `priceRange` | Presente (`$$`) |

Há `TODO` explícito em `seo.ts` linha 206 sobre endereço e horário.

#### Títulos e descriptions por rota

| Rota | Title (chars) | Description (chars) |
|---|---:|---:|
| `/` | 50 | 137 |
| `/sobre` | 55 | 148 |
| `/portfolio` | 44 | 153 |
| `/reformulacoes` | 52 | 135 |
| `/flash-tattoos` | 47 | 133 |
| `/produtos` | 32 | 131 |
| `/orcamento` | 49 | 127 |
| `/bio` | 53 | 122 |
| `/404` | 36 (noindex) | 118 |

#### Instagram — divergência

| Local | Handle |
|---|---|
| `seo.ts`, `index.html`, `ArtistSection`, `Footer` | `instagram.com/karina.sarte` / `@karina.sarte` |
| `link-bio-content.ts` | `@karinasarte` |
| Twitter meta | `@karinasarte` |

#### Imagens `alt=""`

| Local | Decorativa? |
|---|---|
| Estrelas de fundo, preloader, cursor custom | Sim (`aria-hidden` ou puramente visual) |
| `coverImage` no tour do estúdio (`App.tsx`) | **Questionável** — imagem de conteúdo com `alt=""` |
| Cards de portfólio com `img: ""` | Não renderizam imagem (problema de conteúdo, não de alt) |

#### `og:image`

- Path: `/og/karina-sarte-og.jpg`
- Dimensões medidas: **1200 × 630 px** (recomendado)
- Tamanho: 106 KB

---

## Parte 6 — Carregamento de fontes

### `frontend/src/styles/fonts.css` (integral)

```css
@import url('https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=Barriecito&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

@font-face {
  font-family: "Kah Sarte Display";
  src: url("/fonts/kah-sarte-display.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### Inventário de fontes

| Família | Origem | Pesos/estilos solicitados |
|---|---|---|
| Amatic SC | Google Fonts (CSS2) | 400, 700 |
| Barriecito | Google Fonts | padrão da família |
| Cormorant Garamond | Google Fonts | 400, 500, 600 + itálico 400, 500 |
| Lora | Google Fonts | 400, 500, 600 + itálico 400 |
| Libre Baskerville | Google Fonts | 400, 700 + itálico 400 |
| IBM Plex Mono | Google Fonts | 400, 500 |
| Kah Sarte Display | Local (`/fonts/kah-sarte-display.ttf`) | 400 normal |

### Como são carregadas

1. `@import` no topo de `fonts.css` → importado por `index.css` → **render-blocking** no CSS principal.
2. O `@import` do Google dispara **1 request** ao `fonts.googleapis.com`, que retorna CSS com múltiplos `@font-face` apontando para `fonts.gstatic.com`.
3. Fonte local via `@font-face` com `font-display: swap`.

### Requisições na home (Lighthouse `diagnostics`)

- **`numFonts`: 5** arquivos de fonte efetivamente carregados na sessão medida
- **`numStylesheets`: 2** (bundle CSS + Google Fonts CSS)
- **`render-blocking-insight`**: economia estimada **1.950 ms** — principalmente o CSS do Google Fonts + bundle CSS

**Bloqueio de renderização:** o `@import` de Google Fonts no CSS é **render-blocking** por cadeia: HTML → CSS bundle → Google CSS → arquivos woff2. A fonte local depende do CSS bundle mas usa `font-display: swap` (não bloqueia pintura final indefinidamente).

---

## Parte 7 — Inventário para o admin novo

| Página | Campo editável | Tipo | Frequência |
|---|---|---|---|
| `/` | Hero (eyebrow, título, texto, CTAs, imagem) | texto + imagem + links | raro / imagem raro |
| `/` | Seção processo (textos, passos, imagens, retrato) | texto + lista + imagens | médio |
| `/` | Cards de serviços (×4) | lista (título, texto, link, imagem, ativo) | médio |
| `/` | Recorte portfólio (modo auto/manual, IDs) | enum + lista de IDs | semanal |
| `/` | Cards coleções (×4) | lista | médio |
| `/` | Bloco YouTube (textos, URLs, thumb, trailer, ativo) | texto + URLs + mídia | raro |
| `/` | CTA final | texto + link | raro |
| `/` | Seções ocultas (`hiddenSections`) | lista de chaves | raro |
| `/sobre` | Hero, biografia, citação, imagens | texto + imagens | raro |
| `/sobre` | Cards abordagem (×3) | lista | raro |
| `/sobre` | Bastidores (imagem + legenda) | imagem + texto | médio |
| `/sobre` | Tour do estúdio (passos ×5) | lista (label, título, texto, imagem) | raro |
| `/portfolio` | Hero da página | texto + imagem | raro |
| `/portfolio` | Trabalhos (galeria) | lista (título, categoria, imagem, destaque, vídeo processo) | **semanal** |
| `/reformulacoes` | Textos das seções + cards possibilidades | documento estruturado | raro |
| `/reformulacoes` | Casos antes/depois | lista (imagens/vídeos, título, categoria) | médio |
| `/flash-tattoos` | Hero + lista de flashes | texto + lista (imagem, preço, status, tamanho) | **semanal** |
| `/produtos` | Hero + CTA | texto + imagem | raro |
| `/produtos` | Catálogo | lista (título, preço, imagem, WhatsApp, link) | médio |
| `/orcamento` | Textos do hero, passos, formulário | documento | raro |
| `/bio` | Perfil (nome, bio, avatar, fundo, Instagram) | texto + imagens | raro |
| `/bio` | Botões de link | lista (label, URL, ícone) | médio |
| `/bio` | Chips de estilo, depoimentos | listas | raro |
| `/bio` | Bloco estúdio + CTA final | texto + imagem + link | raro |
| Global | Modo desenvolvimento (tela “em breve”) | boolean + textos | raro |
| Global | Visibilidade de páginas no menu | mapa rota → visível | raro |
| Global | FAQ (embutido em `/produtos`) | lista pergunta/resposta | raro |

**Leitura:** o CMS antigo era **necessário** principalmente para **portfólio**, **flashes**, **imagens de hero/cards** e **casos de reformulação** — exatamente o que está vazio hoje. Textos estáticos mudam pouco; listas de trabalho mudam toda semana.

---

## Os 5 problemas mais graves

Ordenados por impacto no visitante:

1. **Portfólio e flashes sem conteúdo visual** — `/portfolio` mostra 7 trabalhos sem foto; `/flash-tattoos` está vazia. Para um site de tatuadora, isso invalida as páginas mais importantes para conversão.

2. **Fallbacks de imagem vazios na home e produtos** — heróis, cards e YouTube sem mídia, apesar de existirem assets em `public/assets/` (ex.: `recent-projects/`, `youtube/`) não ligados ao código.

3. **Performance mobile medida baixa (43–56)** — GIF de 2,1 MB no preloader, 577 KB de JS monolítico (GSAP + Motion + Lenis em todas as rotas), fontes Google render-blocking. LCP mobile de 15–19 s no teste local.

4. **~150 KB de componentes UI + dezenas de dependências npm mortas** — não afetam runtime hoje (tree-shake funcionou), mas aumentam manutenção e risco de regressão; Tailwind ainda escaneia arquivos mortos.

5. **SEO técnico incompleto e inconsistência de marca** — JSON-LD sem endereço/horário; Instagram `karina.sarte` vs `@karinasarte` na bio; FAQ do schema diz que há flashes disponíveis enquanto a página está vazia (conteúdo contraditório).

---

## Artefatos gerados nesta auditoria

- `frontend/lighthouse/*.report.{json,html}` — adicionado `lighthouse/` ao `.gitignore`
- Build local com `--sourcemap` usado só para análise JS (não altera código-fonte)
