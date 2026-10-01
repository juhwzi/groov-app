import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getCurrentUser, revokeAllSessions, clearSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
export async function POST(req: Request) { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); try { const { confirmation, currentPassword } = await req.json(); if (confirmation !== "CONGELAR") return NextResponse.json({ error: "Digite CONGELAR para confirmar." }, { status: 400 }); if (user.passwordHash && !(await bcrypt.compare(currentPassword || "", user.passwordHash))) return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 }); await db.user.update({ where: { id: user.id }, data: { frozenAt: new Date() } }); await revokeAllSessions(user.id); await audit("account.frozen", { userId: user.id, ip: req.headers.get("x-forwarded-for") }); await clearSession(); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Não foi possível congelar a conta." }, { status: 400 }); } }
