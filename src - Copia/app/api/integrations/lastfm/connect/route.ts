import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createIntegrationState } from "@/lib/oauth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const key = process.env.LASTFM_API_KEY;
  if (!key) return NextResponse.json({ error: "Last.fm não configurado." }, { status: 503 });

  const state = await createIntegrationState("lastfm", user.id);
  const base = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  // Last.fm's web application flow does not use auth.getToken.
  // It sends the user directly to /api/auth and returns the token to our callback.
  const u = new URL("https://www.last.fm/api/auth/");
  u.searchParams.set("api_key", key);
  u.searchParams.set("cb", `${base}/api/integrations/lastfm/callback?state=${encodeURIComponent(state)}`);

  return NextResponse.redirect(u);
}
