# Groov — pré-GitHub / release checklist

## Implementado nesta base
- Homepage pública + SEO/Open Graph/Twitter metadata
- Home → Login/Cadastro → retorno para Home
- CTA/navigation responsivos
- Scroll-to-top
- Loading skeletons e empty states
- Busca global + página de resultados
- Páginas públicas de usuário, artista e álbum
- Top 5 com reordenação por drag & drop
- A Obsessão
- Vinyl Shelf
- Taste Match
- Central de notificações
- Feed social + follows
- Cartão mensal com download PNG
- 404 personalizada
- Termos e privacidade
- Manifest e sitemap/robots
- Foco de teclado, skip link e reduced motion
- Seed com usuário principal + usuários demo
- Rate limiting existente na busca; endpoints autenticados continuam protegidos
- OAuth Google/Discord/Twitch/X com state e PKCE para X
- Spotify + Last.fm com estados de integração já existentes

## Comandos
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run typecheck
npm run build
npm run dev
```

## Segurança antes do primeiro push
- Nunca commitar `.env` ou tokens reais.
- Confirmar `.gitignore`.
- Preencher `.env.example` sem segredos.
- Configurar os redirect URIs dos provedores para o ambiente correto.
- Usar `NEXT_PUBLIC_APP_URL` consistente com o host aberto no navegador.
- Fazer rotação de qualquer segredo que tenha sido exposto.

## OAuth local
Google:
`http://127.0.0.1:3000/api/auth/oauth/google/callback`

Discord:
`http://127.0.0.1:3000/api/auth/oauth/discord/callback`

Twitch:
`http://127.0.0.1:3000/api/auth/oauth/twitch/callback`

X:
`http://127.0.0.1:3000/api/auth/oauth/x/callback`

Spotify:
`http://127.0.0.1:3000/api/integrations/spotify/callback`

Last.fm:
`http://127.0.0.1:3000/api/integrations/lastfm/callback`
