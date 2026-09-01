const PROD_API = "https://karina-art-tatoo.onrender.com";

/**
 * Base da API. Use sempre este módulo — não monte a URL na mão.
 * Em desenvolvimento, defina `VITE_API_URL` no `.env` (ex.: a porta do backend local).
 * Em produção no Pages, `VITE_API_URL` aponta ao Render até o cutover same-origin.
 */
export const API_URL = (import.meta.env.VITE_API_URL || PROD_API).replace(/\/$/, "");
