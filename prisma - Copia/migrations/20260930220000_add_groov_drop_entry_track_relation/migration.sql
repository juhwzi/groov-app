-- Add the missing Track relation used by GroovDropEntry.
-- Existing entries (if any) must reference valid Track rows.
ALTER TABLE "GroovDropEntry" DROP CONSTRAINT IF EXISTS "GroovDropEntry_trackId_fkey";
ALTER TABLE "GroovDropEntry"
  ADD CONSTRAINT "GroovDropEntry_trackId_fkey"
  FOREIGN KEY ("trackId") REFERENCES "Track"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "GroovDropEntry_trackId_idx"
  ON "GroovDropEntry"("trackId");
