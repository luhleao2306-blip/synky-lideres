"use client";

import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { mirrorQuestions, scenarios } from "@/lib/experiences";

const scenario = scenarios[0];

export function DecisionPreview() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const scene = scenario.scenes[step];
  const choice = selected === null ? null : scene.choices[selected];

  function advance() {
    if (step === scenario.scenes.length - 1) {
      setCompleted(true);
    } else {
      setStep(current => current + 1);
      setSelected(null);
    }
  }

  function restart() {
    setStep(0);
    setSelected(null);
    setCompleted(false);
  }

  return <div className="vitrine-demo" id="demonstracao" aria-label="Demonstração interativa de Decisões Sob Pressão">
    <div className="vitrine-demo-top"><span>DECISÕES SOB PRESSÃO</span><span>DEMONSTRAÇÃO · {scenario.duration}</span></div>
    {completed ? <div className="vitrine-demo-complete"><span className="vitrine-demo-index">03 / 03</span><h2>Uma escolha leva à próxima.</h2><p>Na experiência completa, você revê todas as decisões e os comportamentos que apareceram no caminho.</p><div className="vitrine-demo-footer"><button type="button" onClick={restart}><RotateCcw size={15}/> Tentar novamente</button><a href="/experiencias/decisions">Conhecer a experiência <ArrowRight size={16}/></a></div></div> : <>
      <div className="vitrine-demo-progress"><span style={{width:`${((step + 1) / scenario.scenes.length) * 100}%`}}/></div>
      <div className="vitrine-demo-content"><span className="vitrine-demo-index">{scene.title.toUpperCase()} · {String(step + 1).padStart(2,"0")}/{String(scenario.scenes.length).padStart(2,"0")}</span><h2>{scenario.title}</h2><p>{scene.prompt}</p>
        <div className="vitrine-demo-choices">{scene.choices.map((option, index) => <button type="button" key={option.text} aria-pressed={selected === index} onClick={() => setSelected(index)}><span>{String.fromCharCode(65 + index)}</span>{option.text}</button>)}</div>
        {choice && <div className="vitrine-demo-consequence" aria-live="polite"><span>O QUE ACONTECE</span><strong>{choice.consequence}</strong><small>{choice.behavior}</small><button type="button" onClick={advance}>{step === scenario.scenes.length - 1 ? "Ver fechamento" : "Próxima decisão"} <ArrowRight size={16}/></button></div>}
      </div>
    </>}
    <div className="vitrine-demo-bottom"><span>Prévia interativa · suas escolhas aqui não são salvas</span><span>SYNKY LÍDERES</span></div>
  </div>;
}

export function MirrorPreview() {
  const [rating, setRating] = useState<number | null>(null);
  return <div className="vitrine-mirror-card" aria-label="Demonstração interativa do Espelho do Líder">
    <div className="vitrine-mirror-top"><span>ESPELHO DO LÍDER</span><span>01 / 06</span></div>
    <div className="vitrine-mirror-question"><span>NA SUA ROTINA DE TRABALHO</span><h3>{mirrorQuestions[0]}</h3></div>
    <div className="vitrine-mirror-scale" role="group" aria-label="Escolha uma nota de 1 a 5">{[1,2,3,4,5].map(value=><button type="button" key={value} aria-pressed={rating===value} onClick={()=>setRating(value)}>{value}</button>)}</div>
    <div className="vitrine-mirror-labels"><span>Raramente</span><span>Com frequência</span></div>
    <div className="vitrine-mirror-response" aria-live="polite">{rating ? <>Sua percepção: <strong>{rating} de 5.</strong> No ciclo completo, ela pode ser comparada à visão coletiva da equipe.</> : "Escolha a resposta que mais se aproxima da sua prática."}</div>
    <div className="vitrine-mirror-foot"><span>Prévia interativa · resposta não salva</span><a href="/experiencias/mirror">Ver experiência <ArrowRight size={16}/></a></div>
  </div>;
}
