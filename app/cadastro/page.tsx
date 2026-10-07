import type { Metadata } from "next";
import RegistrationForm from "./registration-form";
import "../login/login.css";

export const metadata: Metadata = { title: "Ative seu acesso | Synky Líderes" };

export default async function RegistrationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <main className="auth-page"><section className="auth-story" aria-label="Synky Líderes"><div className="auth-story-overlay"/><a className="auth-story-logo" href="/"><img src="/images/brand/synky-leaders-light.webp" alt="Synky Leaders"/></a><div className="auth-story-copy"><span>ÁREA DA LIDERANÇA</span><i/><h1>Uma jornada para<br/><em>seguir evoluindo.</em></h1><p>Ative seu acesso e continue sua prática de liderança.</p></div><div className="auth-story-points"><span>Aprendizado contínuo</span><i/><span>Prática aplicada</span><i/><span>Evolução real</span></div></section><section className="auth-panel"><a className="auth-panel-logo" href="/"><img src="/images/brand/synky-leaders-dark.webp" alt="Synky Leaders"/></a><div className="auth-panel-content"><span className="auth-eyebrow">CONVITE DA ORGANIZAÇÃO</span><i className="auth-accent"/><h2>Ative seu acesso</h2><p>O convite é pessoal e válido por tempo limitado.</p><RegistrationForm token={token}/><div className="auth-back"><a href="/login">← &nbsp;Voltar ao acesso</a></div></div></section></main>;
}
