"use client";

import { ArrowRight, BarChart3, CheckCircle2, MessageCircleMore, ShieldCheck, Sparkles, Target, TrendingUp, UsersRound, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperienceCards, activitySeries, type OverviewData, type View } from "./overview-dashboard";

type NextStep={eyebrow:string;title:string;body:string;button:string;view:View};
type Metric={label:string;value:number;detail:string;view:View;Icon:LucideIcon};

export default function LeadershipOverview({data,onNavigate,query=""}:{data:OverviewData;onNavigate:(view:View)=>void;query?:string}){
  const hour=new Date().getHours();
  const greeting=hour<12?"Bom dia":hour<18?"Boa tarde":"Boa noite";
  const firstName=data.name.trim().split(" ")[0]||"líder";
  const canLead=["admin","rh","leader"].includes(data.role);
  const canManage=["admin","rh"].includes(data.role);
  const latestCycle=canLead&&data.modules.mirror?data.mirrors[0]:undefined;
  const openCycle=canLead&&data.modules.mirror?data.mirrors.find(cycle=>cycle.status==="open"):undefined;
  const pendingCount=data.pendingInvites?.length??0;
  const peopleCount=data.companyStats?.people??0;
  const incoming=data.request&&((data.request.type==="mirror"&&data.modules.mirror)||(data.request.type==="communication"&&data.modules.communication))?data.request:null;
  const waitingPair=data.modules.communication?data.pairs.find(pair=>!pair.ready&&!pair.answered):undefined;
  const waitingInvitation=data.modules.communication&&(data.communicationInvites?.length??0)>0;
  const next:NextStep=incoming?{
    eyebrow:"SUA PARTICIPAÇÃO IMPORTA",title:incoming.type==="mirror"?"Seu time quer ouvir sua perspectiva.":"Uma conversa melhor começa com você.",
    body:incoming.type==="mirror"?"Responda ao convite do Espelho. Sua percepção individual fica protegida.":"Compare preferências e encontre acordos práticos para trabalhar melhor em dupla.",
    button:"Responder convite",view:incoming.type==="mirror"?"mirror":"communication",
  }:waitingPair||waitingInvitation?{
    eyebrow:"CONVERSA EM DUPLA",title:"Sua perspectiva está esperando por você.",
    body:waitingPair?.isCreator?"Você criou uma dupla e ainda não respondeu. Registre suas preferências para avançar.":"Alguém convidou você para uma comparação. Responda no seu tempo; o resultado aparece quando ambas as pessoas terminarem.",
    button:"Responder minha parte",view:"communication",
  }:openCycle?{
    eyebrow:"CICLO EM ANDAMENTO",title:openCycle.responseCount?"Ouça o time antes do próximo passo.":"Abra a escuta para o seu time.",
    body:openCycle.responseCount?"Seu Espelho recebeu "+openCycle.responseCount+" resposta"+(openCycle.responseCount===1?"":"s")+". Acompanhe a participação e prepare a conversa de devolutiva.":"O Espelho está aberto. Convide pessoas para compartilhar perspectivas e começar a conversa.",
    button:openCycle.responseCount?"Acompanhar ciclo":"Convidar para o Espelho",view:"mirror",
  }:canManage&&peopleCount<=1?{
    eyebrow:"CONSTRUA SEU TIME",title:"A liderança começa com uma conversa.",
    body:"Convide as pessoas para o mesmo espaço e abra caminhos para escuta, colaboração e desenvolvimento.",
    button:"Convidar meu time",view:"team",
  }:canLead&&data.modules.mirror?{
    eyebrow:"PRÓXIMO PASSO",title:latestCycle?"Transforme o que ouviu em ação.":"Comece ouvindo outras perspectivas.",
    body:latestCycle?"Revise o seu ciclo, escolha um comportamento para praticar e acompanhe o que muda.":"Inicie o Espelho do Líder para entender como seu time percebe seus comportamentos.",
    button:latestCycle?"Revisar meu ciclo":"Iniciar o Espelho",view:"mirror",
  }:data.modules.decisions?{
    eyebrow:"PRÓXIMO PASSO",title:"Pratique decisões com mais clareza.",
    body:"Explore situações reais de liderança e observe as consequências de cada escolha.",
    button:"Explorar cenários",view:"decisions",
  }:{
    eyebrow:"PRÓXIMO PASSO",title:"Escolha como quer evoluir hoje.",
    body:"Encontre uma experiência curta para refletir e aplicar no seu trabalho.",
    button:"Ver experiências",view:"experiences",
  };
  const series=activitySeries(data);
  const personalMetrics:Metric[]=[
    {label:"EXPERIÊNCIAS",value:series.total,detail:"Registros da sua jornada",view:"evolution",Icon:TrendingUp},
    ...(data.modules.decisions?[{label:"DECISÕES",value:data.runs.length,detail:"Cenários concluídos",view:"decisions" as View,Icon:Target}]:[]),
    ...(data.modules.communication?[{label:"CONVERSAS",value:data.pairs.length,detail:"Comparações iniciadas",view:"communication" as View,Icon:MessageCircleMore}]:[]),
    ...(data.modules.energy?[{label:"ENERGIA",value:data.energyEntries.length,detail:"Registros realizados",view:"energy" as View,Icon:Sparkles}]:[]),
    ...(data.modules.career?[{label:"CARREIRA",value:data.careerRuns.length,detail:"Reflexões concluídas",view:"career" as View,Icon:Target}]:[]),
  ];
  const teamActivity:Metric=data.modules.mirror
    ?{label:"CICLOS DO ESPELHO",value:data.companyStats?.mirrorCycles??0,detail:"Criados neste espaço",view:"mirror",Icon:Target}
    :data.modules.decisions
      ?{label:"DECISÕES DO TIME",value:data.companyStats?.decisionRuns??0,detail:"Cenários concluídos",view:"decisions",Icon:Target}
      :{label:"EXPERIÊNCIAS",value:series.total,detail:"Registros da sua jornada",view:"evolution",Icon:TrendingUp};
  const metrics:Metric[]=canManage?[
    {label:"PESSOAS NO ESPAÇO",value:peopleCount,detail:"Acessos ativos",view:"team",Icon:UsersRound},
    {label:"CONVITES PENDENTES",value:pendingCount,detail:"Aguardando aceite",view:"team",Icon:MessageCircleMore},
    teamActivity,
  ]:personalMetrics.slice(0,3);
  const focusTitle=canManage?pendingCount>0?`${pendingCount} convite${pendingCount===1?" aguarda":"s aguardam"} resposta.`:peopleCount>1?"Seu espaço está pronto para conversas melhores.":"Dê o primeiro passo com seu time.":openCycle?"Seu ciclo de escuta está aberto.":latestCycle?"Seu Espelho tem uma história para contar.":canLead&&data.modules.mirror?"Abra um espaço para escutar seu time.":"Evolua uma escolha de cada vez.";
  const focusBody=canManage?pendingCount>0?"Acompanhe quem já entrou e lembre o time de aceitar os convites. Depois, escolha uma experiência para conduzir juntos.":peopleCount>1?"Veja as pessoas do seu espaço e proponha uma experiência para ouvir perspectivas diferentes.":"Convide colegas para compartilhar o espaço e iniciar uma jornada de desenvolvimento em conjunto.":openCycle?openCycle.responseCount>=5?"Você já tem o mínimo de respostas. Ao encerrar o ciclo, poderá ver o resultado coletivo e escolher uma ação.":"Faltam "+(5-openCycle.responseCount)+" resposta"+(5-openCycle.responseCount===1?"":"s")+" para liberar a comparação coletiva após encerrar o ciclo.":latestCycle?"Revise seu ciclo e retome a ação escolhida para a prática.":canLead&&data.modules.mirror?"Responda primeiro sobre você. Depois convide pessoas do time para reunir perspectivas com privacidade.":"Use uma experiência curta para observar seu modo de decidir e conversar.";
  const focusView:View=canManage?"team":canLead&&data.modules.mirror?"mirror":data.modules.decisions?"decisions":"experiences";
  const practiceView:View=latestCycle?.action?"evolution":canLead&&data.modules.mirror?"mirror":data.modules.decisions?"decisions":"experiences";
  return <div className="lead-overview">
    <header className="lead-overview-header"><div><span className="kicker">{canLead?"PAINEL DE LIDERANÇA":"SUA JORNADA"}</span><h1>{greeting}, {firstName}<span>.</span></h1><p>Um lugar para ouvir melhor, decidir com clareza e transformar reflexão em prática.</p></div><div className="lead-company-tag"><UsersRound size={16}/><span>{data.company}</span></div></header>
    <div className="lead-overview-top"><section className="lead-hero"><div className="lead-hero-copy"><span className="kicker">{next.eyebrow}</span><h2>{next.title}</h2><p>{next.body}</p><Button onClick={()=>onNavigate(next.view)}>{next.button} <ArrowRight size={17}/></Button></div><div className="lead-hero-axis" aria-hidden="true"><span>OUVIR</span><i/><span>DECIDIR</span><i/><span>AGIR</span></div></section><aside className="lead-practice"><span className="kicker">PARA ESTA SEMANA</span><div className="lead-practice-icon"><Sparkles size={25}/></div><h2>{latestCycle?.action?"Sua ação em prática":"Leve uma pergunta para a próxima conversa"}</h2><p>{latestCycle?.action||"Pergunte a alguém do time: “O que eu poderia fazer para facilitar seu trabalho?”"}</p><button onClick={()=>onNavigate(practiceView)}>{latestCycle?.action?"Rever minha ação":canLead&&data.modules.mirror?"Abrir o Espelho":"Explorar experiência"} <ArrowRight size={16}/></button></aside></div>
    <nav className="lead-metrics" aria-label="Acessos rápidos e indicadores">{metrics.map(({label,value,detail,view,Icon})=><button key={label} onClick={()=>onNavigate(view)}><span className="lead-metric-icon"><Icon size={19}/></span><span className="lead-metric-copy"><small>{label}</small><strong>{value}</strong><span>{detail}</span></span><ArrowRight size={16} className="lead-metric-arrow"/></button>)}</nav>
    <section className="lead-focus"><div className="lead-focus-icon">{canManage?<UsersRound size={24}/>:openCycle?<BarChart3 size={24}/>:<ShieldCheck size={24}/>}</div><div className="lead-focus-copy"><span className="kicker">{canManage?"PESSOAS E CONVITES":openCycle?"ESPELHO DO LÍDER · EM ANDAMENTO":"LIDERANÇA NA PRÁTICA"}</span><h2>{focusTitle}</h2><p>{focusBody}</p>{openCycle&&!canManage&&<div className="lead-cycle-progress" aria-label={Math.min(openCycle.responseCount,5)+" de 5 respostas mínimas"}><span style={{width:Math.min(100,openCycle.responseCount/5*100)+"%"}}/></div>}</div><button onClick={()=>onNavigate(focusView)}>{canManage?"Ver meu time":openCycle?"Acompanhar ciclo":latestCycle?"Abrir meu Espelho":"Dar o próximo passo"} <ArrowRight size={16}/></button></section>
    <section className="lead-experiences"><div className="lead-section-heading"><div><span className="kicker">EXPLORE NO SEU RITMO</span><h2>{canLead?"Experiências para liderar melhor":"Experiências para evoluir"}</h2></div><button onClick={()=>onNavigate("experiences")}>Ver todas <ArrowRight size={16}/></button></div><ExperienceCards data={data} onNavigate={onNavigate} query={query} limit={3}/></section>
    <div className="lead-privacy-note"><CheckCircle2 size={17}/><span>Resultados individuais continuam protegidos. No Espelho, a comparação do time aparece apenas após cinco respostas e o encerramento do ciclo.</span></div>
  </div>;
}
