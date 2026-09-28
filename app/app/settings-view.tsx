"use client";

import { useState } from "react";
import { ArrowRight, Building2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ModuleSettings } from "@/lib/modules";
import { CompanySettings } from "./company-settings";

type Send = (action: string, payload?: Record<string, unknown>) => Promise<{ companyId?: string } | null>;

export default function SettingsView({ name, email, company, role, isGuest, isAdmin, modules, busy, send }: {
  name: string;
  email: string;
  company: string;
  role: string;
  isGuest: boolean;
  isAdmin: boolean;
  modules: ModuleSettings;
  busy: boolean;
  send: Send;
}) {
  const [profileName, setProfileName] = useState(name);
  const [contactEmail, setContactEmail] = useState(email.endsWith("@visitor.synky.local") ? "" : email);

  return <section className="settings-page">
    <header className="settings-heading">
      <span className="kicker">CONFIGURAÇÕES</span>
      <h1>Seu ambiente<span>.</span></h1>
      <p>Gerencie seu perfil, as experiências disponíveis e a privacidade dos resultados.</p>
    </header>
    <div className="settings-grid">
      <div className="settings-main">
        <section className="module-panel settings-profile">
          <div className="settings-card-title"><span className="settings-card-icon"><UserRound size={21}/></span><div><span className="kicker">IDENTIDADE</span><h2>Seu perfil</h2></div></div>
          <div className="settings-profile-summary"><span className="settings-profile-avatar">{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><span>{role} · {company}</span></div></div>
          <div className="settings-detail-grid">
            <div><span>Nome</span><strong>{name}</strong></div>
            <div><span>E-mail</span><strong>{isGuest && email.endsWith("@visitor.synky.local") ? "Não informado" : email}</strong></div>
            <div><span>Empresa</span><strong>{company}</strong></div>
            <div><span>Tipo de acesso</span><strong>{role}</strong></div>
          </div>
          {isGuest && <div className="settings-guest-fields">
            <p>Seu acesso público fica salvo neste navegador. Informe seus dados para ser identificado nos convites.</p>
            <label className="field-label">Como podemos chamar você?<div className="company-name-form"><Input aria-label="Seu nome" value={profileName} maxLength={70} onChange={event=>setProfileName(event.target.value)} placeholder="Seu nome"/><Button disabled={busy||profileName.trim().length<2||profileName.trim()===name} onClick={()=>send("rename_profile",{name:profileName})}>Salvar nome</Button></div></label>
            <label className="field-label">E-mail de contato<div className="company-name-form"><Input type="email" value={contactEmail} maxLength={254} onChange={event=>setContactEmail(event.target.value)} placeholder="seu@email.com"/><Button disabled={busy||!contactEmail.includes("@")||contactEmail.trim().toLowerCase()===email.toLowerCase()} onClick={()=>send("set_contact_email",{email:contactEmail})}>Salvar e-mail</Button></div></label>
            <small>O e-mail identifica você nos convites e permite receber resumos compartilhados. Ele não é verificado automaticamente.</small>
          </div>}
          <a className="settings-signout" href={isGuest?"/signin-with-chatgpt?return_to=%2Fapp":"/signout-with-chatgpt?return_to=/"} target="_top">{isGuest?"Acesso administrativo":"Sair da conta"} <ArrowRight size={16}/></a>
        </section>
        {isAdmin && <CompanySettings name={company} modules={modules} busy={busy} send={send}/>}
      </div>
      <aside className="settings-aside">
        <section className="settings-aside-card settings-context-card"><span className="settings-aside-icon"><Building2 size={22}/></span><span className="kicker">ESPAÇO ATUAL</span><h2>{company}</h2><p>As experiências e os convites deste ambiente são administrados separadamente.</p></section>
        <section className="settings-aside-card settings-privacy-card"><span className="settings-aside-icon"><ShieldCheck size={22}/></span><span className="kicker">PRIVACIDADE</span><h2>Resultados protegidos</h2><div><LockKeyhole size={17}/><p>Cada pessoa acessa seus próprios resultados. O administrador master pode consultar os resultados individuais de todos os espaços.</p></div><div><ShieldCheck size={17}/><p>No Espelho do Líder, respostas individuais do time nunca são exibidas. A média aparece após cinco respostas e o encerramento do ciclo.</p></div><div><Mail size={17}/><p>Na comunicação em dupla, as preferências só são comparadas quando as duas pessoas consentem.</p></div></section>
      </aside>
    </div>
  </section>;
}
