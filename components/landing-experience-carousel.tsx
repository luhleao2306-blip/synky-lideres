"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3, UsersRound, Waypoints, MessagesSquare, Activity, Compass, TrendingUp } from "lucide-react";
import { publicExperiences } from "@/lib/public-experiences";

const icons = [UsersRound, Waypoints, MessagesSquare, Activity, Compass, TrendingUp];

export default function LandingExperienceCarousel() {
  const [viewport, carousel] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 1, duration: 32 });
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState<number[]>([0, 1, 2, 3]);
  const [reduced, setReduced] = useState(false);
  const sync = useCallback(() => {
    if (!carousel) return;
    setIndex(carousel.selectedScrollSnap());
    setVisible(carousel.slidesInView());
  }, [carousel]);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(motion.matches);
    update(); motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!carousel) return;
    const frame = requestAnimationFrame(sync); carousel.on("select", sync).on("slidesInView", sync).on("reInit", sync);
    return () => { cancelAnimationFrame(frame); carousel.off("select", sync).off("slidesInView", sync).off("reInit", sync); };
  }, [carousel, sync]);
  return <div className="landing-carousel-wrap" role="region" aria-roledescription="carrossel" aria-label="Experiências Synky">
    <div className="landing-carousel-controls"><span aria-live="polite">0{index + 1} <i/> 0{publicExperiences.length}</span><button onClick={() => carousel?.scrollPrev(reduced)} aria-label="Experiência anterior"><ArrowLeft size={20}/></button><button onClick={() => carousel?.scrollNext(reduced)} aria-label="Próxima experiência"><ArrowRight size={20}/></button></div>
    <div ref={viewport} className="landing-carousel-viewport"><div className="landing-carousel">{publicExperiences.map((item, itemIndex) => { const Icon = icons[itemIndex]; return <div className="landing-carousel-slide" key={item.slug} role="group" aria-roledescription="slide" aria-label={`${itemIndex + 1} de ${publicExperiences.length}`} aria-hidden={!visible.includes(itemIndex)} inert={!visible.includes(itemIndex)}>
      <a className="landing-experience-card" href={`/experiencias/${item.slug}`}>
        <div className="landing-experience-copy"><span className="landing-experience-index" aria-hidden="true"><Icon size={40} strokeWidth={1.2}/></span><h3>{item.title}</h3><span className="landing-experience-audience">{item.audience}</span></div>
        <div className="landing-experience-image"><img src={item.image} alt={item.imageAlt} loading="lazy"/><span className="landing-experience-open"><ArrowUpRight size={24}/></span></div>
        <div className="landing-experience-details"><p>{item.summary}</p><ul>{item.steps.slice(0, 2).map(step => <li key={step}>{step}</li>)}</ul><div><span><Clock3 size={14}/>{item.duration}</span><b>Conhecer <ArrowRight size={15}/></b></div></div>
      </a>
    </div>; })}</div></div>
    <div className="landing-carousel-dots" aria-label="Escolher experiência">{publicExperiences.map((item, dotIndex) => <button key={item.slug} aria-label={`Mostrar ${item.title}`} aria-current={dotIndex === index ? "true" : undefined} onClick={() => carousel?.scrollTo(dotIndex, reduced)}/>)}</div>
  </div>;
}
