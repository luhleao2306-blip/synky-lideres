"use client";

import { useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

const questions = [
  { q: "A Synky Líderes é para quem já ocupa uma posição de liderança?", a: "Sim. O sistema apoia quem já lidera em decisões, comunicação e relações de equipe. Algumas atividades também podem envolver colegas." },
  { q: "Como os resultados da equipe são compartilhados?", a: "Depois do encerramento do ciclo e com pelo menos cinco respostas válidas, a liderança vê médias agregadas. Respostas individuais não são exibidas." },
  { q: "Quando a comparação em dupla fica disponível?", a: "As duas pessoas precisam responder e consentir com o compartilhamento. Cada participante pode encerrar a dupla." },
  { q: "A empresa precisa ativar tudo?", a: "Não. Em ambientes de empresa, a administração escolhe quais atividades disponibilizar e convida pessoas conforme o contexto." },
  { q: "Os convites são enviados automaticamente por e-mail?", a: "A plataforma prepara e organiza convites por pessoa; o envio depende da ação de quem está administrando." },
  { q: "As atividades indicam uma resposta certa?", a: "Não. Elas apoiam a reflexão e não definem perfil, cargo ou desempenho." },
];

export default function LandingFaq() {
  const [active, setActive] = useState<number | null>(2);
  return <div className="landing-faq-list">{questions.map((item, index) => <article className={`landing-faq-item ${active === index ? "is-open" : ""}`} key={item.q}><button aria-expanded={active === index} aria-controls={`landing-answer-${index}`} onClick={() => setActive(active === index ? null : index)}><span><small>0{index + 1}</small>{item.q}</span><i>{active === index ? <ArrowDown size={16}/> : <ArrowUpRight size={16}/>}</i></button><div className="landing-faq-answer" id={`landing-answer-${index}`} aria-hidden={active !== index}><p>{item.a}</p></div></article>)}</div>;
}
