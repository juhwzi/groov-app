import Link from "next/link";
import { db } from "@/lib/db";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  let albums: any[] = [], artists: any[] = [], users: any[] = [];
  if (query) {
    [albums, artists, users] = await Promise.all([
      db.album.findMany({ where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { artistName: { contains: query, mode: "insensitive" } }] }, take: 30, orderBy: { title: "asc" } }),
      db.artist.findMany({ where: { name: { contains: query, mode: "insensitive" } }, take: 30, orderBy: { name: "asc" } }),
      db.user.findMany({ where: { deletedAt: null, OR: [{ username: { contains: query, mode: "insensitive" } }, { displayName: { contains: query, mode: "insensitive" } }] }, select: { id: true, username: true, displayName: true, avatarUrl: true }, take: 30, orderBy: { username: "asc" } })
    ]);
  }
  return <main className="searchPage">
    <Link href="/" className="legalBrand">∞ GROOV</Link>
    <div className="eyebrow">BUSCA</div>
    <h1>{query ? <>Resultados para <em>“{query}”</em></> : "O que você quer encontrar?"}</h1>
    {!query ? <p className="muted">Use a busca do Groov para encontrar artistas, álbuns e pessoas.</p> : <div className="searchSections">
      <section><div className="eyebrow">ARTISTAS · {artists.length}</div>{artists.length ? <div className="searchEntityGrid">{artists.map(a => <Link href={`/artist/${a.id}`} className="searchEntity" key={a.id}><div className="entityThumb">{a.imageUrl ? <img src={a.imageUrl} alt="" /> : <span>∞</span>}</div><b>{a.name}</b><small>{a.genres.slice(0, 2).join(" · ")}</small></Link>)}</div> : <p className="muted">Nenhum artista encontrado.</p>}</section>
      <section><div className="eyebrow">ÁLBUNS · {albums.length}</div>{albums.length ? <div className="searchEntityGrid">{albums.map(a => <Link href={`/album/${a.id}`} className="searchEntity" key={a.id}><div className="entityThumb">{a.coverUrl ? <img src={a.coverUrl} alt="" /> : <span>∞</span>}</div><b>{a.title}</b><small>{a.artistName}</small></Link>)}</div> : <p className="muted">Nenhum álbum encontrado.</p>}</section>
      <section><div className="eyebrow">PESSOAS · {users.length}</div>{users.length ? <div className="peopleSearchGrid">{users.map(u => <Link href={`/u/${u.username}`} className="personSearch" key={u.id}><div className="publicAvatar small">{u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : u.displayName.slice(0, 1)}</div><div><b>{u.displayName}</b><small>@{u.username}</small></div></Link>)}</div> : <p className="muted">Nenhuma pessoa encontrada.</p>}</section>
    </div>}
  </main>;
}
