import { db } from "./db";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const start = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  const expiresAt = new Date(start.getTime() + windowMs);
  const bucket = await db.rateLimitBucket.upsert({
    where: { key_windowStart: { key, windowStart: start } },
    update: { count: { increment: 1 } },
    create: { key, windowStart: start, expiresAt, count: 1 },
  });
  if (bucket.count > limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)) };
  return { allowed: true, retryAfter: 0 };
}
