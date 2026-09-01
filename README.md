# Karina Sarte

Site público e painel administrativo da Karina Sarte.

## Estrutura

```text
frontend/            React + Vite — site, /admin e Cloudflare Pages Functions (/api)
frontend/functions/  API same-origin (Neon + Supabase Storage)
backend/             Fastify legado no Render — rollback até o cutover
scripts/             hash PBKDF2, seed de admin, helpers de migração
```

Detalhes da migração: [`MIGRATION-PAGES-FUNCTIONS.md`](MIGRATION-PAGES-FUNCTIONS.md).

## Desenvolvimento (Pages Functions — preferido)

Requer Node.js 20+.

```bash
npm install
# Copie secrets para frontend/.dev.vars (veja MIGRATION-PAGES-FUNCTIONS.md)
cd frontend
npm run pages:dev
```

- Site + API: `http://127.0.0.1:8788` (porta do wrangler)
- Com `VITE_API_URL` vazio, o cliente chama `/api/*` same-origin

## Desenvolvimento legado (Fastify local)

```bash
cp frontend/.env.example frontend/.env   # VITE_API_URL=http://localhost:3333
cp backend/.env.example backend/.env
npm run admin:hash -- --all
npm run dev
```

- Site: `http://localhost:5174`
- API: `http://localhost:3333`

## Área administrativa

Editores: Home, Sobre, Portfólio, Reformulações, Flash Tattoos, Produtos, Orçamento, FAQ, Link da Bio, Contato dev. Conteúdo persiste em **Neon** (`content_entries`); mídia em **Supabase Storage**.

Bundles separados: `/` não baixa o admin; `/admin` não carrega Lenis/GSAP do site público.

### Auth

| Método | Rota | Comportamento |
|---|---|---|
| POST | `/api/admin/login` | E-mail/senha + cookie httpOnly (PBKDF2 nas Functions) |
| POST | `/api/admin/logout` | Limpa sessão |
| GET | `/api/admin/session` | Estado atual |

Escrita autenticada: cookie ou `Authorization: Bearer ADMIN_API_TOKEN`.

## Neon

1. Configure `DATABASE_URL` (Pages secrets / `.dev.vars` / `backend/.env`).
2. Migrations em `backend/migrations/` (inclui `003_login_attempts.sql` para rate limit).

Tabelas: `content_entries`, `media_assets`, `admin_users`, `login_attempts`.

## Uploads (Supabase Storage)

1. `POST /api/uploads/presign` → URL assinada
2. Browser faz `PUT` direto no bucket
3. `POST /api/media` registra metadados no Neon

Conversão HEIC/MOV ocorre no navegador (`mediaStore.ts`).

## Produção

- Frontend + Functions: Cloudflare Pages (Root directory = `frontend`)
- Durante a migração, `VITE_API_URL` pode ainda apontar para o Render
- Após validação (incl. Safari/iPhone), remova `VITE_API_URL` e desligue o Render
- Nunca coloque secrets em variáveis `VITE_*`
