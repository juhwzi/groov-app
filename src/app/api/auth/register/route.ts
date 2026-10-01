import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await rateLimit(`register:${ip}`, 5, 60 * 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Muitas tentativas de cadastro. Tente novamente mais tarde." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  try {
    const data = registerSchema.parse(await req.json());
    const email = data.email.toLowerCase(); const username = data.username.toLowerCase();
    const exists = await db.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (exists) return NextResponse.json({ error: exists.email === email ? "Esse e-mail já está cadastrado." : "Esse nome de usuário já está em uso." }, { status: 409 });
    const user = await db.user.create({ data: { email, username, displayName: data.displayName, passwordHash: await bcrypt.hash(data.password, 12) } });
    await createSession(user.id, { userAgent: req.headers.get("user-agent"), ip });
    await audit("auth.register", { userId: user.id, ip });
    return NextResponse.json({ user: { id: user.id, username: user.username, displayName: user.displayName } }, { status: 201 });
  } catch { return NextResponse.json({ error: "Confira os dados informados." }, { status: 400 }); }
}
