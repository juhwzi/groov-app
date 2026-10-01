import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

async function spotifyToken() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`
    },
    body: "grant_type=client_credentials",
    cache: "no-store"
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.access_token as string | undefined;
}

async function spotifyArtists(queries: string[]) {
  const token = await spotifyToken();
  if (!token) return [];
  const found = new Map<string, any>();
  for (const query of queries.slice(0, 5)) {
    const r = await fetch(`https://api.spotify.com/v1/search?type=artist&limit=8&q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!r.ok) continue;
    const j = await r.json();
    for (const a of j.artists?.items || []) {
      if (!a?.id || found.has(a.id)) continue;
      found.set(a.id, {
        id: `spotify:${a.id}`,
        name: a.name,
        imageUrl: a.images?.[0]?.url || null,
        genres: a.genres || [],
        externalUrl: a.external_urls?.spotify || null,
        source: "spotify"
      });
    }
  }
  return [...found.values()];
}

async function lastfmSimilar(names: string[]) {
  const key = process.env.LASTFM_API_KEY;
  if (!key) return [];
  const found = new Map<string, any>();
  for (const name of names.slice(0, 3)) {
    const u = new URL("https://ws.audioscrobbler.com/2.0/");
    u.searchParams.set("method", "artist.getSimilar");
    u.searchParams.set("artist", name);
    u.searchParams.set("api_key", key);
    u.searchParams.set("limit", "8");
    u.searchParams.set("format", "json");
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) continue;
    const j = await r.json();
    for (const a of j?.similarartists?.artist || []) {
      if (!a?.name || found.has(a.name.toLowerCase())) continue;
      found.set(a.name.toLowerCase(), {
        id: `lastfm:${a.mbid || a.name}`,
        name: a.name,
        imageUrl: a.image?.find((x: any) => x.size === "extralarge")?.["#text"] || a.image?.at?.(-1)?.["#text"] || null,
        genres: [],
        externalUrl: a.url || null,
        source: "lastfm"
      });
    }
  }
  return [...found.values()];
}

export async function GET() {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const logs = await db.listeningLog.findMany({
    where: { userId: u.id },
    include: { album: { include: { artist: true } } },
    orderBy: { listenDate: "desc" },
    take: 100
  });

  const counts = new Map<string, number>();
  for (const l of logs) {
    const a = l.album.artist?.name || l.album.artistName;
    counts.set(a, (counts.get(a) || 0) + 1);
  }

  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
  const listened = new Set([...counts.keys()].map(x => x.toLowerCase()));
  let artists = await db.artist.findMany({
    where: { name: { notIn: [...counts.keys()] } },
    include: { albums: { take: 1, orderBy: { createdAt: "desc" } } },
    take: 30
  });
  artists = artists.sort((a, b) => {
    const sa = a.genres.some(g => top.some(t => t.toLowerCase().includes(g.toLowerCase()))) ? 1 : 0;
    const sb = b.genres.some(g => top.some(t => t.toLowerCase().includes(g.toLowerCase()))) ? 1 : 0;
    return sb - sa;
  });

  const localRecommendations = artists.filter(a => !listened.has(a.name.toLowerCase())).map(a => ({
    id: a.id,
    name: a.name,
    imageUrl: a.imageUrl || a.albums[0]?.coverUrl || null,
    genres: a.genres,
    externalUrl: null,
    source: "groov"
  }));

  const genreSeeds = [...new Set(logs.flatMap(l => l.album.artist?.genres || []))].slice(0, 4);
  const spotifyQueries = top.length ? top.map(x => `artist ${x}`).concat(genreSeeds.map(x => `genre ${x}`)) : ["new music", "indie", "pop", "rock", "alternative"];
  const external = await spotifyArtists(spotifyQueries);
  const externalLastfm = top.length ? await lastfmSimilar(top) : [];
  const recommendations = [...localRecommendations, ...external, ...externalLastfm]
    .filter((a, i, arr) => !listened.has(a.name.toLowerCase()) && arr.findIndex(x => x.name.toLowerCase() === a.name.toLowerCase()) === i)
    .slice(0, 6);

  const now = new Date();
  const first = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((now.getTime() - first.getTime()) / 86400000 + first.getUTCDay() + 1) / 7);
  return NextResponse.json({
    weekKey: `${now.getUTCFullYear()}-W${String(week).padStart(2, "0")}`,
    basedOn: top,
    recommendations,
    fallback: recommendations.length === 0 ? "Registre algumas escutas ou configure uma integração de catálogo para receber recomendações." : null
  });
}
