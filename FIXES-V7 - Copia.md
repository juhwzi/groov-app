# Groov Production v7 — Prisma relation fix

Fixed the Prisma schema relation introduced for GroovDropEntry:
- Removed the invalid `Album.groovDropEntries` relation.
- Added the required opposite relation `Track.groovDropEntries`.
- Kept the existing GroovDropEntry.track relation and migration.

Run:
```bash
npm install
npx prisma generate
npm run typecheck
```
Do not reset the database.
