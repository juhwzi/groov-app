import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(){
  const me=await getCurrentUser(); if(!me)return NextResponse.json({error:"Não autenticado"},{status:401});
  const mine=await db.listeningLog.findMany({where:{userId:me.id},select:{albumId:true},distinct:["albumId"]});
  const mineIds=new Set(mine.map(x=>x.albumId));
  if(!mineIds.size)return NextResponse.json({matches:[],message:"Registre algumas escutas para calcular seu Taste Match."});
  const users=await db.user.findMany({where:{id:{not:me.id},deletedAt:null},select:{id:true,username:true,displayName:true,avatarUrl:true,logs:{select:{albumId:true,album:{select:{title:true,artistName:true,coverUrl:true}}},distinct:["albumId"]}},take:100});
  const matches=users.map(u=>{const common=u.logs.filter(l=>mineIds.has(l.albumId));const other=new Set(u.logs.map(l=>l.albumId));const union=new Set([...mineIds,...other]);const score=Math.round((common.length/Math.max(1,union.size))*100);return {user:{id:u.id,username:u.username,displayName:u.displayName,avatarUrl:u.avatarUrl},score,common:common.slice(0,5).map(l=>({title:l.album.title,artistName:l.album.artistName,coverUrl:l.album.coverUrl}))}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,6);
  return NextResponse.json({matches});
}
