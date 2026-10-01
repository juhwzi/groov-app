"use client";
import { useEffect, useRef, useState } from "react";

export function NotificationBell(){
  const [open,setOpen]=useState(false); const [items,setItems]=useState<any[]>([]); const [unread,setUnread]=useState(0); const ref=useRef<HTMLDivElement>(null);
  async function load(){const r=await fetch("/api/notifications?limit=8",{cache:"no-store"});if(r.ok){const j=await r.json();setItems(j.notifications||[]);setUnread(j.unread||0)}}
  useEffect(()=>{load(); const t=setInterval(load,45000); return()=>clearInterval(t)},[]);
  useEffect(()=>{function close(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close)},[]);
  async function read(id?:string){await fetch("/api/notifications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(id?{id}:{all:true})});load()}
  return <div className="notificationWrap" ref={ref}>
    <button className="icon notificationButton" aria-label="Notificações" aria-expanded={open} onClick={()=>{setOpen(v=>!v);if(!open)load()}}>♧{unread>0&&<span className="notificationCount">{unread>9?"9+":unread}</span>}</button>
    {open&&<div className="notificationMenu panel">
      <div className="notificationHeader"><div><b>Notificações</b>{unread>0&&<span className="badge">{unread} novas</span>}</div>{unread>0&&<button className="textButton" onClick={()=>read()}>Marcar todas</button>}</div>
      {items.length?items.map(n=><button key={n.id} className={`notificationItem ${n.readAt?"":"unread"}`} onClick={()=>read(n.id)}><span className="notificationDot">{n.actor?.displayName?.slice(0,1)||"∞"}</span><span><b>{n.actor?.displayName||"Groov"}</b><small>{n.message||"Você tem uma nova atividade."}</small><time>{new Date(n.createdAt).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</time></span></button>):<div className="notificationEmpty">Tudo em dia. ✦</div>}
    </div>}
  </div>
}
