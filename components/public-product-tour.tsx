"use client";

import { useState } from "react";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { mirrorLabels, scenarios } from "@/lib/experiences";

const tour = [
  { number: "01", label: "Organize", title: "Traga as pessoas certas para a conversa.", text: "Crie o espaço da empresa, defina perfis e compartilhe convites individuais com sua equipe.", href: "/app?view=team", action: "Conhecer convites e equipe" },
  { number: "02", label: "Experimente", title: "Faça escolhas em situações reais.", text: "Cada experiência convida a refletir sobre o trabalho. A pessoa responde no próprio ritmo, sozinha ou em dupla.", href: "/experiencias/decisions", action: "Conhecer esta experiência" },
  { number: "03", label: "Acompanhe", title: "Transforme resultados em próximos passos.", text: "Revisite resultados, acompanhe ações e veja a participação do time com as permissões adequadas.", href: "/app?view=results", action: "Abrir área de resultados" },
] as const;

function Screen({ view }: { view: number }) {
  const scenario = scenarios[0].scenes[0];
  return <div className="sales-screen" aria-label="Prévia ilustrativa da plataforma Synky Líderes">
    <div className="sales-screen-top"><span className="sales-screen-brand">SYNKY <b>LÍDERES</b></span><span>PRÉVIA DO SISTEMA</span><span className="sales-screen-user">S</span></div>
    <div className="sales-screen-layout"><aside><span className={view === 0 ? "active" : ""}>Meu time</span><span className={view === 1 ? "active" : ""}>Experiências</span><span className={view === 2 ? "active" : ""}>Resultados</span></aside>
      <div className="sales-screen-body">
        {view === 0 && <><div className="sales-screen-heading"><small>MEU TIME</small><h3>Convites organizados</h3><p>Defina quem participa e o que cada pessoa pode acompanhar.</p></div><div className="sales-invite-preview"><div><span>E-MAIL DA PESSOA</span><strong>nome@empresa.com</strong></div><div><span>TIPO DE ACESSO</span><strong>Líder <i>⌄</i></strong></div><span className="sales-faux-action">Criar link de convite <ArrowRight size={15}/></span></div><div className="sales-status-preview"><Check size={17}/><div><strong>Convite pronto para compartilhar</strong><span>Cada pessoa recebe um acesso próprio.</span></div></div></>}
        {view === 1 && <><div className="sales-screen-heading"><small>DECISÕES SOB PRESSÃO · ETAPA 01/03</small><h3>{scenarios[0].title}</h3><p>{scenario.prompt}</p></div><div className="sales-choice-preview">{scenario.choices.map((choice,index)=><div key={choice.text}><span>{String.fromCharCode(65+index)}</span>{choice.text}</div>)}</div></>}
        {view === 2 && <><div className="sales-screen-heading"><small>RESULTADOS · EXEMPLO VISUAL</small><h3>Percepções em perspectiva</h3><p>O Espelho compara sua visão com a percepção coletiva do time.</p></div><div className="sales-result-preview"><div className="sales-result-legend"><span><i/>Sua percepção</span><span><i/>Time</span></div>{mirrorLabels.slice(0,4).map((label,index)=><div className="sales-result-row" key={label}><strong>{label}</strong><div><span style={{width:`${[75,63,84,69][index]}%`}}/><i style={{width:`${[61,70,72,78][index]}%`}}/></div></div>)}</div><div className="sales-result-privacy"><LockKeyhole size={15}/> Visão coletiva somente após o encerramento e cinco respostas válidas.</div></>}
      </div>
    </div>
  </div>;
}

export default function PublicProductTour() {
  const [view, setView] = useState(0);
  const item = tour[view];
  return <section className="sales-tour" id="produto" aria-labelledby="sales-tour-title">
    <div className="sales-section-intro"><span className="sales-kicker">VEJA A PLATAFORMA POR DENTRO</span><h2 id="sales-tour-title">Do convite ao próximo passo, <em>tudo se conecta.</em></h2><p>Escolha uma etapa e veja como a Synky Líderes funciona no dia a dia.</p></div>
    <div className="sales-tour-controls" aria-label="Etapas da plataforma">{tour.map((option,index)=><button type="button" key={option.number} aria-pressed={view===index} onClick={()=>setView(index)}><span>{option.number}</span>{option.label}</button>)}</div>
    <div className="sales-tour-body"><div className="sales-tour-copy"><span className="sales-tour-number">{item.number} / 03</span><h3>{item.title}</h3><p>{item.text}</p><a href={item.href}>{item.action} <ArrowRight size={18}/></a></div><Screen view={view}/></div>
    <p className="sales-tour-note">Prévia ilustrativa da interface. Os resultados exibidos como exemplo não são dados de pessoas reais.</p>
  </section>;
}
