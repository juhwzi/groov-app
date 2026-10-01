# Deploy do Groov

## 1. PostgreSQL
Crie um banco PostgreSQL em Supabase, Neon, Railway ou outro provedor compatível.

## 2. Vercel
Importe o repositório Git e deixe o framework como Next.js.

## 3. Variáveis
Configure:
- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SPOTIFY_CLIENT_ID` (opcional, recomendado)
- `SPOTIFY_CLIENT_SECRET` (opcional, recomendado)
- `LASTFM_API_KEY` (opcional)
- `GENIUS_ACCESS_TOKEN` (opcional)

## 4. Banco
No primeiro deploy, execute:
```bash
npx prisma generate
npx prisma db push
```
Para produção com histórico de migrações, prefira `prisma migrate deploy` depois de criar uma migration no ambiente de desenvolvimento.

## 5. Seed opcional
```bash
npm run db:seed
```

## 6. Build
```bash
npm run build
```


## OAuth e integrações

Adicione ao ambiente de produção:

- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`
- `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET`
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`
- `LASTFM_API_KEY` / `LASTFM_API_SECRET`

Cadastre nos provedores as URLs de callback exatamente como aparecem no README.

Depois da atualização do schema:

```bash
npx prisma generate
npx prisma db push
```


## Backend hardening (v5)

Production requires PostgreSQL and these security variables:
- `DATABASE_URL`
- `AUTH_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `IP_HASH_SALT`
- `CRON_SECRET`

Deploy schema changes with `npm run db:deploy` (never use `prisma db push` as the production migration workflow). OAuth access/refresh tokens are encrypted at rest; existing plaintext tokens remain readable for a transition period and are encrypted when refreshed/reconnected.

The project also includes persistent sessions, session revocation, audit logs, DB-backed rate limiting, notifications, activity/feed records, recommendation storage, soft account deletion, security headers, cleanup cron and additional indexes.
