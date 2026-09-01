# Migração da API para Cloudflare Pages Functions

A API Fastify no Render continua no ar como rollback. O frontend ainda pode
usar `VITE_API_URL` apontando para o Render até o cutover (Tarefa 8).

## Variáveis no painel do Pages

**Settings → Environment variables** — configure em **Production** e **Preview**:

| Nome | Tipo |
|---|---|
| `DATABASE_URL` | Secret |
| `SUPABASE_URL` | Text |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret |
| `SUPABASE_BUCKET` | Text |
| `ADMIN_PASSWORD_HASH` | Secret |
| `ADMIN_SESSION_SECRET` | Secret |
| `ADMIN_API_TOKEN` | Secret |

Nenhuma tem prefixo `VITE_` (não entram no bundle do cliente).

**Mantém `VITE_API_URL` apontando para o Render** até validar as Functions em
preview/produção. Só então remova `VITE_API_URL` para passar a usar `/api` same-origin.

## Migration Neon

```bash
psql "$DATABASE_URL" -f backend/migrations/003_login_attempts.sql
```

Ou cole o SQL no console web do Neon.

## Senha PBKDF2 (crítico no free tier)

O plano gratuito corta em ~10ms de CPU. Calibre e gere:

```bash
node scripts/hash-password.mjs --bench
node scripts/hash-password.mjs --iterations 10000
```

Nesta máquina, **10.000 iterações ~6.7ms** (dentro da margem); 20.000 ~13ms (acima).
Use o maior valor confortável abaixo de ~7ms na sua máquina e confirme no wrangler.

A senha precisa ter **12+ caracteres** (frase de 4–5 palavras). Depois:

```bash
DATABASE_URL="..." ADMIN_PASSWORD_HASH="pbkdf2:..." node scripts/seed-admin.mjs
```

## Teste local

Crie `frontend/.dev.vars` (já no `.gitignore`) com as mesmas variáveis. Depois:

```bash
cd frontend
npm run pages:dev
```

Checklist: `GET /api/content/home`, login admin, salvar editor, upload, HEIC,
6º login errado → 429, sem `exceeded CPU time limit` no wrangler.
