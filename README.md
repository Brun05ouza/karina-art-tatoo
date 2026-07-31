# Karina Sarte

Site público e central administrativa da Karina Sarte, separados em frontend e backend para manter banco, credenciais e uploads fora do navegador.

## Estrutura

```text
frontend/  React + Vite — site público e /admin
backend/   Fastify — autenticação, Neon PostgreSQL e Cloudflare R2
```

## Desenvolvimento

Requer Node.js 20 ou superior.

```bash
npm install
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
npm run admin:hash -- --all
npm run dev
```

Preencha no `backend/.env` o hash e os segredos gerados. O comando `npm run dev` inicia:

- site e painel: `http://localhost:5174` e `http://localhost:5174/admin`;
- API: `http://localhost:3333`.

O gerador de senha não aceita a senha por argumento. Em terminal interativo, ela é solicitada sem eco; em automações, também pode ser lida pela entrada padrão.

## Área administrativa

O painel inclui visão geral e editores para Home, Sobre, Portfólio, Reformulações, Flash Tattoos, Produtos, Bastidores, FAQ, Link da Bio, Mídia e Configurações.

Nesta etapa, o conteúdo editado fica em `localStorage`, sob o prefixo `ks-admin-draft:`. Isso é apenas uma camada de rascunhos: nada sensível deve ser colocado nos mocks ou no bundle do frontend. O código da interface administrativa é público como qualquer JavaScript enviado ao navegador; a segurança real das operações está no `requireAdmin` do backend.

O site público e o painel são bundles separados. Abrir `/` não baixa o código do admin, e abrir `/admin` não carrega Lenis, GSAP, cursor personalizado ou o CSS do site público.

### Rotas de autenticação

| Método | Rota | Comportamento |
|---|---|---|
| POST | `/api/admin/login` | Valida e-mail/senha e cria cookie httpOnly |
| POST | `/api/admin/logout` | Limpa a sessão; sempre idempotente |
| GET | `/api/admin/session` | Retorna o estado atual; sempre responde 200 |
| POST | `/api/admin/dev-login` | Existe somente quando o login local está habilitado |

As rotas que alteram conteúdo aceitam o cookie administrativo ou `Authorization: Bearer SEU_TOKEN`. Se o header `Authorization` for enviado e estiver incorreto, a API não tenta usar o cookie como alternativa.

## Neon

1. Crie um projeto no Neon.
2. Configure `DATABASE_URL` no `backend/.env`.
3. Execute `npm run db:migrate`.

O banco começa com:

- `content_entries`: textos e coleções em JSON;
- `media_assets`: metadados das imagens armazenadas no R2.

Sem `DATABASE_URL`, o backend continua disponível para login, mas as rotas dependentes do banco respondem `503` com uma mensagem de configuração.

## Cloudflare R2

1. Crie um bucket privado e um token limitado a esse bucket.
2. Configure as variáveis `R2_*` no `backend/.env`.
3. Aplique `backend/config/r2-cors.example.json` ao bucket.
4. Informe o domínio público de leitura em `R2_PUBLIC_BASE_URL`.

O fluxo previsto é: solicitar uma URL `PUT` de cinco minutos em `/api/uploads/presign`, enviar a imagem diretamente ao R2 e registrar os metadados em `/api/media`. A API confirma que o objeto existe antes de gravá-lo no Neon.

## Segurança e produção

- Nunca coloque credenciais em variáveis `VITE_*` ou faça commit de arquivos `.env`.
- Restrinja `CORS_ORIGINS` aos domínios reais e o token R2 ao bucket necessário.
- O cookie usa `HttpOnly`, `SameSite=Lax`, expiração absoluta de 12 horas e assinatura HMAC. Em produção, usa também `Secure` e o prefixo `__Host-`.
- A API precisa ficar no mesmo domínio registrável do site, por exemplo `karinasarte.com.br` e `api.karinasarte.com.br`. Outro domínio exigiria `SameSite=None` e uma estratégia adicional de CSRF.
- `DEV_ADMIN_ENABLED=true` é recusado quando `NODE_ENV=production`.
- O servidor limita tentativas de login, taxa global, tamanho de JSON, origens e tipos de imagem.
- O deploy do frontend precisa redirecionar rotas desconhecidas para `index.html`, permitindo atualizar páginas como `/admin/portfolio` diretamente.

```bash
npm run build
npm run start
```

Os artefatos são gerados em `frontend/dist` e `backend/dist`.
