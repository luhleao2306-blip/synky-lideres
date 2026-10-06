"use client";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { ArrowRight, BookOpen, Check, ChevronDown, Download, FileCheck2, GraduationCap, LayoutDashboard, Library, LockKeyhole, Menu, RefreshCw, ShieldCheck, TrendingUp, X } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import JourneyWorkspace from "./journey-workspace";
import type { PanelView } from "./journey-model";
import { allStudyLessons, FINAL_QUIZ_ID, studyQuiz } from "./academy-curriculum";
import { quizUnlocked, scoreStudyQuiz, studyStorageKey, type StudyAttempt } from "./academy-model";
import useAcademyProgress from "./use-academy-progress";
import { StudyActivities, StudyButton, StudyClassroom, StudyCourses, StudyGrades, StudyHome, StudyLibrary, StudyQuizRoom, type StudyActions } from "./academy-views";
import "./academy.css";

const tabs = [
  { view: "overview", label: "Visão geral", icon: LayoutDashboard },
  { view: "courses", label: "Minha trilha", icon: GraduationCap },
  { view: "activities", label: "Atividades", icon: FileCheck2 },
  { view: "assessments", label: "Prova final", icon: Check },
  { view: "grades", label: "Meu desempenho", icon: TrendingUp },
  { view: "library", label: "Biblioteca", icon: Library },
] as const;
const learningViews = new Set<PanelView>(["overview", "courses", "classroom", "activities", "assessments", "grades", "library"]);
const previousViews: { view: PanelView; label: string }[] = [{ view: "starting", label: "Meu ponto de partida" }, { view: "diagnosis", label: "Reflexão pessoal" }, { view: "plan", label: "Meu plano de prática" }, { view: "exercises", label: "Exercícios da jornada" }, { view: "journal", label: "Diário de prática" }, { view: "review", label: "Revisão de progresso" }];
const toolViews: { view: PanelView; label: string }[] = [{ view: "experiences", label: "Experiências conectadas" }, { view: "evolution", label: "Histórico das experiências" }, { view: "results", label: "Meus resultados" }];
function query(name: string) { return typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get(name) || ""; }
function downloadFile(text: string, name: string, type: string) { const url = URL.createObjectURL(new Blob([text], { type })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }

export default function LeaderAcademy(props: ComponentProps<typeof JourneyWorkspace>) {
  const store = useAcademyProgress(studyStorageKey(props.companyId, props.memberId));
  const { progress } = store;
  const [lessonId, setLessonId] = useState(() => query("lesson")), [quizId, setQuizId] = useState(() => query("quiz"));
  const [mobile, setMobile] = useState(false), [message, setMessage] = useState("");
  const [exportFeedback, setExportFeedback] = useState("");
  const [exportPreview, setExportPreview] = useState<{ text: string; name: string; type: string } | null>(null);
  const exportRef = useRef<HTMLDialogElement>(null), exportTextRef = useRef<HTMLTextAreaElement>(null);
  const accountRef = useRef<HTMLDetailsElement>(null), mainRef = useRef<HTMLElement>(null);
  const learning = learningViews.has(props.view), canLead = ["admin", "rh", "leader"].includes(props.role);
  const activeTab = props.view === "classroom" ? "courses" : props.view;
  useEffect(() => { const changed = () => { setLessonId(query("lesson")); setQuizId(query("quiz")); setMobile(false); }; window.addEventListener("popstate", changed); const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") { setMobile(false); if (accountRef.current) accountRef.current.open = false; } }; window.addEventListener("keydown", keyboard); return () => { window.removeEventListener("popstate", changed); window.removeEventListener("keydown", keyboard); }; }, []);
  useEffect(() => { if (!message) return; const timer = window.setTimeout(() => setMessage(""), 6000); return () => window.clearTimeout(timer); }, [message]);
  useEffect(() => {
    if (!exportPreview || !exportRef.current) return;
    const dialog = exportRef.current, previous = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); if (previous instanceof HTMLElement) previous.focus(); };
  }, [exportPreview]);
  function prepareExport(text: string, name: string, type: string) {
    setExportFeedback(""); setExportPreview({ text, name, type });
  }
  function go(view: PanelView, params: Record<string, string> = {}) {
    setMobile(false); setMessage(""); if (accountRef.current) accountRef.current.open = false;
    props.navigate(view);
    const target = new URL(window.location.href); ["lesson", "quiz"].forEach(key => target.searchParams.delete(key)); Object.entries(params).forEach(([key, value]) => target.searchParams.set(key, value)); window.history.replaceState(null, "", target.pathname + target.search);
    setLessonId(params.lesson || ""); setQuizId(params.quiz || "");
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    window.setTimeout(() => mainRef.current?.focus({ preventScroll: true }), 0);
  }
  const actions: StudyActions = {
    lesson: id => go("classroom", { lesson: id }),
    quiz: id => go(id === FINAL_QUIZ_ID ? "assessments" : "activities", { quiz: id }),
    courses: () => go("courses"),
    mark: id => { if (!allStudyLessons.some(lesson => lesson.id === id)) return; if (store.update(value => ({ ...value, studied: [...new Set([...value.studied, id])] }))) setMessage("Aula marcada como estudada. Seu próximo passo está na trilha."); },
    bookmark: id => { if (!allStudyLessons.some(lesson => lesson.id === id)) return; store.update(value => ({ ...value, bookmarks: value.bookmarks.includes(id) ? value.bookmarks.filter(item => item !== id) : [...value.bookmarks, id] })); },
    answer: (id, answers) => { if (quizUnlocked(progress, id)) { const changes = Object.fromEntries(Object.entries(answers).filter(([question, value]) => progress.drafts[id]?.[question] !== value)); store.update(value => ({ ...value, drafts: { ...value.drafts, [id]: { ...value.drafts[id], ...changes } } })); } },
    submit: (id, answers) => {
      if (!quizUnlocked(progress, id)) { setMessage("Complete os estudos e atividades indicados antes de enviar esta avaliação."); return null; }
      const attempt: StudyAttempt = { id: crypto.randomUUID(), quizId: id, at: new Date().toISOString(), answers: { ...answers }, questionIds: studyQuiz(id)!.questions.map(question => question.id), ...scoreStudyQuiz(id, answers) };
      let accepted = false;
      const updated = store.update(value => { if (!quizUnlocked(value, id) || value.attempts.length >= 1000) return value; accepted = true; const drafts = { ...value.drafts }; delete drafts[id]; return { ...value, drafts, attempts: [...value.attempts, attempt] }; });
      if (!updated || !accepted) { setMessage("Não foi possível registrar a tentativa. Confira o aviso de armazenamento e exporte uma cópia se necessário."); return null; }
      return attempt;
    },
    export: format => {
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "json") prepareExport(JSON.stringify({ product: "Synky Líderes · estudos", exportedAt: new Date().toISOString(), progress }, null, 2), `synky-lideres-estudos-${stamp}.json`, "application/json");
      else { const cell = (value: string) => `"${value.replace(/"/g, '""')}"`; const rows = [["Avaliação", "Data", "Acertos", "Questões", "Nota (0 a 10)"], ...progress.attempts.map(attempt => [studyQuiz(attempt.quizId)?.title || attempt.quizId, new Date(attempt.at).toLocaleString("pt-BR"), String(attempt.correct), String(attempt.total), String(attempt.grade).replace(".", ",")])]; prepareExport("\uFEFF" + rows.map(row => row.map(cell).join(";")).join("\r\n"), `synky-lideres-notas-${stamp}.csv`, "text/csv;charset=utf-8"); }
      setMessage("Exportação pronta. Baixe o arquivo ou copie o conteúdo da prévia.");
    },
  };
  const accountItem = (view: PanelView, label: string) => <button key={view} aria-current={props.view === view ? "page" : undefined} onClick={() => go(view)}>{label}<ArrowRight size={14}/></button>;
  return <div className="academy-shell"><a href="#academy-main" className="ac-skip">Ir para o conteúdo</a><header className="ac-header"><div className="ac-top-inner"><a className="ac-brand" href="/" aria-label="Synky Líderes, página inicial"><BrandLogo/></a><span className="ac-brand-caption">Aprender para<br/><b>liderar melhor.</b></span><div className="ac-header-right">{props.memberships.length > 1 ? <label className="ac-space"><span>Meu espaço</span><select aria-label="Selecionar espaço" value={props.companyId} disabled={props.busy || props.refreshing} onChange={event => props.selectCompany(event.target.value)}>{props.memberships.map(item => <option key={item.companyId} value={item.companyId}>{item.companyName}</option>)}</select></label> : <span className="ac-space-name">{props.companyName}</span>}<button className="ac-icon-button ac-refresh" disabled={props.busy || props.refreshing} onClick={props.refresh} aria-label="Atualizar ferramentas conectadas"><RefreshCw size={17} className={props.refreshing ? "ac-spin" : ""}/></button><details className="ac-account" ref={accountRef}><summary><span className="ac-avatar">{props.name.charAt(0).toUpperCase()}</span><span><b>{props.name.split(" ")[0]}</b><small>Meu espaço de liderança</small></span><ChevronDown size={15}/></summary><div className="ac-account-menu">{props.memberships.length > 1 && <label className="ac-mobile-space"><span>Selecionar espaço</span><select aria-label="Selecionar espaço no celular" value={props.companyId} disabled={props.busy || props.refreshing} onChange={event => props.selectCompany(event.target.value)}>{props.memberships.map(item => <option key={item.companyId} value={item.companyId}>{item.companyName}</option>)}</select></label>}<span className="ac-menu-label">CONTA E FERRAMENTAS</span>{accountItem("settings", "Minha conta e espaço")}{canLead && accountItem("team", "Pessoas e convites")}{props.platformAdmin && accountItem("platform", "Empresas")}{props.platformAdmin && <a className="ac-account-item" href="/admin"><ShieldCheck size={16}/> Administração master</a>}{toolViews.map(item => accountItem(item.view, item.label))}<span className="ac-menu-label">MINHA JORNADA PESSOAL</span>{previousViews.map(item => accountItem(item.view, item.label))}</div></details><button className="ac-mobile-trigger ac-icon-button" aria-label={mobile ? "Fechar navegação" : "Abrir navegação"} aria-expanded={mobile} aria-controls="academy-navigation" onClick={() => setMobile(!mobile)}>{mobile ? <X size={23}/> : <Menu size={23}/>}</button></div></div><nav id="academy-navigation" className={`ac-navigation ${mobile ? "open" : ""}`} aria-label="Navegação do painel"><div>{tabs.map(item => <button key={item.view} onClick={() => go(item.view)} aria-current={activeTab === item.view ? "page" : undefined}><item.icon size={17}/>{item.label}</button>)}</div><span className="ac-navigation-note"><BookOpen size={14}/> Aprendizado que vira prática</span></nav></header>
    <main id="academy-main" className="ac-main" ref={mainRef} tabIndex={-1}>{learning && props.systemError && <div className="ac-alert error" role="alert">{props.systemError}</div>}{learning && props.systemNotice && <div className="ac-alert" role="status">{props.systemNotice}</div>}{message && <div className="ac-alert" role="status"><Check size={17}/><span>{message}</span><button className="ac-icon-button" aria-label="Fechar aviso" onClick={() => setMessage("")}><X size={16}/></button></div>}{learning && store.error && <section className="ac-alert error" role="alert"><div><b>Confira seu armazenamento</b><p>{store.error}</p></div><div className="ac-actions"><StudyButton secondary onClick={store.blocked ? store.load : store.retry}>{store.blocked ? "Carregar novamente" : "Tentar salvar"}</StudyButton><StudyButton secondary onClick={() => actions.export("json")}><Download size={16}/> Exportar esta aba</StudyButton></div></section>}
      {learning ? store.loading ? <div className="ac-empty" role="status"><span className="ac-loading-icon"><BookOpen size={30}/></span><h1>Preparando seus estudos…</h1></div> : <div className="ac-page-enter" key={`${props.view}:${lessonId}:${quizId}`}>
        {props.view === "overview" && <StudyHome name={props.name} {...{ progress, actions }}/>} {props.view === "courses" && <StudyCourses {...{ progress, actions }}/>} {props.view === "classroom" && <StudyClassroom {...{ lessonId, progress, actions }}/>} {props.view === "activities" && (quizId ? <StudyQuizRoom key={quizId} {...{ quizId, progress, actions }}/> : <StudyActivities {...{ progress, actions }}/>)} {props.view === "assessments" && <StudyQuizRoom key={FINAL_QUIZ_ID} quizId={FINAL_QUIZ_ID} {...{ progress, actions }}/>} {props.view === "grades" && <StudyGrades {...{ progress, actions }}/>} {props.view === "library" && <StudyLibrary {...{ progress, actions }}/>} </div> : <div className="ac-existing-workspace"><JourneyWorkspace {...props} navigate={go}/></div>}
    </main>{exportPreview && <dialog className="ac-export-dialog" ref={exportRef} aria-labelledby="ac-export-title" onCancel={() => setExportPreview(null)}><header><div><span className="ac-eyebrow">SEU REGISTRO DE APRENDIZAGEM</span><h2 id="ac-export-title">Exportar {exportPreview.name.endsWith(".csv") ? "notas" : "progresso"}</h2></div><button className="ac-icon-button" aria-label="Fechar exportação" onClick={() => setExportPreview(null)}><X size={20}/></button></header><p>Baixe o arquivo ou copie o conteúdo abaixo. Essa alternativa também funciona quando o navegador bloqueia downloads.</p><label htmlFor="ac-export-text">{exportPreview.name}</label><textarea id="ac-export-text" ref={exportTextRef} readOnly value={exportPreview.text} spellCheck={false}/><div className="ac-actions"><StudyButton onClick={() => downloadFile(exportPreview.text, exportPreview.name, exportPreview.type)}><Download size={16}/> Baixar arquivo</StudyButton><StudyButton secondary onClick={async () => { try { await navigator.clipboard.writeText(exportPreview.text); setExportFeedback("Conteúdo copiado para a área de transferência."); } catch { exportTextRef.current?.focus(); exportTextRef.current?.select(); setExportFeedback("Conteúdo selecionado. Use Ctrl+C ou o comando de copiar do seu dispositivo."); } }}>Copiar conteúdo</StudyButton><StudyButton secondary onClick={() => setExportPreview(null)}>Concluir</StudyButton></div>{exportFeedback && <p role="status">{exportFeedback}</p>}</dialog>}<footer className="ac-footer"><span>Synky Líderes <i/> Uma nova perspectiva, uma prática possível.</span><span><LockKeyhole size={13}/>{store.saved ? "Estudos salvos neste navegador" : "Progresso de estudos neste navegador"}<i/> Sem sincronização entre dispositivos</span></footer></div>;
}
