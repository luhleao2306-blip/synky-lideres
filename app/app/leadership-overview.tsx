"use client";
import { lazy, Suspense } from "react";
import { ArrowRight, CheckCheck, Compass, MessageCircleMore, RefreshCw, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { ExperienceCards, type View } from "./overview-dashboard";
import { activityEvents, type PanelData } from "./panel-data";

type Step = { title: string; detail: string; action: string; view: View; count?: number };
const PanelInsights = lazy(() => import("./panel-insights"));

export default function LeadershipOverview({ data, onNavigate, onOpenMirror, onRefresh, updating = false, query = "" }: { data: PanelData; onNavigate: (view: View) => void; onOpenMirror: (id: string) => void; onRefresh: () => void; updating?: boolean; query?: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = data.name.trim().split(" ")[0] || "líder";
  const canLead = ["admin", "rh", "leader"].includes(data.role);
  const canManage = ["admin", "rh"].includes(data.role);
  const openCycles = data.modules.mirror ? data.mirrors.filter(cycle => cycle.status === "open") : [];
  const openCycle = openCycles[0];
  const actionCycle = data.modules.mirror ? data.mirrors.find(cycle => cycle.action) : undefined;
  const invitedPairIds = new Set(data.communicationInvites?.map(invite => invite.reference_id));
  const pendingPairs = data.modules.communication ? data.pairs.filter(pair => !pair.ready && !pair.answered && !invitedPairIds.has(pair.id)) : [];
  const communicationInvites = data.modules.communication ? Math.max(data.communicationInvites?.length || 0, data.request?.type === "communication" && !pendingPairs.length ? 1 : 0) : 0;
  const mirrorInvites = data.modules.mirror ? Math.max(data.mirrorInviteCount, data.request?.type === "mirror" ? 1 : 0) : 0;
  const thermometerRequests = data.modules.thermometer ? data.thermometerRequestCount : 0;
  const pendingMembers = canManage ? data.pendingInvites?.length || 0 : 0;
  const steps: Step[] = [
    ...(mirrorInvites ? [{ title: "Sua perspectiva faz diferença", detail: "Há convites de escuta aguardando sua participação.", action: "Responder", view: "mirror" as View, count: mirrorInvites }] : []),
    ...(pendingPairs.length + communicationInvites ? [{ title: "Continue uma conversa em dupla", detail: "Registre suas preferências para avançar na comparação.", action: "Participar", view: "communication" as View, count: pendingPairs.length + communicationInvites }] : []),
    ...(thermometerRequests ? [{ title: "O time quer acompanhar a prática", detail: "Responda aos comportamentos do acompanhamento.", action: "Responder", view: "thermometer" as View, count: thermometerRequests }] : []),
    ...(openCycles.length ? [{ title: "Acompanhe os ciclos de escuta", detail: "Convide pessoas e acompanhe as respostas recebidas.", action: "Abrir ciclos", view: "mirror" as View, count: openCycles.length }] : []),
    ...(pendingMembers ? [{ title: "Convites para o seu espaço", detail: "Consulte os links e quem ainda está aguardando aceite.", action: "Ver convites", view: "team" as View, count: pendingMembers }] : []),
  ];
  const next: Step = steps[0] || (actionCycle ? { title: "Dê continuidade à ação que escolheu.", detail: actionCycle.action!, action: "Registrar minha prática", view: "mirror" } : canLead && data.modules.mirror ? { title: "Uma boa liderança começa pela escuta.", detail: "Olhe para seus comportamentos e convide o time a compartilhar outras perspectivas.", action: "Iniciar meu ciclo de escuta", view: "mirror" } : data.modules.decisions ? { title: "Abra espaço para uma escolha consciente.", detail: "Pratique uma situação de trabalho e observe as consequências de cada caminho.", action: "Praticar uma decisão", view: "decisions" } : { title: "Encontre seu próximo passo.", detail: "Escolha uma atividade que faça sentido para o momento que você vive.", action: "Explorar experiências", view: "experiences" });
  const total = activityEvents(data).length;
  const practiceCount = data.modules.mirror ? data.mirrors.reduce((sum, cycle) => sum + cycle.checkinCount, 0) : 0;
  const metrics = [
    ...(canManage && data.companyStats ? [{ label: "Pessoas no espaço", value: data.companyStats.people, detail: "Acessos ativos", view: "team" as View, Icon: UsersRound }] : [{ label: "Registros disponíveis", value: total, detail: "Seu histórico pessoal", view: "evolution" as View, Icon: Compass }]),
    { label: "Práticas registradas", value: practiceCount, detail: "Ações após o Espelho", view: data.modules.mirror ? "mirror" as View : "evolution" as View, Icon: CheckCheck },
    { label: "Pendências para você", value: mirrorInvites + pendingPairs.length + communicationInvites + thermometerRequests, detail: "Convites e participações", view: steps.find(step => ["mirror", "communication", "thermometer"].includes(step.view))?.view || "experiences" as View, Icon: MessageCircleMore },
  ];
  return <div className="leader-home">
    <header className="panel-welcome"><div><span className="panel-eyebrow"><i/>{greeting}, {firstName}</span><h1>Sua liderança,<br/><em>em movimento.</em></h1><p>Um espaço para escutar, agir e acompanhar o que você coloca em prática.</p></div><div className="panel-welcome-meta"><span>{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span><button onClick={onRefresh} disabled={updating} aria-label="Atualizar dados do painel"><RefreshCw size={15} className={updating ? "panel-spinning" : ""}/>{updating ? "Atualizando…" : "Atualizar dados"}</button></div></header>
    <div className="panel-launch-grid"><section className="panel-focus"><div className="panel-focus-top"><span className="panel-eyebrow">SEU PRÓXIMO MOVIMENTO</span><span className="panel-focus-symbol"><Compass size={25}/></span></div><h2>{next.title}</h2><p>{next.detail}</p><button className="panel-bright-button" onClick={() => actionCycle && !steps.length ? onOpenMirror(actionCycle.id) : next.view === "mirror" && openCycle && !mirrorInvites ? onOpenMirror(openCycle.id) : onNavigate(next.view)}>{next.action}<span><ArrowRight size={19}/></span></button><div className="panel-focus-foot"><span><ShieldCheck size={14}/>No seu ritmo. Com contexto.</span>{openCycle && <span>{openCycle.responseCount} respostas no ciclo aberto</span>}</div></section><nav className="panel-metric-stack" aria-label="Indicadores e atalhos">{metrics.map(({ label, value, detail, view, Icon }) => <button key={label} onClick={() => onNavigate(view)}><span className="panel-metric-icon"><Icon size={21}/></span><span className="panel-metric-copy"><small>{label}</small><strong>{value}</strong><span>{detail}</span></span><ArrowRight size={17}/></button>)}</nav></div>
    <div className="panel-middle-grid"><Suspense fallback={<section className="panel-insights panel-chart-empty" role="status">Preparando seus indicadores…</section>}><PanelInsights data={data} onNavigate={onNavigate} onOpenMirror={onOpenMirror}/></Suspense><aside className="panel-next"><div className="panel-section-label"><span className="panel-eyebrow">DA REFLEXÃO À AÇÃO</span><Sparkles size={18}/></div><h2>Cuide do próximo passo.</h2>{steps.length ? <div className="panel-step-list">{steps.map(step => <button key={step.title} onClick={() => onNavigate(step.view)}><span className="panel-step-count">{step.count}</span><span><strong>{step.title}</strong><small>{step.detail}</small><b>{step.action} <ArrowRight size={14}/></b></span></button>)}</div> : <div className="panel-clear"><CheckCheck size={25}/><h3>Sem participações pendentes.</h3><p>Quando houver um convite ou ciclo aberto, seu próximo passo aparecerá aqui.</p></div>}<div className="panel-current-action"><span className="panel-eyebrow">{actionCycle ? "SUA AÇÃO ESCOLHIDA" : "UM ESPAÇO PARA PRATICAR"}</span><h3>{actionCycle ? "Leve a escuta para o trabalho." : "Pequenas ações também contam."}</h3><p>{actionCycle?.action || "Escolha uma situação, reflita sobre o que aconteceu e retome seus registros quando precisar."}</p><button className="panel-text-link" onClick={() => actionCycle ? onOpenMirror(actionCycle.id) : onNavigate("experiences")}>{actionCycle ? "Registrar prática" : "Escolher uma atividade"}<ArrowRight size={16}/></button></div></aside></div>
    <section className="panel-explore"><div className="panel-explore-heading"><div><span className="panel-eyebrow">FERRAMENTAS PARA SUA LIDERANÇA</span><h2>Comece pelo que faz sentido hoje.</h2></div><button className="panel-text-link" onClick={() => onNavigate("experiences")}>Todas as experiências<ArrowRight size={17}/></button></div><ExperienceCards data={data} onNavigate={onNavigate} query={query} limit={3}/></section>
    <footer className="panel-home-foot"><ShieldCheck size={16}/><p>O Espelho e o Termômetro mostram percepções agregadas apenas com cinco respostas válidas e o encerramento do ciclo ou rodada. A comparação em dupla exige consentimento de ambas as pessoas.</p></footer>
  </div>;
}
