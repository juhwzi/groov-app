-- Groov backend hardening: persistent sessions, audit trail, rate limiting,
-- notifications/activity/recommendations and account soft deletion.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "userAgent" TEXT,
  "ipHash" TEXT,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX IF NOT EXISTS "Session_userId_revokedAt_idx" ON "Session"("userId", "revokedAt");
CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt");
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "metadata" JSONB,
  "ipHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_userId_fkey";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "RateLimitBucket" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "RateLimitBucket_key_windowStart_key" ON "RateLimitBucket"("key", "windowStart");
CREATE INDEX IF NOT EXISTS "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "actorId" TEXT,
  "type" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "message" TEXT,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Notification_recipientId_readAt_createdAt_idx" ON "Notification"("recipientId", "readAt", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_actorId_createdAt_idx" ON "Notification"("actorId", "createdAt");
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_recipientId_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_actorId_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "Activity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Activity_userId_createdAt_idx" ON "Activity"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Activity_type_createdAt_idx" ON "Activity"("type", "createdAt");
ALTER TABLE "Activity" DROP CONSTRAINT IF EXISTS "Activity_userId_fkey";
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "Recommendation" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "albumId" TEXT,
  "trackId" TEXT,
  "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reason" TEXT,
  "source" TEXT NOT NULL DEFAULT 'system',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Recommendation_userId_score_idx" ON "Recommendation"("userId", "score");
CREATE INDEX IF NOT EXISTS "Recommendation_expiresAt_idx" ON "Recommendation"("expiresAt");
ALTER TABLE "Recommendation" DROP CONSTRAINT IF EXISTS "Recommendation_userId_fkey";
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Recommendation" DROP CONSTRAINT IF EXISTS "Recommendation_albumId_fkey";
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Recommendation" DROP CONSTRAINT IF EXISTS "Recommendation_trackId_fkey";
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "ListeningLog_userId_listenDate_idx" ON "ListeningLog"("userId", "listenDate");
CREATE INDEX IF NOT EXISTS "ListeningLog_albumId_listenDate_idx" ON "ListeningLog"("albumId", "listenDate");
CREATE INDEX IF NOT EXISTS "Follow_followingId_createdAt_idx" ON "Follow"("followingId", "createdAt");
CREATE INDEX IF NOT EXISTS "Follow_followerId_createdAt_idx" ON "Follow"("followerId", "createdAt");
CREATE INDEX IF NOT EXISTS "Comment_logId_createdAt_idx" ON "Comment"("logId", "createdAt");
CREATE INDEX IF NOT EXISTS "Reaction_logId_createdAt_idx" ON "Reaction"("logId", "createdAt");
CREATE INDEX IF NOT EXISTS "Playlist_ownerId_createdAt_idx" ON "Playlist"("ownerId", "createdAt");
CREATE INDEX IF NOT EXISTS "GroovDropEntry_userId_createdAt_idx" ON "GroovDropEntry"("userId", "createdAt");
