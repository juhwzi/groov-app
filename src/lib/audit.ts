import { db } from "./db";
import { hashIp } from "./security";

export async function audit(action: string, opts: { userId?: string | null; entityType?: string; entityId?: string; metadata?: unknown; ip?: string | null } = {}) {
  try {
    await db.auditLog.create({ data: { action, userId: opts.userId || null, entityType: opts.entityType, entityId: opts.entityId, metadata: opts.metadata as any, ipHash: hashIp(opts.ip) } });
  } catch (e) {
    console.error("audit_log_failed", e);
  }
}
