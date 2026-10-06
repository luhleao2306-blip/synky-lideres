"use client";
import { ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ModuleSettings } from "@/lib/modules";
import ExperienceArtwork from "./experience-artwork";

type Cycle={id:string;status:string;createdAt:string;responseCount:number;action:string|null};
type Run={id:string;created_at:string};
type Pair={id:string;createdAt:string;ready?:boolean;answered?:boolean;isCreator?:boolean};
type Request={type:string;token:string}|null;
export type OverviewData={name:string;role:string;company:string;personal:boolean;modules:ModuleSettings;mirrors:Cycle[];runs:Run[];pairs:Pair[];energyEntries:{createdAt:string}[];careerRuns:{createdAt:string}[];thermometerTracks:{createdAt:string}[];companyStats?:{people:number;mirrorCycles:number;decisionRuns:number;careerRuns:number;thermometerTracks:number}|null;pendingInvites?:{token:string}[];communicationInvites?:{token:string}[];request:Request};
export type View="mirror"|"decisions"|"communication"|"energy"|"career"|"thermometer"|"evolution"|"team"|"experiences";
const experiences=[
  {key:"mirror" as const,title:"Espelho do Líder",description:"Receba percepções do seu time e amplie sua visão como líder.",className:"mirror"},
  {key:"decisions" as const,title:"Decisões Sob Pressão",description:"Pratique escolhas em situações de trabalho e observe seus efeitos.",className:"decisions"},
  {key:"communication" as const,title:"Raio X da Comunicação",description:"Compare preferências de comunicação e construa acordos em dupla.",className:"communication"},
  {key:"energy" as const,title:"Mapa de Energia",description:"Registre atividades e perceba o que dá energia ou desgasta no trabalho.",className:"energy"},
  {key:"career" as const,title:"Bússola de Carreira",description:"Explore prioridades em dilemas profissionais concretos.",className:"career"},
  {key:"thermometer" as const,title:"Termômetro de Liderança",description:"Acompanhe comportamentos escolhidos após um ciclo do Espelho.",className:"thermometer"},
];
export function activitySeries(data:OverviewData){
  const today=new Date(),months=Array.from({length:6},(_,i)=>{const d=new Date(today.getFullYear(),today.getMonth()-5+i,1);return {year:d.getFullYear(),month:d.getMonth(),label:d.toLocaleDateString("pt-BR",{month:"short"}).replace(".","").toUpperCase()}});
  const items=[...data.mirrors.map(x=>x.createdAt),...data.runs.map(x=>x.created_at),...data.pairs.map(x=>x.createdAt),...data.energyEntries.map(x=>x.createdAt),...data.careerRuns.map(x=>x.createdAt),...data.thermometerTracks.map(x=>x.createdAt)];
  const start=new Date(months[0].year,months[0].month,1);
  const values=months.map(m=>items.filter(x=>{const d=new Date(x);return d>=start&&(d.getFullYear()<m.year||(d.getFullYear()===m.year&&d.getMonth()<=m.month))}).length);
  return {months,values,total:items.length};
}
export function ExperienceCards({data,onNavigate,query="",limit=6}:{data:OverviewData;onNavigate:(v:View)=>void;query?:string;limit?:number}){
  const canOpenMirror=["admin","rh","leader"].includes(data.role)||data.request?.type==="mirror";
  const filtered=experiences.filter(x=>data.modules[x.key]&&(x.key!=="mirror"||canOpenMirror)&&(x.title+" "+x.description).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))).slice(0,limit);
  return <div className="reference-experience-grid">{filtered.map(x=>{
    const mirror=data.mirrors[0],count=x.key==="mirror"?mirror?.responseCount:undefined;
    const details=x.key==="mirror"?(mirror?`${count} de 5 respostas mínimas`:"8 min · para líderes"):x.key==="decisions"?(data.runs.length?`${data.runs.length} cenário(s) concluído(s)`:"Simulação interativa · 7 min"):x.key==="communication"?(data.pairs.length?`${data.pairs.length} dupla${data.pairs.length===1?"":"s"} iniciada${data.pairs.length===1?"":"s"}`:"Em dupla · 10 min"):x.key==="energy"?(data.energyEntries.length?`${data.energyEntries.length} registro(s)`:"Diário pessoal · 2 min"):x.key==="career"?(data.careerRuns.length?`${data.careerRuns.length} tentativa(s)`:"8 escolhas · 6 min"):(data.thermometerTracks.length?`${data.thermometerTracks.length} acompanhamento(s)`:"Após o Espelho");
    return <article className="reference-experience-card" key={x.key}><button className={`reference-art ${x.className}`} onClick={()=>onNavigate(x.key)} aria-label={`Abrir ${x.title}`}><ExperienceArtwork kind={x.key}/></button><div className="reference-experience-body"><h3>{x.title}</h3><p>{x.description}</p><div className="reference-card-meta"><span>{details}</span>{x.key!=="mirror"&&<Clock3 size={14}/>}</div>{x.key==="mirror"&&mirror&&<div className="reference-progress"><span style={{width:`${Math.min(100,mirror.responseCount/5*100)}%`}}/></div>}<Button variant={x.key==="decisions"?"default":"outline"} className="reference-card-button" onClick={()=>onNavigate(x.key)}>{x.key==="mirror"&&mirror?"Acompanhar":x.key==="decisions"?(data.runs.length?"Explorar cenários":"Começar"):x.key==="communication"&&data.pairs.length?"Ver minhas duplas":"Começar"} <ArrowRight size={16}/></Button></div></article>
  })}{!filtered.length&&<div className="reference-empty">{query.trim()?"Nenhuma experiência corresponde à busca.":"Ainda não há atividades disponíveis para seu acesso neste espaço. A administração pode disponibilizar os módulos em Configurações."}</div>}</div>;
}
