import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}) {
  const user=await getCurrentUser(); if(!user)return NextResponse.json({error:"Não autenticado"},{status:401});
  const {id}=await params; const {choice}=await req.json();
  if(!["FACT","CRAZY"].includes(choice))return NextResponse.json({error:"Opção inválida"},{status:400});
  await db.hotTakeVote.upsert({where:{logId_userId:{logId:id,userId:user.id}},update:{choice},create:{logId:id,userId:user.id,choice}});
  return NextResponse.json({ok:true});
}
