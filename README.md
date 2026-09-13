# Karina Sarte

Site público da Karina Sarte — tatuagem autoral em Teresópolis, RJ.

Aplicação **estática** (React + Vite), sem backend nem painel administrativo. O conteúdo de cada página vive nos fallbacks em `frontend/src/app/*-content.ts`.

## Estrutura

```text
frontend/     React + Vite — site público
  src/app/    páginas, componentes e conteúdo estático
  public/     assets estáticos, robots.txt, sitemap
```

## Desenvolvimento

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Um único comando sobe **Vite** (HMR) e a **API** (Cloudflare Pages Functions):

| Serviço | URL |
|---|---|
| Site + admin | `http://localhost:5174` |
| API (proxy `/api`) | `127.0.0.1:8788` |

Na primeira execução, se `frontend/dist` ainda não existir, o script faz o build inicial automaticamente.

## Build e deploy

```bash
npm run build
```

Deploy no **Cloudflare Pages**:

| Campo | Valor |
|---|---|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |

Não há variáveis de ambiente obrigatórias no build.

## Páginas

`/`, `/sobre`, `/portfolio`, `/reformulacoes`, `/flash-tattoos`, `/produtos`, `/orcamento`, `/bio`

## Editar conteúdo

Atualize os objetos `default*` nos arquivos em `frontend/src/app/` (ex.: `home-content.ts`, `portfolio-works.ts`) e rode o build de novo.

**Atenção:** os fallbacks atuais podem estar desatualizados em relação ao que estava no banco Neon antes da remoção do CMS. Imagens de hero/portfólio nos defaults estão em grande parte vazias (`""`) — o site usa principalmente assets em `public/assets/`.
