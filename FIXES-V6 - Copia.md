# Groov Production — TypeScript fixes

This archive is based on `Groov-Production-v5-Fixed`.

Fixes included:
- Added the missing `encryptSecret` / `decryptSecret` imports in `src/lib/spotify.ts`.
- Refactored `src/app/api/account/password/route.ts` so Zod validation narrows
  `currentPassword` correctly before calling `bcrypt.compare`.
- Added the missing `Track` relation to `GroovDropEntry`, matching the query in
  `src/app/api/drops/route.ts`.
- Added the corresponding Prisma migration
  `20260930220000_add_groov_drop_entry_track_relation`.
- Kept the already-applied Supabase migration intact.

After replacing the project files, run:

```bash
npm install
npx prisma generate
npm run typecheck
npm run build
```

If typecheck/build pass, apply the new database relation with:

```bash
npx prisma migrate deploy
```

Do not run `prisma migrate reset`.
