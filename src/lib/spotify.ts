import { db } from "@/lib/db";
import { encryptSecret, decryptSecret } from "@/lib/security";

export async function getSpotifyNowPlaying(userId: string) {
  const account = await db.oAuthAccount.findFirst({ where: { userId, provider: "spotify" } });
  if (!account?.accessToken) return null;
  let accessToken = decryptSecret(account.accessToken);
  let refreshToken = account.refreshToken ? decryptSecret(account.refreshToken) : null;
  if (account.expiresAt && account.expiresAt.getTime() < Date.now() + 60_000 && refreshToken) {
    const token = await fetch("https://accounts.spotify.com/api/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}` }, body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken! }) });
    if (token.ok) { const t = await token.json(); accessToken = t.access_token; await db.oAuthAccount.update({ where: { id: account.id }, data: { accessToken: encryptSecret(accessToken), expiresAt: t.expires_in ? new Date(Date.now()+t.expires_in*1000) : account.expiresAt, refreshToken: t.refresh_token ? encryptSecret(t.refresh_token) : account.refreshToken } }); }
  }
  const r = await fetch("https://api.spotify.com/v1/me/player", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
  if (r.status === 204 || !r.ok) return null;
  const p = await r.json();
  if (!p?.is_playing || !p.item || p.item.type !== "track") return null;
  const item = p.item;
  return { title:item.name, artistName:item.artists?.map((a:any)=>a.name).join(", ") || "Artista", albumName:item.album?.name || null, coverUrl:item.album?.images?.[0]?.url || null, externalUrl:item.external_urls?.spotify || null, progressMs:p.progress_ms||0, durationMs:item.duration_ms||0, source:"spotify", startedAt:new Date(Date.now()-(p.progress_ms||0)).toISOString() };
}


export async function getLastfmNowPlaying(userId: string) {
  if (!process.env.LASTFM_API_KEY) return null;
  const account = await db.oAuthAccount.findFirst({ where: { userId, provider: "lastfm" } });
  if (!account?.providerAccountId) return null;
  const u = new URL("https://ws.audioscrobbler.com/2.0/");
  u.searchParams.set("method", "user.getrecenttracks"); u.searchParams.set("user", account.providerAccountId); u.searchParams.set("api_key", process.env.LASTFM_API_KEY); u.searchParams.set("limit", "1"); u.searchParams.set("format", "json");
  const r = await fetch(u, { cache: "no-store" }); if (!r.ok) return null;
  const j = await r.json(); const t = j?.recenttracks?.track?.[0];
  if (!t?.["@attr"]?.nowplaying || !t?.name) return null;
  return { title:t.name, artistName:t.artist?.["#text"] || "Artista", albumName:t.album?.["#text"] || null, coverUrl:t.image?.find((x:any)=>x.size==="extralarge")?.["#text"] || t.image?.at?.(-1)?.["#text"] || null, externalUrl:t.url || null, source:"lastfm", startedAt:new Date().toISOString() };
}

export async function getNowPlaying(userId: string) { return (await getSpotifyNowPlaying(userId)) || (await getLastfmNowPlaying(userId)); }
