import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const log = await db.listeningLog.findFirst({ where: { id, userId: user.id }, include: { album: true, dualWith: { select: { username: true } } } });
  if (!log) return NextResponse.json({ error: "Review não encontrada." }, { status: 404 });
  const account = await db.oAuthAccount.findFirst({ where: { userId: user.id, provider: "x" } });
  const base = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const reviewUrl = `${base}/review/${log.id}`;
  const text = `🎧 ${log.album.title} — ${log.album.artistName} | ${log.rating.toFixed(1)}/5\n\nMinha review no Groov${log.dualWith ? ` com @${log.dualWith.username}` : ""}.\n${reviewUrl}`;
  if (!account?.accessToken) return NextResponse.json({ connected: false, intentUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` });
  const response = await fetch("https://api.x.com/2/tweets", { method: "POST", headers: { Authorization: `Bearer ${decryptSecret(account.accessToken)}`, "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ error: "O X não aceitou a publicação.", detail, intentUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` }, { status: 502 });
  }
  const tweet = await response.json();
  return NextResponse.json({ connected: true, tweet });
}
