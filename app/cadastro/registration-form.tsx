"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

type Invite = { email: string; companyName: string; expiresAt: string };
export default function RegistrationForm({ token }: { token: string }) {
  const [invite, setInvite] = useState<Invite | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { if (!token) { setError("Este link de cadastro não é válido."); return; } fetch(`/api/auth/register?token=${encodeURIComponent(token)}`, { cache: "no-store" }).then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setInvite(body); }).catch(cause => setError(cause instanceof Error ? cause.message : "Não foi possível conferir o convite.")); }, [token]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try { const response = await fetch("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, name: form.get("name"), password: form.get("password") }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); window.location.assign("/app"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível concluir o cadastro."); setBusy(false); }
  }
  if (!invite) return <div className={error ? "auth-error" : "admin-loading"} role={error ? "alert" : undefined}>{error || "Conferindo seu convite…"}</div>;
  return <form className="auth-form" onSubmit={submit}><label>Organização</label><input value={invite.companyName} readOnly/><label>E-mail do convite</label><input value={invite.email} readOnly/><label htmlFor="registration-name">Seu nome</label><input id="registration-name" name="name" autoComplete="name" minLength={2} maxLength={100} required/><label htmlFor="registration-password">Crie uma senha (mínimo de 12 caracteres)</label><input id="registration-password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={256} required/>{error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" type="submit" disabled={busy}>{busy && <LoaderCircle size={17} className="auth-spin"/>}{busy ? "Ativando…" : "Ativar meu acesso"}</button></form>;
}
