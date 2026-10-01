import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, getCurrentUser } from "@/lib/auth";
import { providerConfig, verifyOAuthState, type OAuthProvider } from "@/lib/oauth";
import { cookies } from "next/headers";
import { encryptSecret } from "@/lib/security";
import { audit } from "@/lib/audit";

function safeUsername(seed: string) {
  const cleaned = seed.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/^_+|_+$/g, "").slice(0, 18) || "groover";
  return cleaned;
}

async function uniqueUsername(base: string) {
  let value = base; let i = 1;
  while (await db.user.findUnique({ where: { username: value } })) { value = `${base}_${i++}`.slice(0, 24); }
  return value;
}

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: raw } = await params;
  if (!["google", "discord", "twitch", "x"].includes(raw)) return NextResponse.redirect(new URL("/login?error=provider", req.url));
  const provider = raw as OAuthProvider;
  try {
    const url = new URL(req.url); const code = url.searchParams.get("code"); const state = url.searchParams.get("state");
    if (!code || !state) throw new Error("Código OAuth ausente.");
    const config = providerConfig(provider);
    const stateUserId = await verifyOAuthState(provider, state);
    const tokenResponse = await fetch(config.token, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: config.clientId!, client_secret: config.clientSecret!, code, grant_type: "authorization_code", redirect_uri: config.redirectUri, ...(provider === "x" ? { code_verifier: (await cookies()).get("groov_oauth_pkce_x")?.value || "" } : {}) }) });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok && provider !== "x") throw new Error("Falha ao trocar código OAuth.");
    let providerId = "", email = "", displayName = "", avatarUrl: string | null = null, handle = "";
    if (provider === "x") {
      const verifier = (await cookies()).get("groov_oauth_pkce_x")?.value;
      if (!verifier) throw new Error("Verificador OAuth do X ausente.");
      // X OAuth 2 uses PKCE; retry the token exchange with the verifier when the first exchange fails.
      if (!tokenResponse.ok) {
        const retry = await fetch(config.token, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: config.clientId!, client_secret: config.clientSecret!, code, grant_type: "authorization_code", redirect_uri: config.redirectUri, code_verifier: verifier }) });
        const retryTokens = await retry.json();
        if (!retry.ok) throw new Error("Falha ao conectar o X.");
        Object.assign(tokens, retryTokens);
      }
      const r = await fetch("https://api.x.com/2/users/me?user.fields=profile_image_url,name,username", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
      const p = (await r.json()).data;
      if (!p) throw new Error("Não foi possível obter o perfil do X.");
      providerId = p.id; email = `${p.username}@x.groov.local`; displayName = p.name || p.username; handle = p.username; avatarUrl = p.profile_image_url || null;
    } else if (provider === "google") {
      const r = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } }); const p = await r.json();
      providerId = p.sub; if(!p.email||p.email_verified===false) throw new Error("A conta Google não forneceu um e-mail verificado."); email = p.email; displayName = p.name || p.email.split("@")[0]; avatarUrl = p.picture || null; handle = p.email.split("@")[0];
    } else if (provider === "discord") {
      const r = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${tokens.access_token}` } }); const p = await r.json();
      providerId = p.id; if(p.email && p.verified===false) throw new Error("O Discord não forneceu um e-mail verificado."); email = p.email || `${p.id}@discord.groov.local`; displayName = p.global_name || p.username; handle = p.username; avatarUrl = p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png?size=256` : null;
    } else {
      const r = await fetch("https://api.twitch.tv/helix/users", { headers: { Authorization: `Bearer ${tokens.access_token}`, "Client-Id": config.clientId! } }); const p = (await r.json()).data?.[0];
      if (!p) throw new Error("Não foi possível obter o perfil da Twitch."); providerId = p.id; email = p.email || `${p.id}@twitch.groov.local`; displayName = p.display_name || p.login; handle = p.login; avatarUrl = p.profile_image_url || null;
    }
    const existingAccount = await db.oAuthAccount.findUnique({ where: { provider_providerAccountId: { provider, providerAccountId: providerId } } });
    const current = stateUserId ? await getCurrentUser() : null;
    if (existingAccount) {
      if (current && existingAccount.userId !== current.id) throw new Error("Essa conta já está conectada a outro usuário do Groov.");
      await db.oAuthAccount.update({ where: { id: existingAccount.id }, data: { accessToken: encryptSecret(tokens.access_token), refreshToken: tokens.refresh_token ? encryptSecret(tokens.refresh_token) : existingAccount.refreshToken, expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : existingAccount.expiresAt } });
      await createSession(existingAccount.userId, { userAgent: req.headers.get("user-agent") }); await audit("oauth.connected", { userId: existingAccount.userId, metadata: { provider } }); return NextResponse.redirect(new URL("/", req.url));
    }
    if (stateUserId && current) {
      await db.oAuthAccount.create({ data: { userId: current.id, provider, providerAccountId: providerId, accessToken: encryptSecret(tokens.access_token), refreshToken: tokens.refresh_token ? encryptSecret(tokens.refresh_token) : null, expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null } });
      if (!current.avatarUrl && avatarUrl) await db.user.update({ where: { id: current.id }, data: { avatarUrl } });
      await audit("oauth.connected", { userId: current.id, metadata: { provider } });
      return NextResponse.redirect(new URL("/?connected=" + provider, req.url));
    }
    let user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      const username = await uniqueUsername(safeUsername(handle || email.split("@")[0]));
      user = await db.user.create({ data: { email: email.toLowerCase(), username, displayName, avatarUrl, passwordHash: null } });
    }
    await db.oAuthAccount.create({ data: { userId: user.id, provider, providerAccountId: providerId, accessToken: encryptSecret(tokens.access_token), refreshToken: tokens.refresh_token ? encryptSecret(tokens.refresh_token) : null, expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null } });
    await createSession(user.id, { userAgent: req.headers.get("user-agent") });
    await audit("oauth.login", { userId: user.id, metadata: { provider } });
    return NextResponse.redirect(new URL("/", req.url));
  } catch (e) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(e instanceof Error ? e.message : "oauth")}`, req.url));
  }
}
