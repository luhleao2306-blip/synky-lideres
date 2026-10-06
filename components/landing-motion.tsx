"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function LandingMotion() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".home-landing");
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    root.querySelectorAll<HTMLElement>(".landing-intro-visual,.landing-team-art,.landing-faq-art,.landing-practice-visual,.landing-path-grid>a,.landing-team-formats>a,.landing-privacy-panel,.landing-section-top> a,.landing-hero-actions,.landing-hero-proof").forEach((element, index) => {
      element.dataset.reveal = "block";
      element.style.setProperty("--reveal-delay", `${index % 3 * 90}ms`);
    });
    const elements = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { (entry.target as HTMLElement).dataset.visible = "true"; observer.unobserve(entry.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -25px 0px" });
    const syncMotion = () => {
      root.dataset.motion = reduced.matches ? "reduced" : "ready";
      elements.forEach(element => { if (reduced.matches) element.dataset.visible = "true"; else observer.observe(element); });
    };
    syncMotion(); reduced.addEventListener("change", syncMotion);
    const scroll = () => setProgress(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    scroll(); window.addEventListener("scroll", scroll, { passive: true });
    let frame = 0;
    const pointer = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType !== "mouse") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth - .5) * 12}px`);
        root.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight - .5) * 8}px`);
      });
    };
    root.addEventListener("pointermove", pointer);
    return () => { observer.disconnect(); reduced.removeEventListener("change", syncMotion); window.removeEventListener("scroll", scroll); root.removeEventListener("pointermove", pointer); cancelAnimationFrame(frame); };
  }, []);
  return <a className={`landing-back-top ${progress > .05 ? "is-visible" : ""}`} href="#inicio" aria-label="Voltar ao início" style={{ background: `conic-gradient(#b9e900 ${progress * 360}deg, #527968 0deg)` }}><span><ArrowUp size={18}/></span></a>;
}


