"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

export default function LoginForm({ next }: { next: string }) {
  const [showPassword, setShowPassword] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Não foi possível entrar.");
      window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/app");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha de conexão."); setBusy(false); }
  }
  return <form className="auth-form" onSubmit={submit}>
    <label htmlFor="login-email">E-mail corporativo</label><input id="login-email" name="email" type="email" autoComplete="username" placeholder="voce@empresa.com.br" required maxLength={254}/>
    <div className="auth-password-label"><label htmlFor="login-password">Senha</label></div><div className="auth-password"><input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required maxLength={256}/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button className="auth-submit" type="submit" disabled={busy}>{busy && <LoaderCircle size={17} className="auth-spin"/>}{busy ? "Acessando…" : "Entrar no painel"}</button>
    <p className="auth-no-signup">O acesso é liberado pela sua organização.</p>
  </form>;
}
