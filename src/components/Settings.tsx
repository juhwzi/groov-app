"use client";
import { useEffect, useState } from "react";

export function Settings({ reload, notify }: { reload: number; notify: (message: string) => void }) {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/integrations", { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        setIntegrations(j.integrations || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [reload]);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) return notify("As novas senhas não coincidem.");
    if (newPassword.length < 8) return notify("A nova senha precisa ter pelo menos 8 caracteres.");
    setBusy(true);
    try {
      const r = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const j = await r.json().catch(() => ({}));
      notify(r.ok ? "Senha alterada com sucesso." : (j.error || "Não foi possível alterar a senha."));
      if (r.ok) {
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      }
    } finally {
      setBusy(false);
    }
  }

  async function disconnect(provider: string) {
    const r = await fetch(`/api/integrations/${provider}/disconnect`, { method: "POST" });
    notify(r.ok ? "Integração desconectada." : "Não foi possível desconectar.");
    await load();
  }

  const providerLabel: Record<string, string> = {
    spotify: "Spotify", lastfm: "Last.fm", x: "X", google: "Google", discord: "Discord", twitch: "Twitch",
  };
  const connected = new Set(integrations.map((x: any) => x.provider));

  return <>
    <div><div className="eyebrow">CONTA</div><h1>Settings</h1><p className="muted">Gerencie sua segurança e suas conexões do Groov.</p></div>
    <div className="grid two">
      <form className="panel stack" onSubmit={changePassword}>
        <div><div className="eyebrow">SEGURANÇA</div><h2>Alterar senha</h2></div>
        <label>Senha atual<input type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></label>
        <label>Nova senha<input type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} required /></label>
        <label>Confirmar nova senha<input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} required /></label>
        <button className="btn" disabled={busy}>{busy ? "Salvando…" : "Alterar senha"}</button>
      </form>
      <div className="panel stack">
        <div><div className="eyebrow">INTEGRAÇÕES</div><h2>Contas conectadas</h2><p className="muted">Conecte serviços para enriquecer seu perfil e suas descobertas.</p></div>
        {loading ? <p className="muted">Carregando integrações…</p> : <div className="stack">{["spotify", "lastfm", "x"].map(provider => <div className="integrationRow" key={provider}><div><b>{providerLabel[provider]}</b><div className="muted">{connected.has(provider) ? "Conectado" : "Desconectado"}</div></div>{connected.has(provider) ? <button type="button" className="btn secondary" onClick={() => disconnect(provider)}>Desconectar</button> : <a className="btn secondary" href={`/api/integrations/${provider}/connect`}>Conectar</a>}</div>)}</div>}
      </div>
    </div>
  </>;
}
