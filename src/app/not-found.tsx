import Link from "next/link";
export default function NotFound(){return <main className="notFoundPage"><div className="notFoundMark">∞</div><div className="eyebrow">404 / GROOV</div><h1>Essa faixa não está no catálogo.</h1><p className="muted">A página que você procura não existe ou foi removida.</p><Link href="/" className="btn">Voltar para o Groov</Link></main>}
