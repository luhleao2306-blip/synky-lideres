"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ChartNoAxesCombined, ClipboardList, Download, Search, ShieldCheck, UsersRound } from "lucide-react";
import { careerDilemmas } from "@/lib/additional-experiences";
import { communicationTopics, mirrorLabels, scenarios } from "@/lib/experiences";
import { moduleNames, type ModuleKey } from "@/lib/modules";

type Person = { id: string; name: string; email: string; role: string; companyId: string; companyName: string; kind: string };
type Detail = {
  subject: Person & { isOwn: boolean };
  mirrors: { id: string; status: string; createdAt: string; closedAt: string | null; selfScores: number[]; responseCount: number; teamScores: (number | null)[] | null; action: string | null; checkins: { id: string; note: string; entryDate: string }[] }[];
  decisions: { id: string; scenarioId: string; choices: number[]; createdAt: string; feedback: { moment: string; behavior: string; choice: string; consequence: string }[] | null }[];
  communication: { id: string; status: string; createdAt: string; creatorName: string; partnerName: string | null; partnerEmail: string; answered: boolean; ready: boolean; agreement: string | null; preferences: { person: string; values: number[] }[] | null }[];
  energy: { id: string; entryDate: string; activityType: string; activity: string; energy: number }[];
  energySummary: { total: number; categories: { type: string; count: number; average: number | null }[] };
  career: { id: string; choices: number[]; createdAt: string; priorities: { left: string; right: string; leftCount: number; rightCount: number; mixed: boolean }[] | null }[];
  thermometer: { id: string; createdAt: string; dimensions: number[]; rounds: { id: string; status: string; createdAt: string; responseCount: number; scores: (number | null)[] | null }[] }[];
  participation: { mirrorAnswers: number; thermometerAnswers: number };
};
type Directory = { total: number; offset: number; pageSize: number; people: Person[] };
type Section = ModuleKey | "all";
const keys: ModuleKey[] = ["mirror", "decisions", "communication", "energy", "career", "thermometer"];
const roleName: Record<string, string> = { admin: "Administrador", rh: "RH", leader: "Líder", participant: "Membro" };
const date = (value: string) => new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const energyLabel = (value: number) => value > 0 ? `+${value} · deu energia` : value < 0 ? `${value} · consumiu energia` : "0 · neutro";

export default function ResultsPanel({ isMaster, isGuest, companyId }: { isMaster: boolean; isGuest: boolean; companyId: string }) {
  const [directory, setDirectory] = useState<Directory | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (url: string, signal: AbortSignal) => {
    const response = await fetch(url, { cache: "no-store", signal });
    const body = await response.json() as { error?: string };
    if (!response.ok) throw new Error(body.error || "Não foi possível carregar os resultados.");
    return body;
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    if (!isMaster || selected) return;
    setLoading(true); setError("");
    load(`/api/results?scope=directory&q=${encodeURIComponent(query)}&offset=${offset}`, controller.signal)
      .then(body => setDirectory(body as Directory))
      .catch(err => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [isMaster, selected, query, offset, load]);
  useEffect(() => {
    const controller = new AbortController();
    if (isMaster && !selected) return;
    setLoading(true); setError("");
    const params = selected ? `member=${encodeURIComponent(selected)}` : `company=${encodeURIComponent(companyId)}`;
    load(`/api/results?${params}`, controller.signal)
      .then(body => setDetail(body as Detail))
      .catch(err => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [isMaster, selected, companyId, load]);
  const open = (person: Person) => { setSelected(person.id); setDetail(null); setSection("all"); };
  const back = () => { setSelected(null); setDetail(null); setError(""); };
  const counts: Record<ModuleKey, number> = detail ? { mirror: detail.mirrors.length, decisions: detail.decisions.length, communication: detail.communication.length, energy: detail.energy.length, career: detail.career.length, thermometer: detail.thermometer.length } : { mirror: 0, decisions: 0, communication: 0, energy: 0, career: 0, thermometer: 0 };
  const shown = (key: ModuleKey) => section === "all" || section === key;

  return <div className="results-page">
    <header className="results-hero">
      <div><span className="kicker">{isMaster ? "ADMINISTRAÇÃO MASTER" : "SEUS REGISTROS"}</span><h1>{isMaster ? "Resultados da plataforma." : "Meus resultados."}</h1><p>{isMaster ? "Consulte os resultados de cada pessoa em todos os espaços da Synky Líderes." : "Tudo o que você concluiu e registrou, organizado por experiência para revisitar quando quiser."}</p></div>
      <div className="results-hero-mark"><ChartNoAxesCombined size={30}/><span>{isMaster ? "Visão completa" : "Sua trajetória"}</span></div>
    </header>
    {isGuest && <div className="results-admin-access"><ShieldCheck size={20}/><span><strong>Administra a Synky Líderes?</strong><small>Entre com sua conta administrativa para consultar os resultados de todos os espaços.</small></span><a href="/signin-with-chatgpt?return_to=%2Fapp%3Fview%3Dresults" target="_top">Entrar <ArrowRight size={15}/></a></div>}
    {error && <div className="alert error-message" role="alert">{error}</div>}
    {isMaster && !selected ? <section className="results-directory">
      <div className="results-section-title"><div><span className="kicker">PESSOAS E ESPAÇOS</span><h2>Encontre um resultado</h2><p>Selecione uma pessoa para ver seu histórico e as respostas concluídas.</p></div><span className="results-count">{directory?.total ?? "—"} pessoa{directory?.total === 1 ? "" : "s"}</span></div>
      <form className="results-search" onSubmit={event => { event.preventDefault(); setOffset(0); setQuery(search.trim()); }}><Search size={18}/><input aria-label="Buscar por nome, e-mail ou empresa" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome, e-mail ou empresa"/><button type="submit">Buscar</button></form>
      {loading && !directory ? <div className="results-loading">Carregando pessoas…</div> : directory?.people.length ? <div className="results-person-list">{directory.people.map(person => <button key={person.id} className="results-person" onClick={() => open(person)}><span className="results-person-avatar">{person.name.charAt(0).toUpperCase()}</span><span className="results-person-info"><strong>{person.name}</strong><small>{person.email}</small><em>{person.companyName} · {roleName[person.role] || person.role}</em></span><span className="results-person-action">Ver resultados <ArrowRight size={16}/></span></button>)}</div> : <div className="results-empty"><UsersRound size={25}/><strong>Nenhuma pessoa encontrada.</strong><p>Tente outro nome, e-mail ou empresa.</p></div>}
      {!!directory?.total && directory.total > directory.pageSize && <div className="results-pagination"><button disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - 30))}>Anterior</button><span>{offset + 1}–{Math.min(offset + 30, directory.total)} de {directory.total}</span><button disabled={offset + 30 >= directory.total || loading} onClick={() => setOffset(offset + 30)}>Próxima</button></div>}
    </section> : <>
      {isMaster && <button className="results-back" onClick={back}><ArrowLeft size={17}/> Voltar para todas as pessoas</button>}
      {loading && !detail ? <div className="results-loading">Carregando resultados…</div> : detail && <>
        <div className="results-subject"><span className="results-subject-avatar">{detail.subject.name.charAt(0).toUpperCase()}</span><div><span className="kicker">{detail.subject.isOwn ? "SEU HISTÓRICO" : "HISTÓRICO INDIVIDUAL"}</span><h2>{detail.subject.name}</h2><p>{detail.subject.companyName} · {roleName[detail.subject.role] || detail.subject.role}{isMaster && !detail.subject.isOwn ? ` · ${detail.subject.email}` : ""}</p></div><button onClick={() => window.print()} aria-label="Imprimir resultados"><Download size={17}/> Salvar em PDF</button></div>
        <div className="results-metrics">{keys.map(key => <button key={key} className={section === key ? "active" : ""} onClick={() => setSection(key)}><small>{moduleNames[key]}</small><strong>{counts[key]}</strong><span>{counts[key] === 1 ? "registro" : "registros"}</span></button>)}</div>
        <div className="results-filter"><button className={section === "all" ? "active" : ""} onClick={() => setSection("all")}>Todas as experiências</button>{keys.map(key => <button key={key} className={section === key ? "active" : ""} onClick={() => setSection(key)}>{moduleNames[key]}</button>)}</div>
        {shown("mirror") && <section className="results-module"><ModuleHeader number="01" title="Espelho do Líder" count={counts.mirror}/>{detail.mirrors.length ? detail.mirrors.map(cycle => <article className="results-record" key={cycle.id}><div className="results-record-head"><span>{date(cycle.createdAt)}</span><b>{cycle.status === "closed" ? "Ciclo concluído" : "Em andamento"}</b></div><h3>Autoavaliação e percepção do time</h3><p>{cycle.responseCount} resposta{cycle.responseCount === 1 ? "" : "s"} do time. {cycle.teamScores ? "Média coletiva disponível." : "A média aparece após encerrar o ciclo com pelo menos 5 respostas válidas."}</p><div className="results-score-grid">{mirrorLabels.map((label, i) => <div key={label}><span>{label}</span><strong>{cycle.selfScores?.[i] ?? "—"}<small> / 5 você</small></strong><em>{cycle.teamScores?.[i] == null ? "Time: —" : `Time: ${cycle.teamScores[i]!.toFixed(1)}`}</em></div>)}</div>{cycle.action && <div className="results-note"><strong>Ação escolhida</strong><p>{cycle.action}</p></div>}{cycle.checkins.length > 0 && <div className="results-note"><strong>Práticas registradas</strong>{cycle.checkins.map(item => <p key={item.id}>{date(item.entryDate + "T12:00:00")} · {item.note}</p>)}</div>}</article>) : <Empty/>}<small className="results-privacy"><ShieldCheck size={15}/> Respostas individuais do time permanecem protegidas; são exibidas apenas médias com o mínimo de participantes.</small></section>}
        {shown("decisions") && <section className="results-module"><ModuleHeader number="02" title="Decisões Sob Pressão" count={counts.decisions}/>{detail.decisions.length ? detail.decisions.map(run => <article className="results-record" key={run.id}><div className="results-record-head"><span>{date(run.createdAt)}</span><b>Cenário concluído</b></div><h3>{scenarios.find(s => s.id === run.scenarioId)?.title || "Cenário de liderança"}</h3>{run.feedback?.map((item, index) => <div className="results-decision-step" key={index}><small>ETAPA {index + 1} · {item.moment}</small><strong>{item.behavior}</strong><p>Escolha: {item.choice}</p><span>{item.consequence}</span></div>)}</article>) : <Empty/>}</section>}
        {shown("communication") && <section className="results-module"><ModuleHeader number="03" title="Raio X da Comunicação" count={counts.communication}/>{detail.communication.length ? detail.communication.map(pair => <article className="results-record" key={pair.id}><div className="results-record-head"><span>{date(pair.createdAt)}</span><b>{pair.ready ? "Dupla concluída" : "Aguardando respostas"}</b></div><h3>{pair.creatorName} e {pair.partnerName || pair.partnerEmail}</h3><p>{pair.ready ? "As duas pessoas responderam e consentiram com a comparação." : pair.answered ? "Uma pessoa respondeu. A comparação aparece quando a outra terminar." : "Resposta pendente."}</p>{pair.preferences && <div className="results-compare">{communicationTopics.map((topic, i) => <div key={topic.label}><strong>{topic.label}</strong>{pair.preferences!.map((person, j) => <span key={j}>{person.person}: {topic.options[person.values[i]] || "—"}</span>)}</div>)}</div>}{pair.agreement && <div className="results-note"><strong>Acordo registrado</strong><p>{pair.agreement}</p></div>}</article>) : <Empty/>}</section>}
        {shown("energy") && <section className="results-module"><ModuleHeader number="04" title="Mapa de Energia" count={counts.energy}/>{detail.energy.length ? <><div className="results-energy-summary">{detail.energySummary.categories.map(item => <div key={item.type}><span>{item.type}</span><strong>{item.average == null ? "—" : item.average > 0 ? `+${item.average}` : item.average}</strong><small>{item.count} registro{item.count === 1 ? "" : "s"}</small></div>)}</div><div className="results-entry-list">{detail.energy.map(item => <div key={item.id}><span>{date(item.entryDate + "T12:00:00")}</span><strong>{item.activity}</strong><small>{item.activityType}</small><em className={item.energy < 0 ? "negative" : ""}>{energyLabel(item.energy)}</em></div>)}</div></> : <Empty/>}</section>}
        {shown("career") && <section className="results-module"><ModuleHeader number="05" title="Bússola de Carreira" count={counts.career}/>{detail.career.length ? detail.career.map(run => <article className="results-record" key={run.id}><div className="results-record-head"><span>{date(run.createdAt)}</span><b>Reflexão concluída</b></div><h3>Prioridades nas escolhas</h3><div className="results-career-axes">{run.priorities?.map((axis, i) => <div key={i}><strong>{axis.left} <span>ou</span> {axis.right}</strong><p>{axis.leftCount} escolha{axis.leftCount === 1 ? "" : "s"} por {axis.left.toLowerCase()} · {axis.rightCount} por {axis.right.toLowerCase()}</p></div>)}</div><details><summary>Ver as 8 respostas</summary><ol>{run.choices?.map((choice, i) => <li key={i}><strong>{careerDilemmas[i]?.question}</strong><p>{careerDilemmas[i]?.options[choice] || "—"}</p></li>)}</ol></details></article>) : <Empty/>}</section>}
        {shown("thermometer") && <section className="results-module"><ModuleHeader number="06" title="Termômetro de Liderança" count={counts.thermometer}/>{detail.thermometer.length ? detail.thermometer.map(track => <article className="results-record" key={track.id}><div className="results-record-head"><span>Iniciado em {date(track.createdAt)}</span><b>{track.rounds.length} rodada{track.rounds.length === 1 ? "" : "s"}</b></div><h3>Acompanhamento do time</h3><div className="results-rounds">{track.rounds.map((round, index) => <div key={round.id}><strong>Rodada {index + 1} · {date(round.createdAt)}</strong><small>{round.responseCount} resposta{round.responseCount === 1 ? "" : "s"} · {round.status === "closed" ? "encerrada" : "aberta"}</small>{track.dimensions.map((dimension, i) => <p key={dimension}>{mirrorLabels[dimension]}: <b>{round.scores?.[i] == null ? "Aguardando 5 respostas e encerramento" : `${round.scores[i]!.toFixed(1)} / 5`}</b></p>)}</div>)}</div></article>) : <Empty/>}</section>}
        {(section === "all" || section === "mirror" || section === "thermometer") && (detail.participation.mirrorAnswers > 0 || detail.participation.thermometerAnswers > 0) && <div className="results-participation"><ClipboardList size={20}/><span><strong>Participação em avaliações</strong><small>{detail.participation.mirrorAnswers} resposta{detail.participation.mirrorAnswers === 1 ? "" : "s"} no Espelho · {detail.participation.thermometerAnswers} no Termômetro. Suas avaliações individuais não são mostradas aqui.</small></span></div>}
      </>}
    </>}
  </div>;
}

function ModuleHeader({ number, title, count }: { number: string; title: string; count: number }) { return <div className="results-module-head"><span>{number}</span><h2>{title}</h2><small>{count} {count === 1 ? "registro" : "registros"}</small></div>; }
function Empty() { return <div className="results-module-empty">Ainda não há resultados nesta experiência.</div>; }
