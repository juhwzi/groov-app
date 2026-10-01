# ∞ Groov

> **Sua música. Sua história.**

Groov é uma plataforma social de música para registrar escutas, avaliar álbuns, descobrir artistas, construir uma identidade musical e acompanhar pessoas com gostos parecidos.

## O que existe na baseline

- 🎧 Listening Log com nota, formato, review, Hot Take e reviews conjuntas
- ⭐ Top 5 com reordenação por drag & drop
- 🔥 A Obsessão do momento
- 💿 Vinyl Shelf
- 🔎 Busca de álbuns, artistas e pessoas + página de resultados
- 🧭 Descoberta baseada no histórico + Spotify/Last.fm quando configurados
- 👤 Perfis públicos `/u/:username`
- 🎤 Páginas de artistas e álbuns
- 👥 Feed social, seguir/deixar de seguir e notificações
- 🧬 Taste Match
- 🎲 Groov Drop
- 📝 Listas/playlists
- 🪪 Cartão mensal compartilhável com download PNG
- 🔐 Login por e-mail + Google + Discord + Twitch + X
- 🎵 Integrações Spotify e Last.fm
- 📱 Layout responsivo
- ♿ foco de teclado, skip link, reduced motion e labels de acessibilidade
- 🌐 SEO, Open Graph, sitemap, robots, manifest e 404 personalizada

## Stack

- Next.js 15
- React 19
- TypeScript
- Prisma
- PostgreSQL / Supabase
- Zod
- jose
- bcryptjs

## Desenvolvimento local

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run typecheck
npm run dev
```

Abra `http://127.0.0.1:3000`.

### Usuário de seed

```text
E-mail: julia@groov.local
Senha: groov123
```

Usuários demo adicionais:

```text
ana@groov.local / groov123
leo@groov.local / groov123
```

## Variáveis de ambiente

Nunca commite `.env`. Use `.env.example` como referência.

Principais grupos:

```env
DATABASE_URL="..."
AUTH_SECRET="..."
TOKEN_ENCRYPTION_KEY="..."
IP_HASH_SALT="..."
NEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"
```

OAuth social:

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
TWITCH_CLIENT_ID=""
TWITCH_CLIENT_SECRET=""
X_CLIENT_ID=""
X_CLIENT_SECRET=""
```

Catálogo musical:

```env
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
LASTFM_API_KEY=""
LASTFM_API_SECRET=""
```

## Redirect URIs locais

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

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
```

## Segurança

- Segredos ficam fora do Git.
- OAuth usa state assinado e cookie protegido.
- X usa PKCE.
- Tokens de integrações são criptografados antes do armazenamento.
- Endpoints autenticados verificam o usuário atual.
- Busca possui rate limiting.
- Headers básicos de segurança são enviados pelo middleware.
- Exclusão/congelamento e sessões fazem parte do backend.

## Release

Consulte `PRE-GITHUB-CHECKLIST.md` antes do primeiro push e configure os callbacks de produção somente depois de definir o domínio final.
