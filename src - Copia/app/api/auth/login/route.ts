import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { getRequestIp } from "@/lib/security";

export async function POST(req: Request) {
  const ip = getRequestIp(req);
  const rl = await rateLimit(`login:${ip || "unknown"}`, 10, 15 * 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  try {
    const data = loginSchema.parse(await req.json());
    const user = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user?.passwordHash || !(await bcrypt.compare(data.password, user.passwordHash))) {
      await audit("auth.login_failed", { ip });
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }
    if (user.frozenAt) return NextResponse.json({ error: "Esta conta está congelada.", frozen: true }, { status: 423 });
    if (user.deletedAt) return NextResponse.json({ error: "Esta conta não está disponível." }, { status: 403 });
    await createSession(user.id, { userAgent: req.headers.get("user-agent"), ip });
    await audit("auth.login", { userId: user.id, ip });
    return NextResponse.json({ user: { id: user.id, username: user.username, displayName: user.displayName } });
  } catch {
    return NextResponse.json({ error: "Confira o e-mail e a senha." }, { status: 400 });
  }
}
