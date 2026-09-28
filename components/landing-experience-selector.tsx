"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { publicExperiences } from "@/lib/public-experiences";

const experiences = [
  { ...publicExperiences[0], prompt: "Como o time percebe sua liderança?", line: "Ouça outras perspectivas e escolha uma ação para acompanhar." },
  { ...publicExperiences[1], prompt: "O que você faz quando a pressão chega?", line: "Teste decisões em situações de trabalho e veja suas consequências." },
  { ...publicExperiences[2], prompt: "Vocês entenderam a mesma conversa?", line: "Compare percepções em dupla e transforme ruídos em acordos." },
] as const;

export default function LandingExperienceSelector() {
  const [selected, setSelected] = useState(1);
  const experience = experiences[selected];

  return <section className="editorial-explore" id="explorar" aria-labelledby="editorial-explore-title">
    <div className="editorial-explore-intro">
      <div><span className="editorial-label">EXPERIÊNCIAS SYNKY</span><h2 id="editorial-explore-title">Por onde você quer <em>começar?</em></h2></div>
      <a href="/experiencias">Ver todas as experiências <ArrowUpRight size={17}/></a>
    </div>
    <div className="editorial-switcher" aria-label="Escolha uma experiência em destaque">
      {experiences.map((item, index) => <button key={item.slug} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}><span>{item.number}</span>{item.title}</button>)}
    </div>
    <div className="editorial-feature" key={experience.slug}>
      <div className="editorial-feature-photo"><img src={experience.image} alt={experience.imageAlt} loading="lazy"/></div>
      <div className="editorial-feature-copy"><span className="editorial-feature-count">0{selected + 1} / 03</span><h3>{experience.prompt}</h3><p>{experience.line}</p><div className="editorial-feature-bottom"><span>{experience.title}</span><a href={`/experiencias/${experience.slug}`}>Conhecer experiência <ArrowRight size={18}/></a></div></div>
    </div>
  </section>;
}
