import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getNowPlaying } from "@/lib/spotify";
export async function GET(){
  const me=await getCurrentUser(); if(!me)return NextResponse.json({error:"Não autenticado"},{status:401});
  const follows=await db.follow.findMany({where:{followerId:me.id},select:{followingId:true}}); const ids=follows.map(f=>f.followingId);
  if(!ids.length)return NextResponse.json({logs:[],nowPlaying:[]});
  const [logs, nowPlaying] = await Promise.all([
    db.listeningLog.findMany({where:{userId:{in:ids},user:{deletedAt:null}},include:{user:{select:{id:true,username:true,displayName:true,avatarUrl:true}},album:true,reactions:true,pollVotes:true},orderBy:{listenDate:"desc"},take:80}),
    Promise.all(ids.map(async id => { const np=await getNowPlaying(id); if(!np) return null; const u=await db.user.findUnique({where:{id},select:{id:true,username:true,displayName:true,avatarUrl:true}}); return u ? {...np,user:u} : null; }))
  ]);
  return NextResponse.json({logs,nowPlaying:nowPlaying.filter(Boolean)});
}
