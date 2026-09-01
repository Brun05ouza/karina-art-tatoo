/**
 * Base da API.
 *
 * A API agora vive no mesmo domínio do site, servida por Cloudflare Pages
 * Functions em /api/*. Em produção a base é vazia e as chamadas ficam
 * relativas — não há mais URL de backend para manter em variável de ambiente,
 * e não há como o build "esquecer" a variável e cair em localhost.
 *
 * Em desenvolvimento, `wrangler pages dev` serve site e Functions juntos na
 * mesma porta, então a base também é vazia. VITE_API_URL só continua existindo
 * como escape hatch para apontar um ambiente para outro (ex.: rodar o Vite
 * puro contra um preview deploy ou contra o Render durante a migração).
 *
 * IMPORTANTE: todos os módulos que falam com a API devem importar API_URL
 * daqui. Antes da migração, nove arquivos montavam a base na mão com
 * fallback para localhost — se a variável faltasse no build, esses módulos
 * chamariam localhost no navegador do visitante e cairiam em mock silenciosamente.
 */
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
