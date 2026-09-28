"use client";

import BrandLogo from "@/components/brand-logo";
import { ArrowRight, Check, LockKeyhole, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";

type Invite={type:string;token:string;companyName?:string;role?:string};
const roles:Record<string,string>={admin:"Administrador",rh:"RH",leader:"Líder",participant:"Participante"};

export default function InvitationLanding({invite,isGuest,busy,error,onAccept}:{invite:Invite;isGuest:boolean;busy:boolean;error:string;onAccept:()=>void}){
  const isTeam=invite.type==="member";
  return <main className="invite-landing">
    <div className="invite-landing-shell">
      <a href="/" className="brand" aria-label="Synky Líderes, página inicial"><BrandLogo/></a>
      <div className="invite-landing-grid">
        <section className="invite-landing-main">
          <span className="kicker">CONVITE SYNKY LÍDERES</span>
          <h1>{isTeam?"Você foi convidado para fazer parte do time.":"Uma experiência espera por você."}</h1>
          <p className="invite-landing-lead">{isTeam?"Entre no espaço compartilhado para participar das experiências e acompanhar sua jornada de liderança.":"Aceite o convite para participar da experiência junto com seu time."}</p>
          <div className="invite-landing-detail"><span className="invite-landing-detail-icon"><UsersRound size={21}/></span><div><small>ESPAÇO COMPARTILHADO</small><strong>{invite.companyName||"Seu time"}</strong>{isTeam&&<span>Acesso como {roles[invite.role||""]||"Participante"}</span>}</div></div>
          <Button className="app-primary invite-accept" disabled={busy} onClick={onAccept}>{busy?"Entrando…":"Aceitar convite e entrar"} <ArrowRight size={18}/></Button>
          <p className="invite-landing-note"><LockKeyhole size={15}/>{isGuest?"Este link dá acesso a quem o tiver. Use apenas se o convite chegou para você.":"Seu e-mail de acesso precisa corresponder ao e-mail convidado."}</p>
          {error&&<p className="error-message" role="alert">{error}</p>}
        </section>
        <aside className="invite-landing-aside" aria-label="O que você encontrará no Synky Líderes"><div className="invite-orbit" aria-hidden="true"><span/><span/><span/></div><div className="invite-aside-content"><span className="kicker">UM ESPAÇO PARA CRESCER</span><h2>Boas conversas mudam a forma de liderar.</h2><div><Check size={17}/> Experiências práticas para o dia a dia</div><div><Check size={17}/> Reflexões e evolução no seu ritmo</div><div><Check size={17}/> Resultados individuais protegidos</div></div></aside>
      </div>
    </div>
  </main>;
}
