"use client";

import { useCallback, useEffect, useState } from "react";
import BrandLogo from "@/components/brand-logo";
import ResultsPanel from "@/app/app/results-panel";
import { ArrowDownRight, ArrowLeft, ArrowRight, Building2, CalendarDays, GraduationCap, History, LayoutDashboard, LogOut, RefreshCw, Search, ShieldCheck, UsersRound } from "lucide-react";

type AdminData = {
  totals: { spaces: number; organizations: number; people: number; pendingInvites: number };
  companies: { id: string; name: string; kind: string; createdAt: string; people: number }[];
  clients: { id: string; name: string; email: string; role: string; companyId: string; companyName: string; kind: string; companyCreatedAt: string }[];
  events: { eventType: string; eventAt: string; person: string; company: string }[];
  total: number; offset: number; pageSize: number; generatedAt: string;
  capabilities: { feedback: string; courses: string; logs: string };
};
type Tab = "overview" | "clients" | "activity";
const dateTime = (value: string) => new Date(value).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });

export default function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<AdminData | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin?q=${encodeURIComponent(search)}&offset=${offset}`, { cache: "no-store" });
      const body = await response.json() as AdminData & { error?: string };
      if (!response.ok) throw new Error(body.error || "Não foi possível carregar a administração.");
      setData(body as AdminData);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha de conexão."); }
    finally { setBusy(false); }
  }, [offset, search]);
  useEffect(() => { void load(); }, [load]);

  return <main className="admin-shell">
    <a className="admin-skip" href="#admin-content">Pular para o conteúdo</a>
    <header className="admin-topbar">
      <a className="admin-brand" href="/" aria-label="Synky Líderes"><BrandLogo/></a>
      <span className="admin-brand-divider"/>
      <span className="admin-area-label"><ShieldCheck size={16}/> Central da plataforma</span>
      <div className="admin-account"><span className="admin-account-dot"/><span><b>Administrador</b><small>{adminEmail}</small></span><a aria-label="Sair" href="/signout-with-chatgpt?return_to=%2F" title="Sair"><LogOut size={17}/></a></div>
    </header>
    <section className="admin-intro"><div><span className="admin-eyebrow">SYNKY LÍDERES · ACESSO RESTRITO</span><h1>Uma visão cuidadosa<br/>de toda a plataforma.</h1><p>Acompanhe espaços, pessoas e atividades registradas, com os limites de privacidade do produto preservados.</p></div><div className="admin-intro-art"><div className="admin-orbit admin-orbit-one"/><div className="admin-orbit admin-orbit-two"/><span><ShieldCheck size={33}/></span><small>Dados protegidos<br/>por acesso administrativo</small></div></section>
    <nav className="admin-tabs" aria-label="Seções administrativas">
      <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><LayoutDashboard size={17}/> Visão geral</button>
      <button className={tab === "clients" ? "active" : ""} onClick={() => setTab("clients")}><UsersRound size={17}/> Clientes e resultados</button>
      <button className={tab === "activity" ? "active" : ""} onClick={() => setTab("activity")}><History size={17}/> Atividade registrada</button>
      <button className="admin-refresh" onClick={() => void load()} disabled={busy}><RefreshCw size={16} className={busy ? "spinning" : ""}/> Atualizar</button>
    </nav>
    <div id="admin-content" className="admin-content" aria-live="polite">
      {error && <div className="admin-error" role="alert"><strong>Não foi possível atualizar.</strong> {error}<button onClick={() => void load()}>Tentar novamente</button></div>}
      {tab === "overview" && <>
        <div className="admin-section-heading"><div><span className="admin-eyebrow">PANORAMA</span><h2>O que está acontecendo</h2></div><span className="admin-updated">{data ? `Atualizado ${dateTime(data.generatedAt)}` : "Carregando dados…"}</span></div>
        <div className="admin-metrics">
          <Metric icon={<Building2/>} label="Espaços" value={data?.totals.spaces} detail={`${data?.totals.organizations ?? "—"} organizacionais`}/>
          <Metric icon={<UsersRound/>} label="Pessoas cadastradas" value={data?.totals.people} detail="Vínculos registrados nos espaços"/>
          <Metric icon={<ArrowDownRight/>} label="Convites pendentes" value={data?.totals.pendingInvites} detail="Ainda não utilizados e válidos"/>
          <Metric icon={<CalendarDays/>} label="Ações recentes" value={data?.events.length} detail="Eventos registrados no produto"/>
        </div>
        <div className="admin-overview-grid">
          <section className="admin-card"><div className="admin-card-heading"><div><span className="admin-eyebrow">CONTAS ORGANIZACIONAIS E PESSOAIS</span><h2>Espaços recentes</h2></div><button onClick={() => setTab("clients")}>Ver clientes <ArrowRight size={15}/></button></div>{busy && !data ? <Loading/> : data?.companies.length ? <div className="admin-company-list">{data.companies.map(company => <article key={company.id}><span className="admin-company-icon"><Building2 size={18}/></span><div><strong>{company.name}</strong><small>{company.kind === "organization" ? "Organização" : "Espaço pessoal"} · {company.people} pessoa{company.people === 1 ? "" : "s"}</small></div><time>{new Date(company.createdAt).toLocaleDateString("pt-BR")}</time></article>)}</div> : <Empty text="Ainda não há espaços cadastrados na base atual."/>}</section>
          <section className="admin-card admin-capabilities"><div className="admin-card-heading"><div><span className="admin-eyebrow">TRANSPARÊNCIA</span><h2>Dados disponíveis</h2></div><ShieldCheck size={20}/></div><Capability icon={<History/>} title="Feedback" text={data?.capabilities.feedback}/><Capability icon={<GraduationCap/>} title="Cursos" text={data?.capabilities.courses}/><Capability icon={<ShieldCheck/>} title="Logs" text={data?.capabilities.logs}/></section>
        </div>
        <section className="admin-card admin-recent"><div className="admin-card-heading"><div><span className="admin-eyebrow">REGISTROS DO SISTEMA</span><h2>Atividade recente</h2></div><button onClick={() => setTab("activity")}>Ver atividades <ArrowRight size={15}/></button></div><Events events={data?.events.slice(0, 6) || []} loading={busy && !data}/></section>
      </>}
      {tab === "clients" && <section className="admin-results"><div className="admin-section-heading"><div><span className="admin-eyebrow">ACESSO INDIVIDUAL</span><h2>Clientes e resultados</h2><p>Busque uma pessoa e consulte os registros que o sistema permite visualizar.</p></div></div><ResultsPanel isMaster isGuest={false} companyId=""/></section>}
      {tab === "activity" && <section className="admin-card admin-activity"><div className="admin-section-heading"><div><span className="admin-eyebrow">EVENTOS REGISTRADOS NOS DADOS DO PRODUTO</span><h2>Atividade recente</h2><p>Eventos que já são gravados como parte das experiências da plataforma.</p></div></div><Events events={data?.events || []} loading={busy && !data}/></section>}
    </div>
    <footer className="admin-footer"><span>Synky Líderes <i/> Administração</span><span>Última consulta sempre protegida e sem cache.</span></footer>
  </main>;
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value?: number; detail: string }) { return <article className="admin-metric"><span className="admin-metric-icon">{icon}</span><span className="admin-eyebrow">{label}</span><strong>{value ?? "—"}</strong><small>{detail}</small></article>; }
function Capability({ icon, title, text }: { icon: React.ReactNode; title: string; text?: string }) { return <div className="admin-capability"><span>{icon}</span><div><strong>{title}</strong><p>{text || "Verificando disponibilidade…"}</p></div></div>; }
function Events({ events, loading }: { events: AdminData["events"]; loading: boolean }) { if (loading) return <Loading/>; if (!events.length) return <Empty text="Nenhuma atividade registrada até agora."/>; return <div className="admin-events">{events.map((event, index) => <article key={`${event.eventAt}-${event.eventType}-${index}`}><span className="admin-event-dot"/><div><strong>{event.eventType}</strong><p>{event.person} <i>em</i> {event.company}</p></div><time>{dateTime(event.eventAt)}</time></article>)}</div>; }
function Loading() { return <div className="admin-loading"><span/> Buscando dados do sistema…</div>; }
function Empty({ text }: { text: string }) { return <div className="admin-empty">{text}</div>; }
