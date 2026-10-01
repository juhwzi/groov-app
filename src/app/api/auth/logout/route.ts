import { NextResponse } from "next/server";
import { clearSession, getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
export async function POST(req: Request) { const user = await getCurrentUser(); await clearSession(); if (user) await audit("auth.logout", { userId: user.id, ip: req.headers.get("x-forwarded-for") }); return NextResponse.json({ ok: true }); }
