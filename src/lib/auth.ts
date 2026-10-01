import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { hashToken } from "./security";

const COOKIE = "groov_session";
const SESSION_DAYS = 30;

function token() { return crypto.randomBytes(32).toString("base64url"); }

export async function createSession(userId: string, meta: { userAgent?: string | null; ip?: string | null } = {}) {
  const raw = token();
  await db.session.create({ data: { userId, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + SESSION_DAYS * 86400000), userAgent: meta.userAgent?.slice(0, 500) } });
  const store = await cookies();
  store.set(COOKIE, raw, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_DAYS * 86400 });
}

export async function getCurrentSession() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const session = await db.session.findUnique({ where: { tokenHash: hashToken(raw) }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.deletedAt || session.user.frozenAt) return null;
  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60_000) {
    await db.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
  }
  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}

export async function clearSession() {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (raw) await db.session.updateMany({ where: { tokenHash: hashToken(raw), revokedAt: null }, data: { revokedAt: new Date() } });
  store.delete(COOKIE);
}

export async function revokeAllSessions(userId: string) {
  await db.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}
