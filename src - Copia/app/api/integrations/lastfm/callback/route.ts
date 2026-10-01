import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { verifyIntegrationState } from "@/lib/oauth";
import { encryptSecret } from "@/lib/security";
import { audit } from "@/lib/audit";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const token = url.searchParams.get("token");

  try {
    if (!state || !token) throw new Error("Token de autorização do Last.fm ausente.");

    const userId = await verifyIntegrationState("lastfm", state);
    const key = process.env.LASTFM_API_KEY;
    const secret = process.env.LASTFM_API_SECRET;
    if (!key || !secret) throw new Error("Credenciais do Last.fm não configuradas.");

    // Last.fm requires alphabetically ordered parameters, excluding format/callback.
    const signatureBase = `api_key${key}methodauth.getSessiontoken${token}${secret}`;
    const apiSig = crypto.createHash("md5").update(signatureBase, "utf8").digest("hex");

    const params = new URLSearchParams({
      method: "auth.getSession",
      api_key: key,
      token,
      api_sig: apiSig,
      format: "json",
    });

    const r = await fetch(`https://ws.audioscrobbler.com/2.0/?${params.toString()}`, {
      cache: "no-store",
    });
    const j = await r.json();

    if (!r.ok || !j.session?.name || !j.session?.key) {
      const message = j?.message || "Não foi possível concluir a conexão Last.fm.";
      throw new Error(message);
    }

    await db.oAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: "lastfm",
          providerAccountId: j.session.name,
        },
      },
      update: {
        userId,
        accessToken: encryptSecret(j.session.key),
        metadata: j.session,
      },
      create: {
        userId,
        provider: "lastfm",
        providerAccountId: j.session.name,
        accessToken: encryptSecret(j.session.key),
        metadata: j.session,
      },
    });

    await audit("integration.connected", {
      userId,
      metadata: { provider: "lastfm" },
    });

    return NextResponse.redirect(new URL("/?connected=lastfm", req.url));
  } catch (e) {
    const message = e instanceof Error ? e.message : "lastfm";
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, req.url));
  }
}
