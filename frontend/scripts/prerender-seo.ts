/**
 * Depois do `vite build`, grava um HTML por rota a partir de `pageSeoSnapshot`
 * (a mesma função que `applyPageSeo` usa). O JSON-LD fica em `#ks-page-jsonld`
 * para o runtime atualizar o nó, não criar outro.
 *
 * O modo "site em construção" é um flag de banco e NÃO entra aqui: o HTML
 * sai sempre com o robots do PAGE_SEO. Ver o parecer dessa tarefa.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { SITEMAP_ROUTES, SITE, absoluteUrl, pageSeoSnapshot, type PageSeo } from "../src/app/seo";

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function setAttr(html: string, prefix: string, content: string) {
  const pattern = new RegExp(`(${prefix}=")[^"]*(")`);
  if (!pattern.test(html)) throw new Error(`Atributo ausente no HTML: ${prefix}`);
  return html.replace(pattern, `$1${esc(content)}$2`);
}

export function renderRouteHtml(template: string, pathname: string) {
  const seo = pageSeoSnapshot(pathname);
  let html = template;
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${esc(seo.lang)}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(seo.title)}</title>`);
  html = setAttr(html, '<meta name="description" content', seo.description);
  html = setAttr(html, '<meta name="keywords" content', seo.keywords);
  html = setAttr(html, '<meta name="author" content', seo.author);
  html = setAttr(html, '<meta name="robots" content', seo.robots);
  html = setAttr(html, '<meta name="theme-color" content', seo.themeColor);
  html = setAttr(html, '<link rel="canonical" href', seo.canonical);
  html = setAttr(html, '<link rel="alternate" hreflang="pt-BR" href', seo.canonical);
  html = setAttr(html, '<meta property="og:url" content', seo.ogUrl);
  html = setAttr(html, '<meta property="og:title" content', seo.ogTitle);
  html = setAttr(html, '<meta property="og:description" content', seo.ogDescription);
  html = setAttr(html, '<meta property="og:image" content', seo.ogImage);
  html = setAttr(html, '<meta property="og:image:alt" content', seo.ogImageAlt);
  html = setAttr(html, '<meta name="twitter:title" content', seo.twitterTitle);
  html = setAttr(html, '<meta name="twitter:description" content', seo.twitterDescription);
  html = setAttr(html, '<meta name="twitter:image" content', seo.twitterImage);
  html = setAttr(html, '<meta name="twitter:image:alt" content', seo.twitterImageAlt);

  const json = JSON.stringify(seo.jsonLd).replace(/</g, "\\u003c");
  const script = `<script type="application/ld+json" id="ks-page-jsonld">${json}</script>`;
  if (!html.includes('id="ks-page-jsonld"')) {
    throw new Error("JSON-LD sem id ks-page-jsonld — applyPageSeo criaria um segundo bloco.");
  }
  html = html.replace(/<script type="application\/ld\+json" id="ks-page-jsonld">[\s\S]*?<\/script>/, script);
  return html;
}

function outputPaths(distDir: string, path: string) {
  if (path === "/") return [join(distDir, "index.html")];
  if (path === "/404") return [join(distDir, "404.html"), join(distDir, "404", "index.html")];
  const slug = path.slice(1);
  // `slug.html` evita o 308 de `/slug` → `/slug/` (o canonical é sem barra).
  // `slug/index.html` cobre a URL com barra, se alguém chegar por ela.
  return [join(distDir, `${slug}.html`), join(distDir, slug, "index.html")];
}

function xmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sitemapXml(lastmod: string) {
  const urls = SITEMAP_ROUTES.map((page: PageSeo) => {
    const loc = page.path === "/" ? `${SITE.baseUrl}/` : absoluteUrl(page.path);
    return [
      "  <url>",
      `    <loc>${xmlEscape(loc)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${page.changefreq}</changefreq>`,
      `    <priority>${page.priority}</priority>`,
      "  </url>",
    ].join("\n");
  }).join("\n\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls}

</urlset>
`;
}

export function prerenderDist(distDir: string) {
  const template = readFileSync(join(distDir, "index.html"), "utf8");
  const routes = ["/", "/sobre", "/portfolio", "/reformulacoes", "/flash-tattoos", "/produtos", "/orcamento", "/bio", "/404"];

  for (const path of routes) {
    const html = renderRouteHtml(template, path);
    for (const file of outputPaths(distDir, path)) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, html);
    }
  }

  const lastmod = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  writeFileSync(join(distDir, "sitemap.xml"), sitemapXml(lastmod));
  return { routes, lastmod };
}
