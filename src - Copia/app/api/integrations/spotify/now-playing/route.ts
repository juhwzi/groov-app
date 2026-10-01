import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getNowPlaying } from "@/lib/spotify";
export async function GET(){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Não autenticado"},{status:401});return NextResponse.json({nowPlaying:await getNowPlaying(user.id)});}
