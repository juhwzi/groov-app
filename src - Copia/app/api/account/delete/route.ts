import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getCurrentUser, clearSession, revokeAllSessions } from "@/lib/auth";
import { audit } from "@/lib/audit";
export async function DELETE(req: Request) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  try { const { confirmation, currentPassword } = await req.json();
    if (confirmation !== "EXCLUIR") return NextResponse.json({ error: "Digite EXCLUIR para confirmar." }, { status: 400 });
    if (user.passwordHash && !(await bcrypt.compare(currentPassword || "", user.passwordHash))) return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
    await db.$transaction(async tx => { await tx.user.update({ where: { id: user.id }, data: { deletedAt: new Date(), frozenAt: null, displayName: "Usuário excluído", bio: null, location: null, avatarUrl: null } }); await tx.session.updateMany({ where: { userId: user.id }, data: { revokedAt: new Date() } }); });
    await audit("account.deleted", { userId: user.id, ip: req.headers.get("x-forwarded-for") }); await revokeAllSessions(user.id); await clearSession(); return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Não foi possível excluir a conta." }, { status: 400 }); }
}
