"use client";

import { useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

const questions = [
  { q: "A Synky Líderes é para quem já ocupa uma posição de liderança?", a: "Sim. O sistema apoia quem já lidera em decisões, comunicação e relações de equipe. Algumas atividades também podem envolver colegas." },
  { q: "O que aparece nos resultados dos cursos?", a: "Você acompanha atividades, notas e provas de cada curso. A administração também consulta esses registros, certificados e feedbacks." },
  { q: "Como a prova de cada curso é liberada?", a: "A prova final fica disponível depois de estudar todas as aulas e realizar as vinte atividades do curso. Ela tem vinte questões de alternativas." },
  { q: "Posso estudar mais de um curso?", a: "Sim. A plataforma tem 25 cursos independentes, cada um com suas aulas, atividades e prova final." },
  { q: "Os convites são enviados automaticamente por e-mail?", a: "A plataforma prepara e organiza convites por pessoa; o envio depende da ação de quem está administrando." },
  { q: "Como recebo meu certificado?", a: "Conclua as aulas e atividades e alcance pelo menos 8 na prova do curso. O certificado fica disponível no painel para imprimir ou salvar em PDF." },
];

export default function LandingFaq() {
  const [active, setActive] = useState<number | null>(2);
  return <div className="landing-faq-list">{questions.map((item, index) => <article className={`landing-faq-item ${active === index ? "is-open" : ""}`} key={item.q}><button aria-expanded={active === index} aria-controls={`landing-answer-${index}`} onClick={() => setActive(active === index ? null : index)}><span><small>0{index + 1}</small>{item.q}</span><i>{active === index ? <ArrowDown size={16}/> : <ArrowUpRight size={16}/>}</i></button><div className="landing-faq-answer" id={`landing-answer-${index}`} aria-hidden={active !== index}><p>{item.a}</p></div></article>)}</div>;
}
