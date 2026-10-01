import { PrismaClient, Format } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
const albums=[
 ["Névoa Azul","Lia Cardoso","https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900"],["Vinil Quebrado","Os Atemporais","https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=900"],["Madrugada 2h","Rua Dois","https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900"],["Fita Magnética","Cassette Club","https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=900"],["Orbita","Nina Vaz","https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900"],["Chuva em Dó","Trio Sereno","https://images.unsplash.com/photo-1506157786151-b8491531f063?w=900"],["Sala de Espera","Pavilhão","https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?w=900"],["Eco Doméstico","Tomás Reis","https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900"],["Planície","Duo Aurora","https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900"],["Neon Lento","Vera Lume","https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900"]
] as const;
async function ensureUser(email:string,username:string,displayName:string,bio:string){const passwordHash=await bcrypt.hash("groov123",12);return prisma.user.upsert({where:{email},update:{},create:{email,username,displayName,passwordHash,bio}})}
async function main(){
 const julia=await ensureUser("julia@groov.local","julia","Julia","Exploradora de sons.");
 const ana=await ensureUser("ana@groov.local","ana","Ana","Indie, synths e discos para madrugada.");
 const leo=await ensureUser("leo@groov.local","leo","Leo","Colecionador de vinil e reviews longas.");
 const created:any[]=[];
 for(const [title,artistName,coverUrl] of albums){const artist=await prisma.artist.upsert({where:{externalId:`seed-${artistName}`},update:{imageUrl:coverUrl},create:{externalId:`seed-${artistName}`,name:artistName,imageUrl:coverUrl,genres:["indie","alternative"]}});created.push(await prisma.album.upsert({where:{externalId:`seed-${title}`},update:{coverUrl,artistId:artist.id},create:{externalId:`seed-${title}`,title,artistName,artistId:artist.id,coverUrl,totalTracks:10}}))}
 for(const album of created){for(let i=1;i<=5;i++){await prisma.track.upsert({where:{externalId:`seed-track-${album.id}-${i}`},update:{},create:{externalId:`seed-track-${album.id}-${i}`,title:`${album.title} — Faixa ${i}`,albumId:album.id,artistName:album.artistName,coverUrl:album.coverUrl}})}}
 const count=await prisma.listeningLog.count({where:{userId:julia.id}});if(!count){const examples:[number,number,Format,string,boolean][]=[[2,5,Format.VINYL,"Disco para ouvir de luz apagada. Cada faixa respira.",false],[7,1.5,Format.DIGITAL,"Prefiro o primeiro disco. Sério.",true],[4,4.5,Format.LIVE,"Vi na turnê: a faixa final valeu o ingresso.",false],[0,4,Format.DIGITAL,"A produção tem uma textura linda.",false],[5,3.5,Format.TAPE,"Revisitando aos poucos.",false],[8,4.5,Format.VINYL,"Essa textura pede uma prateleira.",false]];for(const [i,rating,format,review,hotTake] of examples)await prisma.listeningLog.create({data:{userId:julia.id,albumId:created[i].id,rating,format,review,hotTake}})}
 const others=[[ana.id,[0,2,4,5,8]],[leo.id,[1,2,3,4,7]]];for(const [uid,ids] of others as any){const n=await prisma.listeningLog.count({where:{userId:uid}});if(!n){for(const [i,albumIndex] of ids.entries())await prisma.listeningLog.create({data:{userId:uid,albumId:created[albumIndex].id,rating:4+(i%2)*.5,format:i%2?Format.DIGITAL:Format.VINYL,review:i===0?"Entrou na rotação.":null}})}}
 await prisma.follow.upsert({where:{followerId_followingId:{followerId:julia.id,followingId:ana.id}},update:{},create:{followerId:julia.id,followingId:ana.id}});
 await prisma.follow.upsert({where:{followerId_followingId:{followerId:leo.id,followingId:julia.id}},update:{},create:{followerId:leo.id,followingId:julia.id}});
 for(let i=0;i<5;i++)await prisma.topPick.upsert({where:{userId_position:{userId:julia.id,position:i+1}},update:{albumId:created[[2,4,0,9,5][i]].id},create:{userId:julia.id,albumId:created[[2,4,0,9,5][i]].id,position:i+1}});
 await prisma.user.update({where:{id:julia.id},data:{currentObsessionId:created[8].id}});
 console.log("Groov seeded. Login: julia@groov.local / groov123 | demo users: ana@groov.local, leo@groov.local");
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
