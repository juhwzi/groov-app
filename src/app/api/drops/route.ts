import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function weekKey(){const d=new Date(); const one=new Date(d.getFullYear(),0,1); const week=Math.ceil((((d.getTime()-one.getTime())/86400000)+one.getDay()+1)/7); return `${d.getFullYear()}-${week}`;}

export async function GET(){
  const user=await getCurrentUser(); if(!user)return NextResponse.json({error:"Não autenticado"},{status:401});
  const drop=await db.groovDrop.findUnique({where:{weekKey:weekKey()},include:{entries:{include:{track:{include:{album:true}},user:{select:{id:true,displayName:true,username:true}}}}}});
  const tracks=await db.track.findMany({include:{album:true},orderBy:{title:"asc"},take:100}); return NextResponse.json({drop,tracks});
}

export async function POST(req:Request){
  const user=await getCurrentUser(); if(!user)return NextResponse.json({error:"Não autenticado"},{status:401});
  const {trackId}=await req.json(); if(!trackId)return NextResponse.json({error:"trackId obrigatório"},{status:400});
  const key=weekKey();
  const drop=await db.groovDrop.upsert({where:{weekKey:key},update:{},create:{weekKey:key,closesAt:new Date(Date.now()+7*86400000)}});
  const entry=await db.groovDropEntry.upsert({where:{dropId_userId:{dropId:drop.id,userId:user.id}},update:{trackId},create:{dropId:drop.id,userId:user.id,trackId}});
  return NextResponse.json({entry});
}
