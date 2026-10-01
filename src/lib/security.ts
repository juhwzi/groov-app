import crypto from "node:crypto";

const encKey = process.env.TOKEN_ENCRYPTION_KEY || "";

export function hashToken(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function hashIp(ip?: string | null) {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || process.env.AUTH_SECRET || "dev-ip-salt";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function key() {
  if (!encKey) {
    if (process.env.NODE_ENV === "production") throw new Error("TOKEN_ENCRYPTION_KEY não configurada.");
    return crypto.createHash("sha256").update("groov-development-key").digest();
  }
  return crypto.createHash("sha256").update(encKey).digest();
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string) {
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) return value;
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64url")), decipher.final()]).toString("utf8");
}

export function getRequestIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
}
