import { NextResponse } from "next/server";

export async function GET(req:Request){
  const key=process.env.LASTFM_API_KEY; const user=new URL(req.url).searchParams.get("user");
  if(!key||!user)return NextResponse.json({error:"Last.fm não configurado"},{status:503});
  const url=`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${key}&format=json&limit=20`;
  const r=await fetch(url); const j=await r.json(); return NextResponse.json(j);
}
