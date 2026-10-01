import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const log = await db.listeningLog.findUnique({ where: { id }, include: { album: true, user: true, dualWith: true } });
  if (!log) notFound();
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#0D0D11",color:"#F4F4F8",fontFamily:"Inter,system-ui,sans-serif"}}>
    <article style={{width:"min(680px,100%)",background:"#16161D",border:"1px solid #2A2A36",borderRadius:24,padding:28,boxShadow:"0 30px 100px #0008"}}>
      <div style={{letterSpacing:".16em",fontWeight:900,fontSize:13}}>∞ GROOV</div>
      <div style={{display:"flex",gap:20,alignItems:"center",marginTop:24}}>
        {log.album.coverUrl && <img src={log.album.coverUrl} alt="" style={{width:150,height:150,objectFit:"cover",borderRadius:16}}/>}
        <div><div style={{color:"#9292A5",fontSize:12}}>REVIEW MUSICAL</div><h1 style={{margin:"8px 0 3px",fontSize:30}}>{log.album.title}</h1><div style={{color:"#9292A5"}}>{log.album.artistName}</div><div style={{marginTop:12,fontWeight:900,fontSize:22}}>{log.rating.toFixed(1)} / 5</div></div>
      </div>
      <p style={{marginTop:24,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{log.review || "Sem texto na review."}</p>
      <div style={{color:"#9292A5",fontSize:13}}>Por @{log.user.username}{log.dualWith ? ` · Review conjunta com @${log.dualWith.username}` : ""}</div>
    </article>
  </main>;
}
