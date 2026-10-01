# Fixes V14 — Typecheck

- Added the missing Settings component used by Dashboard.
- Dashboard now imports Settings explicitly.
- TypeScript excludes a local duplicate `src - Copia` folder if it exists.
- `npm run typecheck` now regenerates Prisma Client before running `tsc`.
- Disabled Next typedRoutes until the first clean production build; this avoids stale `.next/types` route declarations blocking typecheck.

Recommended validation:

```bash
npm install
npm run typecheck
npm run build
```

If a local `src - Copia` folder exists, it can also be deleted; it is a duplicate backup and should not be committed.
