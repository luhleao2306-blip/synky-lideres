import type { Metadata } from "next";
import LoginForm from "./login-form";
import "./login.css";
import { safeReturnPath } from "@/lib/cloudflare-auth";

export const metadata: Metadata = { title: "Acessar a plataforma | Synky Líderes" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next, "/app");
  return <main className="auth-page">
    <section className="auth-story" aria-label="Sobre a Synky Líderes">
      <div className="auth-story-overlay"/>
      <a className="auth-story-logo" href="/"><img src="/images/brand/synky-leaders-light.webp" alt="Synky Leaders"/></a>
      <div className="auth-story-copy"><span>ÁREA DA LIDERANÇA</span><i/><h1>Lidere com mais intenção.<br/><em>Evolua a cada escolha.</em></h1><p>Conhecimento prático para ampliar seu impacto no dia a dia.</p></div>
      <div className="auth-story-points"><span>Aprendizado contínuo</span><i/><span>Prática aplicada</span><i/><span>Evolução real</span></div>
    </section>
    <section className="auth-panel"><a className="auth-panel-logo" href="/"><img src="/images/brand/synky-leaders-dark.webp" alt="Synky Leaders"/></a><div className="auth-panel-content"><span className="auth-eyebrow">BEM-VINDO DE VOLTA</span><i className="auth-accent"/><h2>Continue sua evolução</h2><p>Acesse sua academia de liderança.</p><LoginForm next={next}/><small className="auth-secure">♧&nbsp; Acesso seguro disponibilizado pela sua organização.</small><div className="auth-back"><a href="/">← &nbsp;Voltar ao site Synky Líderes</a></div></div></section>
  </main>;
}
