import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const authSecret = process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-secret-change-me");
if (!authSecret) throw new Error("AUTH_SECRET não configurado.");
const secret = new TextEncoder().encode(authSecret);

export type OAuthProvider = "google" | "discord" | "twitch" | "x";
export type IntegrationProvider = "spotify" | "lastfm";

export function providerConfig(provider: OAuthProvider) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${base}/api/auth/oauth/${provider}/callback`;
  if (provider === "x") return {
    authorize: "https://twitter.com/i/oauth2/authorize",
    token: "https://api.x.com/2/oauth2/token",
    clientId: process.env.X_CLIENT_ID,
    clientSecret: process.env.X_CLIENT_SECRET,
    redirectUri,
    scope: "tweet.read users.read tweet.write offline.access"
  };
  if (provider === "google") return {
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
    scope: "openid email profile"
  };
  if (provider === "discord") return {
    authorize: "https://discord.com/oauth2/authorize",
    token: "https://discord.com/api/oauth2/token",
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri,
    scope: "identify email"
  };
  return {
    authorize: "https://id.twitch.tv/oauth2/authorize",
    token: "https://id.twitch.tv/oauth2/token",
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    redirectUri,
    scope: "user:read:email"
  };
}

export async function createOAuthState(provider: OAuthProvider, userId?: string) {
  const state = await new SignJWT({ provider, userId: userId || null }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10m").sign(secret);
  const store = await cookies();
  store.set(`groov_oauth_${provider}`, state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  return state;
}

export async function verifyOAuthState(provider: OAuthProvider, state: string) {
  const store = await cookies();
  const cookie = store.get(`groov_oauth_${provider}`)?.value;
  if (!cookie || cookie !== state) throw new Error("OAuth state inválido.");
  const { payload } = await jwtVerify(state, secret);
  if (payload.provider !== provider) throw new Error("OAuth provider inválido.");
  store.delete(`groov_oauth_${provider}`);
  return typeof payload.userId === "string" ? payload.userId : undefined;
}

export async function createIntegrationState(provider: IntegrationProvider, userId: string) {
  const state = await new SignJWT({ provider, userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10m").sign(secret);
  const store = await cookies();
  store.set(`groov_integration_${provider}`, state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  return state;
}

export async function verifyIntegrationState(provider: IntegrationProvider, state: string) {
  const store = await cookies(); const cookie = store.get(`groov_integration_${provider}`)?.value;
  if (!cookie || cookie !== state) throw new Error("Estado de integração inválido.");
  const { payload } = await jwtVerify(state, secret);
  if (payload.provider !== provider || typeof payload.userId !== "string") throw new Error("Integração inválida.");
  store.delete(`groov_integration_${provider}`); return payload.userId;
}
