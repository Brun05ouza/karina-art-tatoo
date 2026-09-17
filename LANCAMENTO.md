# Lançamento

No dia do lançamento, os três passos vão juntos:

1. Desligar o interruptor "Site em construção" na visão geral do painel.
2. Mudar `SITE_LAUNCHED` para `true` em `frontend/src/app/site-mode-content.ts`. Sem isso, uma falha de `/api/settings` volta a esconder o site.
3. Em `frontend/public/robots.txt`, apagar `Disallow: /` e os `Allow` de exceção, e voltar ao `Allow: /`.

## Ambiente local

O modo construção não se aplica a `npm run dev`. O Vite ignora `development_mode` e mostra o site completo, mesmo com a chave ligada no banco. Isso não quer dizer que o interruptor está quebrado.

Para trabalhar na página de aviso no Vite, abra qualquer rota com `?dev=1`. `?dev=0` força o site completo. O parâmetro só existe em desenvolvimento: a build substitui `import.meta.env.DEV` por `false`, então em produção — e em `wrangler pages dev dist`, que serve essa build — `?dev=0` não revela o site.
