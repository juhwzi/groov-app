import { NextResponse } from "next/server";

export async function GET(req:Request){
  const q=new URL(req.url).searchParams.get("q")||"";
  const r=await fetch(`https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(q)}&fmt=json&limit=20`,{headers:{"User-Agent":"Groov/1.0 (groov.local)"}});
  if(!r.ok)return NextResponse.json({error:"MusicBrainz indisponível"},{status:r.status});
  return NextResponse.json(await r.json());
}
