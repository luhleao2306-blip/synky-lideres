import PublicNavigation from "@/components/public-navigation";
import PublicFooter from "@/components/public-footer";
import PublicExperienceStudio from "@/components/public-experience-studio";
import { publicExperiences } from "@/lib/public-experiences";
import { scenarios } from "@/lib/experiences";
import { ArrowRight, ArrowUpRight, BookOpen, Clock3, LockKeyhole, UsersRound } from "lucide-react";

const featured = [
  { ...publicExperiences[0], tagline: "Descubra como sua equipe percebe você.", format: "Com seu time" },
  { ...publicExperiences[1], tagline: "Pratique escolhas antes do próximo desafio.", format: "Simulação" },
  { ...publicExperiences[2], tagline: "Transforme diferenças em bons acordos.", format: "Em dupla" },
];
const moreExperiences = [
  { ...publicExperiences[3], focus: "SUA ROTINA" },
  { ...publicExperiences[4], focus: "SEUS CAMINHOS" },
  { ...publicExperiences[5], focus: "SUA EVOLUÇÃO" },
];

export default function Home() {
  return <div className="site vitrine-site"><PublicNavigation active="home"/>
    <main className="vitrine-main">
      <section className="vitrine-hero" aria-labelledby="vitrine-title"><div className="vitrine-hero-copy"><span className="vitrine-eyebrow">SYNKY LÍDERES · DESENVOLVIMENTO NA PRÁTICA</span><h1 id="vitrine-title">Líderes que<br/>escutam.<br/><em>Equipes que<br/>evoluem.</em></h1><p>Escute pessoas, pratique decisões e acompanhe a evolução da liderança.</p><div className="vitrine-hero-actions"><a className="vitrine-button" href="/experiencias">Explorar experiências <ArrowRight size={18}/></a><a className="vitrine-text-link" href="/empresas">Para minha equipe <ArrowUpRight size={17}/></a></div><span className="vitrine-hero-hint">Para líderes, profissionais, equipes e RH.</span></div><div className="vitrine-hero-art"><img src="/images/hero-leadership-conversation.png" alt="Líder conversando com colegas em uma roda de equipe" loading="eager" fetchPriority="high"/><a className="vitrine-hero-callout" href="/experiencias/mirror"><span>SEU PRÓXIMO PASSO</span><strong>Espelho do Líder</strong><small>Escute a percepção do seu time.</small><b>Conhecer a experiência <ArrowRight size={16}/></b></a></div></section>

      <div className="vitrine-proof" aria-label="O que você encontra na plataforma"><div><span><BookOpen size={22}/></span><strong>06</strong><small>experiências práticas</small></div><div><span><UsersRound size={22}/></span><strong>Participação</strong><small>da equipe</small></div><div><span><LockKeyhole size={22}/></span><strong>Evolução</strong><small>com privacidade</small></div></div>

      <section className="journey-experiences" aria-labelledby="journey-experiences-title">
        <div className="journey-section-heading"><div><span className="journey-eyebrow">EXPERIÊNCIAS PARA O SEU MOMENTO</span><h2 id="journey-experiences-title">Encontre seu<br/><em>próximo passo.</em></h2></div><a className="journey-outline-link" href="#experimente">Quero experimentar <ArrowRight size={17}/></a></div>
        <div className="journey-featured">{featured.map(item=><a className={`journey-experience-card journey-card-${item.slug}`} href={`/experiencias/${item.slug}`} key={item.slug}>
          {item.slug === "decisions" ? <div className="journey-scenario-art"><span>CENÁRIOS DA EXPERIÊNCIA</span>{[scenarios[0],scenarios[1],scenarios[4]].map((scenario,index)=><div key={scenario.id}><small>{String(index+1).padStart(2,"0")}</small><strong>{scenario.title}</strong><ArrowUpRight size={15}/></div>)}<p>O que você faria?</p></div> : <div className="journey-card-photo"><img src={item.image} alt={item.imageAlt} loading="lazy"/><span>{item.format}</span></div>}
          <div className="journey-card-content"><span className="journey-card-number">{item.number} / EXPERIÊNCIA</span><h3>{item.title}</h3><p>{item.tagline}</p><div className="journey-card-bottom"><span><Clock3 size={13}/>{item.duration}</span><span className="journey-card-arrow"><ArrowUpRight size={21}/></span></div></div>
        </a>)}</div>
        <div className="journey-more"><span>MAIS PARA EXPLORAR</span><div>{moreExperiences.map(item=><a href={`/experiencias/${item.slug}`} key={item.slug}><span><small>{item.focus}</small><strong>{item.title}</strong></span><ArrowUpRight size={18}/></a>)}</div></div>
      </section>

      <PublicExperienceStudio/>

      <section className="journey-company" aria-labelledby="journey-company-title"><div className="journey-company-heading"><span className="journey-eyebrow">SYNKY PARA EMPRESAS</span><h2 id="journey-company-title">Uma pessoa começa.<br/><em>A equipe evolui junto.</em></h2><p>Um espaço para convidar, desenvolver e acompanhar suas lideranças.</p></div><div className="journey-company-actions"><a className="journey-company-primary" href="/empresas">Conhecer a solução para equipes <ArrowRight size={18}/></a><a className="journey-company-secondary" href="/app">Acessar a plataforma <ArrowUpRight size={16}/></a></div><div className="journey-company-foot"><span>Convites por pessoa</span><span>Experiências individuais e em equipe</span><span>Resultados conforme cada perfil</span></div></section>
    </main><PublicFooter/></div>;
}
