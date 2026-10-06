"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, Copy, Link2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Person={id:string;name:string;email:string;role:string};
type Invitation={token:string;email:string;role:string;expiresAt:string;createdAt:string};
type Send=(action:string,payload?:Record<string,unknown>)=>Promise<{link?:string}|null>;
type TeamView="mirror"|"experiences";

const roleLabels:Record<string,string>={admin:"Administrador",rh:"RH",leader:"Líder",participant:"Participante"};
const roleHelp:Record<string,string>={participant:"Participa das experiências e responde aos convites do time.",leader:"Cria ciclos de liderança e vê resultados coletivos do próprio time.",rh:"Organiza convites e acompanha a participação geral da equipe."};

export default function TeamPanel({company,role,memberId,people,invites,busy,send,onNavigate}:{company:string;role:string;memberId:string;people:Person[];invites:Invitation[];busy:boolean;send:Send;onNavigate:(view:TeamView)=>void}){
  const [email,setEmail]=useState("");
  const [inviteRole,setInviteRole]=useState("participant");
  const [editedRoles,setEditedRoles]=useState<Record<string,string>>({});
  const [copiedToken,setCopiedToken]=useState<string|null>(null);
  const [createdInvite,setCreatedInvite]=useState<{email:string;role:string;link:string}|null>(null);
  const canManage=role==="admin"||role==="rh";
  const hasOthers=people.some(person=>person.id!==memberId);
  useEffect(()=>{if(createdInvite)document.getElementById("team-created-link")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"})},[createdInvite]);

  async function createInvite(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const invitedEmail=email.trim();
    const result=await send("invite_member",{email:invitedEmail,role:inviteRole});
    if(result?.link){setCreatedInvite({email:invitedEmail,role:inviteRole,link:result.link});setEmail("")}
  }

  async function copyLink(link:string,key:string){
    try{await navigator.clipboard.writeText(link);setCopiedToken(key);window.setTimeout(()=>setCopiedToken(current=>current===key?null:current),2500)}
    catch{window.prompt("Copie o endereço do convite:",link)}
  }

  function prepareEmail(email:string,link:string){
    const subject=encodeURIComponent("Convite Synky Líderes");
    const body=encodeURIComponent(`Olá,\n\nAcesse seu convite no Synky Líderes:\n${link}\n\nAté breve!`);
    window.location.href=`mailto:${email}?subject=${subject}&body=${body}`;
  }

  return <div className="team-page">
    <div className="module-heading team-heading"><span className="kicker">{company.toUpperCase()}</span><h1>Meu time<span>.</span></h1><p>Convide pessoas, acompanhe os acessos e comece experiências juntos.</p></div>

    {canManage?<>
      {!hasOthers&&invites.length===0?<section className="team-welcome"><div><span className="kicker">PRIMEIRO PASSO</span><h2>Seu time começa com um convite.</h2><p>Traga quem vai participar. Depois vocês poderão responder às experiências no mesmo espaço, com resultados individuais protegidos.</p></div></section>:<div className="team-status" aria-label="Situação da equipe"><span><strong>{people.length}</strong> {people.length===1?"pessoa com acesso":"pessoas com acesso"}</span><span><strong>{invites.length}</strong> {invites.length===1?"convite aguardando":"convites aguardando"}</span></div>}

      <div className="team-main-grid"><section className="team-card team-invite-card"><span className="kicker">NOVO CONVITE</span><h2>Quem você quer trazer?</h2><p>Informe um e-mail para identificar a pessoa na equipe e escolha o que ela poderá fazer.</p><form onSubmit={createInvite}><label className="field-label">E-mail da pessoa<Input type="email" required maxLength={254} value={email} onChange={event=>setEmail(event.target.value)} placeholder="nome@empresa.com"/></label><label className="field-label">Tipo de acesso<select value={inviteRole} onChange={event=>setInviteRole(event.target.value)}><option value="participant">Participante</option><option value="leader">Líder</option><option value="rh">RH</option></select></label><div className="team-role-explainer"><ShieldCheck size={18}/><span>{roleHelp[inviteRole]}</span></div><Button type="submit" className="app-primary" disabled={busy||!email.includes("@")||!email.includes(".")}>Criar link de convite <ArrowRight size={16}/></Button></form>{createdInvite&&<div className="team-created-invite" role="status"><div className="team-created-head"><span className="team-created-icon"><Check size={20}/></span><div><strong>Convite pronto para compartilhar</strong><p>{createdInvite.email} · {roleLabels[createdInvite.role]}</p></div></div><p>O convite foi criado, mas ainda não foi enviado. Compartilhe o endereço abaixo com a pessoa.</p><label htmlFor="team-created-link">Link de acesso</label><div className="team-link-field"><Link2 size={17}/><Input id="team-created-link" readOnly value={createdInvite.link} onFocus={event=>event.target.select()} aria-label="Link de acesso do convite"/></div><div className="team-created-actions"><Button type="button" className="app-primary" onClick={()=>void copyLink(createdInvite.link,"new")}>{copiedToken==="new"?<Check size={16}/>:<Copy size={16}/>} {copiedToken==="new"?"Link copiado":"Copiar link"}</Button><Button type="button" variant="outline" onClick={()=>prepareEmail(createdInvite.email,createdInvite.link)}><Mail size={16}/> Preparar e-mail</Button></div></div>}<p className="team-invite-note">O link vale por sete dias. Quem receber o endereço poderá entrar sem conta; compartilhe apenas com a pessoa escolhida.</p></section>
        <aside className="team-card team-next-card"><span className="kicker">DEPOIS DO CONVITE</span><h2>Comece uma experiência.</h2><p>O Espelho do Líder reúne a percepção de pelo menos cinco pessoas antes de mostrar uma comparação coletiva.</p><Button variant="outline" onClick={()=>onNavigate("mirror")}>Abrir Espelho do Líder <ArrowRight size={16}/></Button><button className="team-text-link" onClick={()=>onNavigate("experiences")}>Ver todas as experiências <ArrowRight size={15}/></button></aside></div>

      {invites.length>0&&<section className="team-card team-list-card"><div className="team-section-heading"><div><span className="kicker">AGUARDANDO RESPOSTA</span><h2>Convites pendentes</h2></div><span className="team-count">{invites.length}</span></div><p>Copie o link novamente, prepare um e-mail ou cancele o acesso antes de ele ser usado.</p><div className="team-rows">{invites.map(invite=>{const inviteLink=()=>`${window.location.origin}/app?invite=${invite.token}`;return <div className="team-person-row" key={invite.token}><span className="team-person-avatar pending"><Mail size={18}/></span><div className="team-person-details"><strong>{invite.email}</strong><span>{roleLabels[invite.role]||invite.role} · expira em {new Date(invite.expiresAt).toLocaleDateString("pt-BR")}</span></div><div className="team-row-actions"><Button variant="outline" onClick={()=>void copyLink(inviteLink(),invite.token)}>{copiedToken===invite.token?<Check size={15}/>:<Copy size={15}/>} {copiedToken===invite.token?"Copiado":"Copiar link"}</Button><Button variant="ghost" className="team-mail-link" onClick={()=>prepareEmail(invite.email,inviteLink())}><Mail size={15}/> Preparar e-mail</Button><Button variant="ghost" disabled={busy} onClick={async()=>{if(window.confirm(`Cancelar o convite para ${invite.email}?`)&&await send("revoke_invite",{token:invite.token}))setCreatedInvite(current=>current?.link.endsWith(invite.token)?null:current)}}>Cancelar</Button></div></div>})}</div></section>}

      <section className="team-card team-list-card"><div className="team-section-heading"><div><span className="kicker">PESSOAS</span><h2>Quem já tem acesso</h2></div><span className="team-count">{people.length}</span></div>{!hasOthers&&<p>Por enquanto, só você está neste espaço. Os convidados aparecerão aqui depois que aceitarem o link.</p>}<div className="team-rows">{people.map(person=><div className="team-person-row" key={person.id}><span className="team-person-avatar">{person.name.charAt(0).toUpperCase()}</span><div className="team-person-details"><strong>{person.name} {person.id===memberId&&<small>Você</small>}</strong><span>{person.email.endsWith("@visitor.synky.local")?"Acesso neste navegador":person.email}</span></div>{role==="admin"&&person.id!==memberId&&person.role!=="admin"?<div className="team-row-actions"><label className="sr-only" htmlFor={`role-${person.id}`}>Perfil de {person.name}</label><select id={`role-${person.id}`} aria-label={`Perfil de ${person.name}`} value={editedRoles[person.id]??person.role} onChange={event=>setEditedRoles({...editedRoles,[person.id]:event.target.value})}><option value="participant">Participante</option><option value="leader">Líder</option><option value="rh">RH</option></select><Button variant="outline" disabled={busy||!editedRoles[person.id]||editedRoles[person.id]===person.role} onClick={async()=>{if(await send("change_member_role",{memberId:person.id,role:editedRoles[person.id]})){const next={...editedRoles};delete next[person.id];setEditedRoles(next)}}}>Salvar perfil</Button></div>:<span className="team-role-badge">{roleLabels[person.role]||person.role}</span>}</div>)}</div></section>
    </>:<section className="team-card team-member-card"><span className="kicker">SUA PARTICIPAÇÃO</span><h2>Você faz parte de {company}.</h2><p>{role==="leader"?"Inicie um ciclo do Espelho para convidar pessoas do seu time e acompanhar apenas os resultados coletivos.":"As experiências disponíveis para você estão no catálogo. Convites para responder ao seu time aparecerão na experiência correspondente."}</p><Button className="app-primary" onClick={()=>onNavigate(role==="leader"?"mirror":"experiences")}>{role==="leader"?"Abrir Espelho do Líder":"Explorar experiências"} <ArrowRight size={16}/></Button></section>}
  </div>;
}
