import { db } from "./db";

export async function recordActivity(userId: string, type: string, entityType?: string, entityId?: string, payload?: unknown) {
  return db.activity.create({ data: { userId, type, entityType, entityId, payload: payload as any } });
}

export async function notify(recipientId: string, type: string, opts: { actorId?: string; entityType?: string; entityId?: string; message?: string } = {}) {
  if (recipientId === opts.actorId) return null;
  return db.notification.create({ data: { recipientId, actorId: opts.actorId, type, entityType: opts.entityType, entityId: opts.entityId, message: opts.message } });
}
