import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { createOAuthState, providerConfig, type OAuthProvider } from "@/lib/oauth";

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: raw } = await params;
  if (!["google", "discord", "twitch", "x"].includes(raw)) return NextResponse.json({ error: "Provider inválido" }, { status: 400 });
  const provider = raw as OAuthProvider;
  const config = providerConfig(provider);
  if (!config.clientId || !config.clientSecret) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(`Login com ${provider} ainda não está configurado.`)}`, req.url));
  const user = await getCurrentUser();
  const state = await createOAuthState(provider, user?.id);
  const url = new URL(config.authorize);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", state);
  if (provider === "x") {
    const verifier = crypto.randomBytes(32).toString("base64url");
    const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
    (await cookies()).set("groov_oauth_pkce_x", verifier, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
  }
  if (provider === "google") url.searchParams.set("access_type", "offline");
  return NextResponse.redirect(url);
}
