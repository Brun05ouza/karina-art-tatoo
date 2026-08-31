const PROD_API = "https://karina-art-tatoo.onrender.com";

/**
 * Base da API. Em produção, se `VITE_API_URL` não estiver no build do Pages,
 * usa o Render diretamente (evita cair em localhost e mostrar mocks).
 */
export const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3333" : PROD_API)
).replace(/\/$/, "");
