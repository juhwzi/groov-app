export function Stars({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (v:number)=>void }) {
  const click = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!interactive || !onChange) return;
    const r = e.currentTarget.getBoundingClientRect();
    const v = Math.max(0.5, Math.min(5, Math.ceil(((e.clientX - r.left) / r.width) * 10) / 2));
    onChange(v);
  };
  return <span className={interactive ? "stars bigstars" : "stars"} style={{ "--p": `${rating / 5 * 100}%` } as React.CSSProperties} onClick={click}>★★★★★</span>;
}
