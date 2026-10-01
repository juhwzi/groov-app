import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const username = new URL(req.url).searchParams.get("username")?.trim().replace(/^@/, "").toLowerCase();
  if (!username) return NextResponse.json({ error: "Username obrigatório" }, { status: 400 });

  const u = await db.user.findFirst({
    where: { username, deletedAt: null },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      location: true,
      avatarUrl: true,
      createdAt: true,
      currentObsession: { select: { id: true, title: true, artistName: true, coverUrl: true } },
      topPicks: { include: { album: true }, orderBy: { position: "asc" } },
      logs: { include: { album: true }, orderBy: { listenDate: "desc" }, take: 12 },
      _count: { select: { followers: true, following: true, logs: true } }
    }
  });
  if (!u) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const seen = new Map<string, any>();
  for (const l of u.logs) {
    if (!seen.has(l.albumId)) seen.set(l.albumId, { ...l.album, vinyl: l.format === "VINYL" });
    else if (l.format === "VINYL") seen.get(l.albumId).vinyl = true;
  }
  return NextResponse.json({ ...u, vinylShelf: [...seen.values()].filter(a => a.vinyl).slice(0, 24) });
}
