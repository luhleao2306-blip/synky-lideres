"use client";
/* eslint-disable @next/next/no-img-element -- Local WebP illustrations are already compressed for these cards. */

import { useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Compass, UsersRound } from "lucide-react";
import { scenarios } from "@/lib/experiences";
import { moduleNames, type ModuleKey, type ModuleSettings } from "@/lib/modules";
import type { CareerRun, EnergyEntry, ThermometerTrack } from "./additional-experiences";

type Cycle={id:string;status:string;createdAt:string;responseCount:number;action:string|null;checkinCount:number;checkins:{id:string;action:string;note:string;entryDate:string;createdAt:string}[]};
type DecisionRun={id:string;scenario_id:string;choices:number[];created_at:string};
type Pair={id:string;ready:boolean;createdAt:string};
type View=ModuleKey;
type Data={role:string;modules:ModuleSettings;mirrors:Cycle[];runs:DecisionRun[];decisionCount:number;pairs:Pair[];energyEntries:EnergyEntry[];careerRuns:CareerRun[];thermometerTracks:ThermometerTrack[]};
type Event={id:string;at:string;title:string;detail:string;module:ModuleKey;group:"practice"|"experience";open:()=>void};

const shortDate=(value:string)=>new Date(value).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"});

export default function EvolutionDashboard({data,onNavigate,onOpenMirror,onOpenDecision}:{data:Data;onNavigate:(view:View)=>void;onOpenMirror:(cycleId:string)=>void;onOpenDecision:(run:DecisionRun)=>void}){
  const [filter,setFilter]=useState<"all"|"practice"|"experience">("all");
  const [visible,setVisible]=useState(7);
  const events:Event[]=[
    ...data.mirrors.flatMap(cycle=>[
      {id:`mirror-${cycle.id}`,at:cycle.createdAt,title:"Ciclo do Espelho iniciado",detail:cycle.status==="closed"?`Concluído com ${cycle.responseCount} resposta${cycle.responseCount===1?"":"s"} do time.`:`Em andamento · ${cycle.responseCount} resposta${cycle.responseCount===1?"":"s"} do time.`,module:"mirror" as const,group:"experience" as const,open:()=>onOpenMirror(cycle.id)},
      ...cycle.checkins.map(checkin=>({id:`practice-${checkin.id}`,at:checkin.createdAt,title:"Ação colocada em prática",detail:checkin.note,module:"mirror" as const,group:"practice" as const,open:()=>onOpenMirror(cycle.id)})),
    ]),
    ...data.runs.map(run=>({id:`decision-${run.id}`,at:run.created_at,title:"Cenário de decisão concluído",detail:scenarios.find(item=>item.id===run.scenario_id)?.title||"Decisões Sob Pressão",module:"decisions" as const,group:"experience" as const,open:()=>onOpenDecision(run)})),
    ...data.pairs.map(pair=>({id:`pair-${pair.id}`,at:pair.createdAt,title:"Conversa em dupla iniciada",detail:pair.ready?"A comparação já está disponível.":"Aguardando a outra pessoa responder.",module:"communication" as const,group:"experience" as const,open:()=>onNavigate("communication")})),
    ...data.energyEntries.map(entry=>({id:`energy-${entry.id}`,at:entry.createdAt,title:"Energia registrada",detail:`${entry.activityType} · ${entry.activity}`,module:"energy" as const,group:"practice" as const,open:()=>onNavigate("energy")})),
    ...data.careerRuns.map(run=>({id:`career-${run.id}`,at:run.createdAt,title:"Bússola de Carreira respondida",detail:"Suas prioridades foram registradas para comparação.",module:"career" as const,group:"experience" as const,open:()=>onNavigate("career")})),
    ...data.thermometerTracks.map(track=>({id:`track-${track.id}`,at:track.createdAt,title:"Acompanhamento do time iniciado",detail:`${track.rounds.length} rodada${track.rounds.length===1?"":"s"} de acompanhamento.`,module:"thermometer" as const,group:"experience" as const,open:()=>onNavigate("thermometer")})),
  ].sort((a,b)=>b.at.localeCompare(a.at));
  const activeEvents=events.filter(event=>data.modules[event.module]);
  const enabledCount=(Object.keys(moduleNames) as ModuleKey[]).filter(key=>data.modules[key]).length;
  const explored=(Object.keys(moduleNames) as ModuleKey[]).filter(key=>data.modules[key]&&activeEvents.some(event=>event.module===key)).length;
  const practices=data.modules.mirror?data.mirrors.reduce((sum,cycle)=>sum+cycle.checkinCount,0):0;
  const hasHistory=activeEvents.length>0;
  const canLead=["admin","rh","leader"].includes(data.role);
  const suggestions=[
    {key:"decisions" as const,title:"Treine uma decisão",description:"Escolha um cenário e observe as consequências de cada caminho.",time:"7 min",image:"/images/leader-decisions.webp"},
    {key:"energy" as const,title:"Observe sua energia",description:"Registre uma atividade e comece a perceber seu ritmo de trabalho.",time:"2 min",image:"/images/leader-energy.webp"},
    {key:"career" as const,title:"Explore suas prioridades",description:"Responda a dilemas reais e veja o que pesa nas suas escolhas.",time:"6 min",image:"/images/leader-career.webp"},
  ].filter(item=>data.modules[item.key]);
  const currentAction=data.mirrors.find(cycle=>cycle.action&&data.modules.mirror);
  const openCycle=data.mirrors.find(cycle=>cycle.status==="open"&&data.modules.mirror);
  const recentDecision=data.runs.find(run=>data.modules.decisions&&scenarios.some(item=>item.id===run.scenario_id));
  const focus=currentAction?{eyebrow:"SEU FOCO ATUAL",title:"Continue a ação que escolheu",body:currentAction.action!,meta:`${currentAction.checkinCount} prática${currentAction.checkinCount===1?"":"s"} registrada${currentAction.checkinCount===1?"":"s"}`,button:"Ver meu ciclo",open:()=>onOpenMirror(currentAction.id)}:openCycle?{eyebrow:"CICLO EM ANDAMENTO",title:"Escute a percepção do time",body:"Convide mais pessoas e acompanhe as respostas do seu ciclo.",meta:`${openCycle.responseCount} de 5 respostas mínimas`,button:"Acompanhar ciclo",open:()=>onOpenMirror(openCycle.id)}:recentDecision?{eyebrow:"VALE REVISITAR",title:"Reveja suas escolhas",body:scenarios.find(item=>item.id===recentDecision.scenario_id)?.title||"Um cenário de liderança",meta:"Veja o que escolheu em cada etapa e tente outro caminho.",button:"Rever resultado",open:()=>onOpenDecision(recentDecision)}:{eyebrow:"PRÓXIMO PASSO",title:"Escolha uma experiência para continuar",body:"Faça uma nova atividade e compare suas escolhas com as anteriores.",meta:"",button:"Explorar experiências",open:()=>onNavigate(suggestions[0]?.key||"decisions")};
  const filtered=activeEvents.filter(event=>filter==="all"||event.group===filter);
  const counts=(Object.keys(moduleNames) as ModuleKey[]).map(key=>({key,count:events.filter(event=>event.module===key).length})).filter(item=>item.count&&data.modules[item.key]);

  return <div className="evolution-page">
    <section className="evolution-hero"><div><span className="kicker">MINHA EVOLUÇÃO</span><h1>{hasHistory?"Acompanhe o que você colocou em prática.":"Comece e acompanhe sua evolução."}</h1><p>{hasHistory?"Aqui estão suas experiências e ações registradas. Abra um item para rever o resultado e escolher o próximo passo.":"Quando você concluir uma experiência, seus registros aparecerão aqui para comparar escolhas e retomar ações."}</p><button className="evolution-hero-link" onClick={hasHistory?focus.open:()=>onNavigate(suggestions[0]?.key||"decisions")}>{hasHistory?focus.button:"Escolher uma experiência"}<ArrowRight size={17}/></button></div><div className="evolution-hero-art" aria-hidden="true"/></section>
    {!hasHistory?<><div className="evolution-empty-heading"><span className="kicker">POR ONDE COMEÇAR</span><h2>Escolha uma experiência que faça sentido hoje.</h2><p>Você não precisa seguir uma ordem. Cada atividade concluída aparecerá aqui para consultar depois.</p></div><div className="evolution-start-grid">{suggestions.map(item=><button key={item.key} className="evolution-start-card" onClick={()=>onNavigate(item.key)}><img src={item.image} alt="" loading="lazy"/><span>{item.time} · PARA VOCÊ</span><h3>{item.title}</h3><p>{item.description}</p><strong>Começar <ArrowRight size={17}/></strong></button>)}{canLead&&data.modules.mirror&&<button className="evolution-start-card evolution-team-card" onClick={()=>onNavigate("mirror")}><div className="evolution-team-icon"><UsersRound size={32}/></div><span>COM O TIME</span><h3>Ouça outras perspectivas</h3><p>Inicie o Espelho do Líder e convide seu time a responder.</p><strong>Conhecer o Espelho <ArrowRight size={17}/></strong></button>}</div></>:<><div className="evolution-stats"><div><span>EXPERIÊNCIAS EXPLORADAS</span><strong>{explored}<small> / {enabledCount}</small></strong><p>Módulos com ao menos um registro</p></div><div><span>AÇÕES PRATICADAS</span><strong>{practices}</strong><p>Registros após o Espelho</p></div><div><span>CENÁRIOS CONCLUÍDOS</span><strong>{data.modules.decisions?data.decisionCount:0}</strong><p>Decisões para revisitar</p></div></div><div className="evolution-columns"><section className="evolution-timeline"><div className="evolution-section-head"><div><span className="kicker">SEUS REGISTROS</span><h2>Linha do tempo</h2></div><span className="evolution-total">{filtered.length} registro{filtered.length===1?"":"s"}</span></div><div className="evolution-filters" aria-label="Filtrar registros">{[["all","Tudo"],["practice","Práticas"],["experience","Experiências"]].map(([key,label])=><button key={key} className={filter===key?"active":""} aria-pressed={filter===key} onClick={()=>{setFilter(key as typeof filter);setVisible(7)}}>{label}</button>)}</div>{filtered.length?<div className="evolution-event-list">{filtered.slice(0,visible).map(event=><button className="evolution-event" key={event.id} onClick={event.open}><span className="evolution-event-icon">{event.group==="practice"?<CheckCircle2 size={20}/>:<BookOpen size={20}/>}</span><span className="evolution-event-copy"><small>{moduleNames[event.module]} · {shortDate(event.at)}</small><strong>{event.title}</strong><span>{event.detail}</span></span><ArrowRight className="evolution-event-arrow" size={17}/></button>)}</div>:<div className="evolution-filter-empty">Ainda não há registros neste filtro.</div>}{filtered.length>visible&&<button className="evolution-more" onClick={()=>setVisible(value=>value+7)}>Ver mais registros <ChevronDown size={17}/></button>}</section><aside className="evolution-side"><section className="evolution-focus"><span className="kicker">{focus.eyebrow}</span><h2>{focus.title}</h2><p>{focus.body}</p>{focus.meta&&<small>{focus.meta}</small>}<button onClick={focus.open}>{focus.button} <ArrowRight size={17}/></button></section><section className="evolution-explored"><div className="evolution-section-head"><div><span className="kicker">NO SEU RITMO</span><h2>Onde você já passou</h2></div><Compass size={23}/></div>{counts.map(item=><button key={item.key} onClick={()=>onNavigate(item.key)}><span>{moduleNames[item.key]}</span><strong>{item.count} registro{item.count===1?"":"s"} <ArrowRight size={15}/></strong></button>)}<p>Seus registros de energia mostram os últimos 30 dias.</p></section></aside></div></>}
  </div>;
}
