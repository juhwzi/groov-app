import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, revokeAllSessions, createSession } from "@/lib/auth";
import { passwordChangeSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";

const newPasswordSchema = z
  .object({
    newPassword: z.string().min(8).max(100).regex(/[A-Za-z]/).regex(/[0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "As novas senhas não coincidem.",
  });

export async function PATCH(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const raw = await req.json();

    if (user.passwordHash) {
      const data = passwordChangeSchema.parse(raw);

      if (!(await bcrypt.compare(data.currentPassword, user.passwordHash))) {
        return NextResponse.json(
          { error: "Senha atual incorreta." },
          { status: 401 }
        );
      }

      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(data.newPassword, 12) },
      });
    } else {
      const data = newPasswordSchema.parse(raw);

      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(data.newPassword, 12) },
      });
    }

    await revokeAllSessions(user.id);
    await createSession(user.id, {
      userAgent: req.headers.get("user-agent"),
    });
    await audit("account.password_changed", { userId: user.id });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: user.passwordHash
          ? "Confira as senhas informadas."
          : "Defina uma senha válida com confirmação.",
      },
      { status: 400 }
    );
  }
}
