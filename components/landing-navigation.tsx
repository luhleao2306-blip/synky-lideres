"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight, Search, X } from "lucide-react";
import BrandLogo from "./brand-logo";

type NavItem = { label: string; href?: string; children?: NavItem[] };
const menu: NavItem[] = [
  { label: "Início", href: "#inicio" },
  { label: "Plataforma", children: [
    { label: "Conheça a Synky", href: "#produto" },
    { label: "Perguntas frequentes", href: "#duvidas" }, { label: "Privacidade dos resultados", href: "#privacidade" },
    { label: "Acessar plataforma", href: "/login?next=%2Fapp" },
  ] },
  { label: "Equipes", children: [
    { label: "Para líderes e equipes", href: "#equipes" }, { label: "Ambiente para empresas", href: "/empresas" },
  ] },
  { label: "Começar", children: [{ label: "Conheça a plataforma", href: "#produto" }, { label: "Para líderes e equipes", href: "#equipes" }, { label: "Tirar dúvidas", href: "#duvidas" }, { label: "Acessar plataforma", href: "/login?next=%2Fapp" }] },
];
const flatten = (items: NavItem[]): NavItem[] => items.flatMap(item => item.children ? flatten(item.children) : [item]);

function NavBranch({ items, level = 0, onNavigate, active, reset }: { items: NavItem[]; level?: number; onNavigate: () => void; active: number; reset: number }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return <ul className={level === 0 ? "landing-nav-list" : "landing-submenu"}>
    {items.map((item, index) => <li key={item.label} onMouseEnter={() => { if (window.matchMedia("(min-width: 1280px)").matches && item.children) setExpanded(item.label); }} onMouseLeave={() => { if (window.matchMedia("(min-width: 1280px)").matches) setExpanded(null); }} className={`${item.children ? "has-submenu" : ""} ${expanded === item.label ? "is-expanded" : ""} ${level === 0 && active === index ? "is-active" : ""}`}>
      {item.children ? <button type="button" aria-expanded={expanded === item.label} onClick={() => setExpanded(window.matchMedia("(min-width: 1280px)").matches ? item.label : expanded === item.label ? null : item.label)} onKeyDown={event => { if (event.key === "Escape") { setExpanded(null); event.stopPropagation(); } }}>
        {item.label}{level === 0 ? <ChevronDown size={13}/> : <ChevronRight size={14}/>}</button> : <a href={item.href} onClick={onNavigate} aria-current={level === 0 && active === index ? "page" : undefined}>{item.label}</a>}
      {item.children && <NavBranch items={item.children} level={level + 1} onNavigate={() => { setExpanded(null); onNavigate(); }} active={-1} reset={reset}/>}
    </li>)}
  </ul>;
}

export default function LandingNavigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const [reset, setReset] = useState(0);
  const header = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); setQuery(""); setReset(current => current + 1); };
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 120);
      const sections = ["inicio", "produto", "equipes", "duvidas", "privacidade"];
      let current = 0;
      sections.forEach((id, index) => { if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) < 200) current = index; });
      setActive(current);
    };
    update(); window.addEventListener("scroll", update, { passive: true });
    const dismiss = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) setReset(current => current + 1); };
    document.addEventListener("pointerdown", dismiss);
    const media = window.matchMedia("(min-width: 1280px)");
    const resize = () => { if (media.matches) setOpen(false); };
    media.addEventListener("change", resize);
    return () => { window.removeEventListener("scroll", update); document.removeEventListener("pointerdown", dismiss); media.removeEventListener("change", resize); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") { close(); toggle.current?.focus(); }
      if (event.key === "Tab") {
        const elements = [...(panel.current?.querySelectorAll<HTMLElement>('a,button,input') ?? [])].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden");
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", keys);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keys); };
  }, [open]);
  const searchResults = flatten(menu).filter((item, index, items) => items.findIndex(other => other.href === item.href) === index && item.label.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
  return <header ref={header} className={`landing-header ${scrolled ? "is-scrolled" : ""}`}>
    <div className="landing-header-inner">
      <a className="landing-brand" href="#inicio" aria-label="Synky Líderes, início"><BrandLogo tone="light"/></a>
      <nav className="landing-desktop-nav" aria-label="Navegação principal"><NavBranch key={reset} items={menu} onNavigate={close} active={active} reset={reset}/></nav>
      <a className="landing-header-preview" href="#produto">Sobre a Synky</a>
      <a className="landing-header-cta" href="/login?next=%2Fapp">Acessar plataforma <span><ArrowRight size={19}/></span></a>
      <button ref={toggle} className={`landing-menu-toggle ${open ? "is-open" : ""}`} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="landing-mobile-navigation" onClick={() => { setOpen(!open); setQuery(""); }}><span/><span/><span/></button>
    </div>
    <div className={`landing-menu-overlay ${open ? "is-open" : ""}`} onClick={close}/>
    <div ref={panel} id="landing-mobile-navigation" className={`landing-mobile-panel ${open ? "is-open" : ""}`} role="dialog" aria-modal={open || undefined} aria-label="Menu de navegação" inert={!open}>
      <div className="landing-mobile-brand"><a href="#inicio" onClick={close} aria-label="Synky Líderes, início"><BrandLogo/></a><button aria-label="Fechar menu" onClick={close}><X size={22}/></button></div>
      <label className="landing-menu-search"><input type="search" placeholder="Buscar na navegação…" aria-label="Buscar na navegação" value={query} onChange={event => setQuery(event.target.value)}/><Search size={19}/></label>
      <nav aria-label="Navegação móvel">{query ? <ul className="landing-nav-list landing-search-results">{searchResults.map(item => <li key={item.href}><a href={item.href} onClick={close}>{item.label}<ArrowRight size={14}/></a></li>)}{!searchResults.length && <li>Nenhum destino encontrado.</li>}</ul> : <NavBranch key={reset} items={menu} onNavigate={close} active={active} reset={reset}/>}</nav>
      <div className="landing-mobile-info"><strong>Para quem já lidera.</strong><p>Atividades práticas para refletir sobre decisões, comunicação e relações de equipe.</p><a href="/login?next=%2Fapp" onClick={close}>Acessar plataforma <ArrowRight size={16}/></a></div>
    </div>
  </header>;
}
