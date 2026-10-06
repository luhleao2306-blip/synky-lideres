"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Compass, Flag, Layers3, Lightbulb, LockKeyhole, MessageCircle, PencilLine, Wind } from "lucide-react";
import { themeDefinitions, validateChallenge, type Challenge } from "./journey-model";
import { JButton, JError, JRating } from "./journey-ui";
import { LeaderCover } from "./leader-visuals";
import "./starting-page.css";

type Props = { challenge: Challenge; onChange: (value: Challenge) => void; onSave: () => void; editing: boolean };
const steps = ["Escolha o tema", "Conte a situação", "Defina seu foco"];
const icons = [Compass, Layers3, Wind, MessageCircle];
const examples: Record<Challenge["theme"], { title: string; situation: string; question: string }> = {
  confidence: { title: "Quero decidir sem adiar à espera de certeza completa.", situation: "Pense em uma decisão recente: o que você sabia, o que faltava e como escolheu agir?", question: "Qual escolha você vem adiando, mesmo já tendo informações para dar um primeiro passo?" },
  boundaries: { title: "Quero comunicar meus limites antes de assumir novos pedidos.", situation: "Lembre de um pedido que mudou suas prioridades. O que você respondeu e o que deixou de caber?", question: "Em que momento dizer sim começou a tirar espaço do que realmente importa?" },
  pressure: { title: "Quero fazer uma pausa antes de responder sob pressão.", situation: "Retome uma conversa tensa. Qual foi o fato, como você reagiu e o que gostaria de tentar diferente?", question: "Em que situação a pressa ou a tensão tem conduzido sua resposta?" },
  custom: { title: "Quero ouvir até o fim antes de apresentar minha solução.", situation: "Descreva uma conversa ou decisão que você viveu e um comportamento seu que gostaria de experimentar diferente.", question: "O que depende da sua forma de agir e pode ser experimentado no trabalho?" },
};
const patterns = [
  { value: "recurring", title: "Acontece com frequência", description: "Percebo esse padrão em diferentes situações." },
  { value: "episode", title: "Foi uma situação específica", description: "Um episódio recente chamou minha atenção." },
  { value: "unsure", title: "Ainda estou entendendo", description: "Quero observar melhor antes de concluir." },
] as const;

export default function StartingPage({ challenge, onChange, onSave, editing }: Props) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const contextRef = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const themes = [...themeDefinitions, { id: "custom" as const, title: "Outro desafio pessoal", description: "Comunicação, escuta ou outra situação da sua liderança." }];
  const theme = themes.find(item => item.id === challenge.theme)!;
  const example = examples[challenge.theme];

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.closest(".j-main")?.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  function change(patch: Partial<Challenge>) { onChange({ ...challenge, ...patch }); setError(""); }
  function go(next: number) { setError(""); setStep(next); }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (step === 0) { go(1); return; }
    if (step === 1) {
      if (challenge.title.trim().length < 8) { setError("Dê um nome ao seu desafio com pelo menos 8 caracteres."); titleRef.current?.focus(); return; }
      if (challenge.context.trim().length < 10) { setError("Conte uma situação real com pelo menos 10 caracteres."); contextRef.current?.focus(); return; }
      go(2); return;
    }
    const problem = validateChallenge(challenge);
    setError(problem || "");
    if (problem) return;
    onSave();
  }

  return <section className="s-starting" aria-label="Meu ponto de partida">
    <LeaderCover visual="starting" eyebrow="01 / MEU PONTO DE PARTIDA" title={editing ? "Seu desafio pode ganhar outro olhar." : "Você já lidera. E quer ir além."}>Comece por uma situação que você vive hoje. Escolha um comportamento seu para experimentar diferente, um desafio de cada vez.</LeaderCover>
    <nav className="s-steps" aria-label="Etapas do ponto de partida"><ol>{steps.map((label,index) => <li key={label}><button type="button" aria-current={step === index ? "step" : undefined} disabled={index > step} className={index === step ? "current" : index < step ? "complete" : ""} onClick={() => go(index)}><span>{index < step ? <Check size={16}/> : index + 1}</span><b>{label}</b></button></li>)}</ol><span className="s-step-count">Etapa {step + 1} de 3</span></nav>
    <div className="s-layout"><form className="j-card s-form" noValidate onSubmit={submit}>
      <header className="s-section-title"><span className="s-section-icon" aria-hidden="true">{step === 0 ? <Compass size={20}/> : step === 1 ? <PencilLine size={20}/> : <Flag size={20}/>}</span><div><h2 tabIndex={-1} ref={headingRef}>{["O que você quer trabalhar agora?", "Dê forma ao seu desafio.", "Quanto espaço esse desafio ocupa?"][step]}</h2><p>{["Escolha o tema que mais se aproxima do seu momento.", "Uma situação concreta ajuda a encontrar uma prática possível.", "Use sua percepção para escolher onde investir energia."][step]}</p></div></header>
      <div key={step} className="s-step-content">
        {step === 0 && <fieldset className="s-theme-grid"><legend className="s-visually-hidden">Tema do meu desafio</legend>{themes.map((item,index) => { const Icon = icons[index]; const selected = challenge.theme === item.id; return <label key={item.id} className={`s-theme ${selected ? "selected" : ""}`}><input type="radio" name={`${id}-theme`} value={item.id} checked={selected} onChange={() => change({ theme: item.id })}/><span className={`s-theme-icon tone-${index}`} aria-hidden="true"><Icon size={24}/></span><span className="s-theme-text"><b>{item.title}</b><small>{item.description}</small></span><span className="s-choice-indicator" aria-hidden="true">{selected ? <Check size={13}/> : null}</span></label>; })}</fieldset>}
        {step === 1 && <>
          <span className="s-selected-theme"><Compass size={14}/>{theme.title}<button type="button" onClick={() => go(0)}>Trocar tema</button></span>
          <label className="j-field" htmlFor={`${id}-title`}><span>O que você quer fazer diferente? <b aria-hidden="true">*</b></span><input ref={titleRef} id={`${id}-title`} required minLength={8} maxLength={180} value={challenge.title} onChange={event => change({ title: event.target.value })} placeholder="Dê um nome ao seu desafio" aria-describedby={`${id}-title-hint`} aria-invalid={!!error && challenge.title.trim().length < 8}/><small id={`${id}-title-hint`}>Exemplo, para você adaptar: “{example.title}” · {challenge.title.length}/180 caracteres</small></label>
          <label className="j-field" htmlFor={`${id}-context`}><span>Conte uma situação em que isso apareceu. <b aria-hidden="true">*</b></span><textarea ref={contextRef} id={`${id}-context`} required minLength={10} maxLength={2000} rows={4} value={challenge.context} onChange={event => change({ context: event.target.value })} placeholder="O que aconteceu? Como você agiu? O que gostaria de tentar diferente?" aria-describedby={`${id}-context-hint`} aria-invalid={!!error && challenge.title.trim().length >= 8 && challenge.context.trim().length < 10}/><small id={`${id}-context-hint`}>{example.situation} · {challenge.context.length}/2000 caracteres</small></label>
          <fieldset className="s-patterns"><legend>Como isso aparece no seu trabalho?</legend>{patterns.map(item => <label key={item.value} className={challenge.pattern === item.value ? "selected" : ""}><input type="radio" name={`${id}-pattern`} value={item.value} checked={challenge.pattern === item.value} onChange={() => change({ pattern: item.value })}/><span><b>{item.title}</b><small>{item.description}</small></span></label>)}</fieldset>
        </>}
        {step === 2 && <div className="s-ratings"><p className="s-rating-note">Escolha uma resposta de 1 a 5 para cada pergunta. São percepções pessoais, sem pontuação de liderança.</p><JRating label="Impacto no meu trabalho" low="Pouco impacto" high="Muito impacto" value={challenge.impact} onChange={impact => change({ impact })}/><JRating label="Frequência desse desafio" low="Raro" high="Quase diário" value={challenge.frequency} onChange={frequency => change({ frequency })}/><JRating label="Disposição para agir agora" low="Preciso de mais espaço" high="Quero começar agora" value={challenge.willingness} onChange={willingness => change({ willingness })}/></div>}
      </div>
      <JError error={error}/>
      <footer className="s-form-footer"><div>{step > 0 ? <button type="button" className="s-back" onClick={() => go(step - 1)}><ArrowLeft size={16}/>Voltar</button> : <span className="s-footer-caption">Você pode ajustar seu desafio depois.</span>}</div><JButton type="submit">{step === 0 ? "Continuar com esse tema" : step === 1 ? "Definir meu foco" : editing ? "Salvar e seguir para a reflexão" : "Criar jornada e começar a reflexão"}<ArrowRight size={16}/></JButton></footer>
    </form>
    <aside className="s-companion">
      {step === 2 ? <section className="j-card s-summary"><span className="j-eyebrow">SEU PONTO DE PARTIDA</span><h2>Uma jornada com a sua realidade.</h2><span className="s-summary-theme">{theme.title}</span><h3>{challenge.title}</h3><p className="s-context-preview">{challenge.context}</p><span className="s-pattern-caption">{patterns.find(item => item.value === challenge.pattern)?.title}</span><button type="button" className="j-text-button" onClick={() => go(1)}><PencilLine size={14}/>Editar minha situação</button><div className="s-summary-next"><CheckCircle2 size={19}/><p>Depois, você reflete sobre seus padrões e constrói um plano de prática editável.</p></div></section> : <section className="j-card s-guide"><span className="s-guide-icon" aria-hidden="true"><Lightbulb size={23}/></span><span className="j-eyebrow">UM CONVITE À REFLEXÃO</span><h2>{step === 0 ? "Comece pelo que está acontecendo." : "Foque na sua forma de agir."}</h2><p>{step === 0 ? "Você já lidera. Esta jornada parte de um desafio que você vive hoje, para transformar reflexão em prática." : example.question}</p><div className="s-guide-list"><div><span>1</span><p>Uma situação real do seu trabalho.</p></div><div><span>2</span><p>Um comportamento seu para observar.</p></div><div><span>3</span><p>Um próximo passo que caiba na sua rotina.</p></div></div><p className="s-guide-note">Não precisa resolver tudo de uma vez. Escolha um desafio para explorar agora.</p></section>}
      <section className="s-storage-note"><LockKeyhole size={16}/><p>Respostas salvas neste navegador, sem envio automático ao RH. Ainda não há sincronização entre dispositivos.</p></section>
    </aside></div>
  </section>;
}
