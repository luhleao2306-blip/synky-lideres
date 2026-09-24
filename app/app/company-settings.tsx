"use client";
import { useState } from "react";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moduleKeys, moduleNames, type ModuleSettings } from "@/lib/modules";

type Send=(action:string,payload?:Record<string,unknown>)=>Promise<{companyId?:string}|null>;

export function CompanySettings({name,modules,busy,send}:{name:string;modules:ModuleSettings;busy:boolean;send:Send}){
  const [draft,setDraft]=useState(name);
  return <>
    <div className="module-panel"><span className="kicker">EMPRESA</span><h2>Nome do ambiente</h2><div className="company-name-form"><Input aria-label="Nome da empresa" value={draft} maxLength={90} onChange={e=>setDraft(e.target.value)}/><Button disabled={busy||draft.trim().length<2||draft.trim()===name} onClick={()=>send("rename_company",{name:draft})}>Salvar nome</Button></div></div>
    <div className="module-panel"><span className="kicker">EXPERIÊNCIAS</span><h2>Experiências disponíveis</h2><p>Escolha o que as pessoas desta empresa podem iniciar ou responder. O histórico permanece salvo.</p><div className="module-toggle-list">{moduleKeys.map(key=><label key={key}><span><strong>{moduleNames[key]}</strong><small>{modules[key]?"Disponível neste ambiente":"Indisponível neste ambiente"}</small></span><input type="checkbox" checked={modules[key]} disabled={busy} onChange={e=>send("set_module",{module:key,enabled:e.target.checked})}/></label>)}</div></div>
  </>;
}

export function PlatformPanel({companies,busy,send,onSelect}:{companies:{id:string;name:string;people:number}[];busy:boolean;send:Send;onSelect:(id:string)=>void}){
  const [name,setName]=useState("");
  return <><div className="module-heading"><span className="kicker">ADMINISTRAÇÃO</span><h1>Empresas<span>.</span></h1><p>Crie ambientes separados para cada empresa e configure as experiências em cada um.</p></div><div className="module-panel"><h2>Criar empresa</h2><div className="company-name-form"><Input aria-label="Nome da nova empresa" placeholder="Nome da empresa" value={name} maxLength={90} onChange={e=>setName(e.target.value)}/><Button className="app-primary" disabled={busy||name.trim().length<2} onClick={async()=>{const result=await send("create_company",{name});if(result?.companyId){setName("");onSelect(result.companyId)}}}>Criar ambiente <ArrowRight size={16}/></Button></div></div><div className="module-panel"><h2>Ambientes cadastrados</h2><div className="platform-company-list">{companies.map(company=><button key={company.id} onClick={()=>onSelect(company.id)}><Building2 size={19}/><span><strong>{company.name}</strong><small>{company.people} pessoa(s)</small></span><ArrowRight size={17}/></button>)}</div></div></>;
}
