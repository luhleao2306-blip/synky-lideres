import PublicFooter from "@/components/public-footer";
import BrandLogo from "@/components/brand-logo";
import LandingFaq from "@/components/landing-faq";
import LandingNavigation from "@/components/landing-navigation";
import LandingMotion from "@/components/landing-motion";
import LandingHeading from "@/components/landing-heading";
import LandingPrivacyCarousel from "@/components/landing-privacy-carousel";
import { ArrowDownRight, ArrowRight, ArrowUpRight, LockKeyhole } from "lucide-react";

export default function Home() {
  return <div className="home-landing">
    <LandingNavigation />
    <LandingMotion />
    <section className="landing-hero-shell" id="inicio">
      <main className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <span className="landing-kicker"><i/> Para quem já lidera</span>
          <LandingHeading as="h1" id="landing-title">Lidere com mais<br/>{" "}escuta e intenção<br/>{" "}nos desafios do<br/>{" "}dia a dia.</LandingHeading>
          <div className="landing-hero-actions"><a className="landing-button landing-button-bright" href="/app">Acessar plataforma <span><ArrowUpRight size={16}/></span></a><a className="landing-play-link" href="#produto"><span><ArrowDownRight size={17}/></span> Conheça a Synky</a></div>
        </div>
        <div className="landing-hero-image"><img src="/images/landing-leader-v2.webp" alt="Retrato ilustrativo de uma líder com um tablet" fetchPriority="high"/></div>
        <div className="landing-hero-social"><span>PARA QUEM JÁ LIDERA</span><i/>LIDERANÇA<i/>EQUIPE<i/>PRÁTICA</div>
        <div className="landing-hero-proof"><div><b>01</b><span>plataforma para apoiar<br/>sua rotina de liderança</span></div><div><b>3</b><span>formas de participar:<br/>individual, dupla e equipe</span></div></div>
      </main>
    </section>

    <section className="landing-intro" id="produto" aria-labelledby="landing-intro-title">
      <div className="landing-intro-title"><span className="landing-kicker"><i/> SYNKY LÍDERES</span><LandingHeading id="landing-intro-title">Para a liderança<br/>{" "}<em>que você já exerce.</em></LandingHeading><p>A plataforma organiza atividades breves para transformar situações do trabalho em reflexão e próximos passos.</p>
        <div className="landing-intro-footer"><div className="landing-intro-dashboard"><span>SUA ROTINA DE LIDERANÇA</span><strong>Um espaço para<br/> olhar a prática.</strong><div className="landing-dashboard-tags"><i>INDIVIDUAL</i><i>EM DUPLA</i><i>EM EQUIPE</i></div><a href="/app">Acessar plataforma <ArrowRight size={15}/></a></div><div className="landing-intro-formats"><p>Individual, em dupla<br/> e com sua equipe.</p><a className="landing-underlink" href="/app">Conheça a plataforma <ArrowUpRight size={16}/></a></div></div>
      </div>
      <div className="landing-intro-visual"><img src="/images/landing/intro-workshop.webp" alt="Colegas trabalham juntos em uma sala de equipe" loading="lazy"/></div>
    </section>

    <section className="landing-teams" id="equipes" aria-labelledby="landing-teams-title">
      <div className="landing-team-copy"><span className="landing-kicker"><i/> PARA LÍDERES E EQUIPES</span><LandingHeading id="landing-teams-title">Uma equipe.<br/>{" "}<em>Diferentes perspectivas.</em></LandingHeading><p>Organize um ambiente para sua empresa, selecione as atividades e convide as pessoas certas para participar.</p><a className="landing-button landing-button-bright" href="/empresas">Conhecer a solução <span><ArrowUpRight size={18}/></span></a></div>
      <div className="landing-team-formats"><a href="#equipes"><img src="/images/landing/format-individual-alt.webp" alt="Profissional fazendo anotações e refletindo sobre escolhas de trabalho" loading="lazy"/><div><h3>Individualmente</h3><p>Um olhar para suas escolhas.</p><span><ArrowUpRight size={18}/></span></div></a><a href="#equipes"><img src="/images/landing/format-duo-alt.webp" alt="Duas colegas conversando sobre formas de trabalhar" loading="lazy"/><div><h3>Em dupla</h3><p>Preferências e acordos de comunicação.</p><span><ArrowUpRight size={18}/></span></div></a><a href="#equipes"><img src="/images/landing/format-team-alt.webp" alt="Equipe reunida em uma conversa de trabalho" loading="lazy"/><div><h3>Com sua equipe</h3><p>Percepções agregadas da liderança.</p><span><ArrowUpRight size={18}/></span></div></a></div>
      <div className="landing-team-bottom"><span>Convites e perfis por função. Resultados conforme cada atividade.</span><a href="/empresas">Conheça o ambiente para empresas <ArrowUpRight size={22}/></a></div>
    </section>

    <section className="landing-faq-section" id="duvidas" aria-labelledby="landing-faq-title"><div className="landing-faq-art"><img src="/images/landing/faq-team.webp" alt="Equipe compartilha ideias em frente a um quadro" loading="lazy"/><div className="landing-faq-art-card"><LockKeyhole size={18}/><strong>Privacidade faz parte<br/>{" "}da atividade.</strong><span>Saiba como cada resultado é compartilhado.</span></div></div><div className="landing-faq-content"><span className="landing-kicker"><i/> DÚVIDAS SOBRE A SYNKY</span><LandingHeading id="landing-faq-title">Perguntas e<br/>{" "}<em>respostas claras.</em></LandingHeading><p>Informação para você escolher como começar.</p><LandingFaq/></div></section>

    <section className="landing-trust" id="privacidade" aria-labelledby="landing-trust-title"><div className="landing-trust-heading"><span className="landing-kicker"><i/> RESULTADOS COM CONTEXTO</span><LandingHeading id="landing-trust-title">Cada resultado tem<br/>{" "}<em>seu jeito de compartilhar.</em></LandingHeading><p>Veja alguns cuidados previstos nos fluxos do produto.</p></div><LandingPrivacyCarousel/></section>

    <section className="landing-cta"><div className="landing-cta-mark"><BrandLogo compact tone="light"/></div><div><span className="landing-kicker"><i/> SYNKY LÍDERES</span><LandingHeading>Desenvolva a liderança<br/>{" "}que você já exerce.</LandingHeading><p>Conheça a Synky e veja como ela apoia sua liderança.</p></div><a className="landing-button landing-button-bright" href="/app">Acessar plataforma <span><ArrowRight size={16}/></span></a></section>
    <PublicFooter />
  </div>;
}





