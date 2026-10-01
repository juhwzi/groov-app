import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
export async function DELETE(req:Request,{params}:{params:Promise<{provider:string}>}){const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Não autenticado'},{status:401});const {provider}=await params;if(!['spotify','lastfm','google','discord','twitch','x'].includes(provider))return NextResponse.json({error:'Provider inválido'},{status:400});await db.oAuthAccount.deleteMany({where:{userId:user.id,provider}});return NextResponse.json({ok:true});}
