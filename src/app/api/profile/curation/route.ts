import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const rawTop = Array.isArray(body.topAlbumIds) ? body.topAlbumIds : [];
    const topAlbumIds: string[] = [];
    for (const value of rawTop) {
      if (typeof value === "string" && value.length > 0 && !topAlbumIds.includes(value)) {
        topAlbumIds.push(value);
      }
      if (topAlbumIds.length === 5) break;
    }
    const obsessionAlbumId = typeof body.obsessionAlbumId === "string" && body.obsessionAlbumId ? body.obsessionAlbumId : null;

    const listenedRows = await db.listeningLog.findMany({
      where: { userId: user.id },
      select: { albumId: true },
      distinct: ["albumId"],
    });
    const allowedIds = new Set<string>();
    for (const row of listenedRows) {
      if (typeof row.albumId === "string" && row.albumId.length > 0) {
        allowedIds.add(row.albumId);
      }
    }

    if (topAlbumIds.some(id => !allowedIds.has(id))) {
      return NextResponse.json({ error: "O Top 5 só pode usar álbuns que você já registrou no diário." }, { status: 400 });
    }
    if (obsessionAlbumId && !allowedIds.has(obsessionAlbumId)) {
      return NextResponse.json({ error: "A obsessão do momento precisa ser um álbum registrado no diário." }, { status: 400 });
    }

    await db.$transaction(async tx => {
      await tx.topPick.deleteMany({ where: { userId: user.id } });
      if (topAlbumIds.length) {
        await tx.topPick.createMany({
          data: topAlbumIds.map((albumId, index) => ({ userId: user.id, albumId, position: index + 1 }))
        });
      }
      await tx.user.update({ where: { id: user.id }, data: { currentObsessionId: obsessionAlbumId } });
    });

    return NextResponse.json({ ok: true, topAlbumIds, obsessionAlbumId });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar sua curadoria." }, { status: 400 });
  }
}
