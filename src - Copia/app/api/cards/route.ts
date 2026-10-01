import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const url = new URL(req.url);
  const now = new Date();
  const requestedYear = Number(url.searchParams.get("year"));
  const requestedMonth = Number(url.searchParams.get("month"));
  const year = Number.isInteger(requestedYear) && requestedYear >= 2000 ? requestedYear : now.getFullYear();
  const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth : now.getMonth() + 1;

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const logs = await db.listeningLog.findMany({
    where: { userId: user.id, listenDate: { gte: start, lt: end } },
    include: { album: true },
    orderBy: [{ rating: "desc" }, { listenDate: "desc" }]
  });

  const grouped = new Map<string, { title: string; artistName: string; coverUrl: string | null; ratingSum: number; count: number }>();
  for (const log of logs) {
    const current = grouped.get(log.albumId);
    if (current) {
      current.ratingSum += log.rating;
      current.count += 1;
    } else {
      grouped.set(log.albumId, {
        title: log.album.title,
        artistName: log.album.artistName,
        coverUrl: log.album.coverUrl,
        ratingSum: log.rating,
        count: 1
      });
    }
  }

  const top = [...grouped.values()]
    .map(item => ({ ...item, rating: item.ratingSum / item.count }))
    .sort((a, b) => b.rating - a.rating || b.count - a.count)
    .slice(0, 5);

  const avg = logs.length ? logs.reduce((sum, log) => sum + log.rating, 0) / logs.length : 0;
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(start);

  return NextResponse.json({
    username: user.username,
    displayName: user.displayName,
    monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
    year,
    month,
    total: logs.length,
    avg,
    top
  });
}
