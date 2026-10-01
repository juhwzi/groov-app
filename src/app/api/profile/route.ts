import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const [profile,logs,top,followers,following,links,connections]=await Promise.all([
    db.user.findFirst({where:{id:user.id,deletedAt:null},include:{currentObsession:true}}),
    db.listeningLog.findMany({where:{userId:user.id},include:{album:true},orderBy:{listenDate:"desc"}}),
    db.topPick.findMany({where:{userId:user.id},include:{album:true},orderBy:{position:"asc"}}),
    db.follow.count({where:{followingId:user.id}}), db.follow.count({where:{followerId:user.id}}),
    db.socialLink.findMany({where:{userId:user.id},orderBy:{position:"asc"}}),
    db.oAuthAccount.findMany({where:{userId:user.id},select:{provider:true,metadata:true,providerAccountId:true}})
  ]);
  const avg=logs.length?logs.reduce((s,x)=>s+x.rating,0)/logs.length:0; const formatCounts=logs.reduce((acc:any,l:any)=>{acc[l.format]=(acc[l.format]||0)+1;return acc},{}); const uniqueArtists=new Set(logs.map((l:any)=>l.album.artistName)); const relistens=logs.filter((l:any)=>l.isRelisten).length; const topArtist=[...logs.reduce((m:any,l:any)=>{m.set(l.album.artistName,(m.get(l.album.artistName)||0)+1);return m},new Map<string,number>()).entries()].sort((a:any,b:any)=>b[1]-a[1])[0]||null;
  const seenAlbums = new Map<string, any>();
  for (const log of logs) {
    if (!seenAlbums.has(log.albumId)) seenAlbums.set(log.albumId, { ...log.album, lastListenDate: log.listenDate, vinyl: log.format === "VINYL" });
    else if (log.format === "VINYL") seenAlbums.get(log.albumId).vinyl = true;
  }
  const vinylShelf = [...seenAlbums.values()].filter((a:any)=>a.vinyl).slice(0, 24);
  const curationAlbums = [...seenAlbums.values()].slice(0, 50);
  const calendar:Record<string,number>={}; for(const log of logs){const key=new Date(log.listenDate).toISOString().slice(0,10);calendar[key]=(calendar[key]||0)+1;}
  const connected = new Set(connections.map(c=>c.provider));
  const spotifyAccount=connections.find(c=>c.provider==="spotify");
  const lastfmAccount=connections.find(c=>c.provider==="lastfm");
  const spotifyUrl=(spotifyAccount?.metadata as any)?.external_urls?.spotify || (spotifyAccount?`https://open.spotify.com/user/${spotifyAccount.providerAccountId}`:"");
  const lastfmName=lastfmAccount?.providerAccountId || user.username;
  const defaultLinks=[
    connected.has("spotify")?{platform:"spotify",label:"Spotify",url:spotifyUrl,position:99}:null,
    connected.has("lastfm")?{platform:"lastfm",label:"Last.fm",url:`https://www.last.fm/user/${encodeURIComponent(lastfmName)}`,position:100}:null
  ].filter(Boolean);
  return NextResponse.json({profile,logs,top,curationAlbums,vinylShelf,links:[...links,...defaultLinks],connections:[...connected],hasPassword:Boolean(user.passwordHash),stats:{avg,followers,following,total:logs.length,uniqueAlbums:seenAlbums.size,uniqueArtists:uniqueArtists.size,relistens,formatCounts,topArtist:topArtist?{name:topArtist[0],count:topArtist[1]}:null},calendar});
}

export async function PATCH(req:Request){
  const user=await getCurrentUser(); if(!user)return NextResponse.json({error:"Não autenticado"},{status:401});
  try{
    const data=profileSchema.omit({username:true}).parse(await req.json());
    const updated=await db.user.update({where:{id:user.id},data:{displayName:data.displayName,avatarUrl:data.avatarUrl||null,bio:data.bio||null,location:data.location||null}});
    await db.$transaction(async tx => { await tx.socialLink.deleteMany({where:{userId:user.id}}); if(data.socialLinks.length) await tx.socialLink.createMany({data:data.socialLinks.map((x,i)=>({userId:user.id,platform:x.platform,label:x.label,url:x.url,position:i}))}); });
    return NextResponse.json({profile:{id:updated.id,username:updated.username,displayName:updated.displayName,email:updated.email,bio:updated.bio,location:updated.location,avatarUrl:updated.avatarUrl}});
  }catch{return NextResponse.json({error:"Dados inválidos"},{status:400});}
}
