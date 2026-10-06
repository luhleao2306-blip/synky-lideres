"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, LockKeyhole } from "lucide-react";

const slides = [
  { name: "Resultados do time", text: "Percepções em conjunto.", detail: "Médias agregadas aparecem depois do encerramento do ciclo e com pelo menos cinco respostas válidas. Respostas individuais não são exibidas.", href: "#duvidas", image: "/images/landing/privacy-mirror.webp", alt: "Equipe reunida em conversa de trabalho" },
  { name: "Participação em dupla", text: "Compartilhamento consentido.", detail: "A comparação fica disponível quando as duas pessoas respondem e autorizam o compartilhamento. Cada participante pode encerrar a dupla.", href: "#duvidas", image: "/images/landing/privacy-communication.webp", alt: "Duas colegas conversam diante de um computador" },
  { name: "Resumo individual", text: "Você decide compartilhar.", detail: "Liderança e RH recebem somente o resumo que a própria pessoa escolher compartilhar. O diário completo tem acesso restrito na área de Resultados.", href: "#duvidas", image: "/images/landing/privacy-energy.webp", alt: "Pessoa trabalha em um computador em um espaço compartilhado" },
];

export default function LandingPrivacyCarousel() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  return <div className="landing-privacy-layout">
    <div className="landing-privacy-panel"><LockKeyhole size={55}/><strong>Privacidade em<br/>cada atividade.</strong><p>Conheça quem vê cada resultado e quando ele é compartilhado.</p><a className="landing-button landing-button-bright" href="#duvidas">Entenda os cuidados <span><ArrowUpRight size={18}/></span></a></div>
    <div className="landing-privacy-carousel" role="region" aria-roledescription="carrossel" aria-label="Cuidados com resultados">
      <div className="landing-privacy-slide" key={slide.name} aria-live="polite"><div className="landing-privacy-text"><span>0{index + 1} / 03 · {slide.name}</span><h3>{slide.text}</h3><p>{slide.detail}</p><a href={slide.href}>Saiba mais <ArrowUpRight size={18}/></a></div><img src={slide.image} alt={slide.alt} loading="lazy"/></div>
      <div className="landing-privacy-controls"><button onClick={() => setIndex((index + 2) % 3)} aria-label="Cuidado anterior"><ArrowLeft size={25}/></button><button onClick={() => setIndex((index + 1) % 3)} aria-label="Próximo cuidado"><ArrowRight size={25}/></button></div>
    </div>
  </div>;
}


