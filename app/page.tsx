import PublicNavigation from "@/components/public-navigation";
import PublicFooter from "@/components/public-footer";
import { DecisionPreview, MirrorPreview } from "@/components/public-experience-preview";
import { ArrowRight, ArrowUpRight, BookOpen, LockKeyhole, UsersRound } from "lucide-react";

export default function Home() {
  return <div className="site vitrine-site"><PublicNavigation active="home"/>
    <main className="vitrine-main">
      <section className="vitrine-hero" aria-labelledby="vitrine-title"><div className="vitrine-hero-copy"><span className="vitrine-eyebrow">SYNKY LÍDERES · DESENVOLVIMENTO NA PRÁTICA</span><h1 id="vitrine-title">Líderes que<br/>escutam.<br/><em>Equipes que<br/>evoluem.</em></h1><p>Escute pessoas, pratique decisões e acompanhe a evolução da liderança.</p><div className="vitrine-hero-actions"><a className="vitrine-button" href="/experiencias">Explorar experiências <ArrowRight size={18}/></a><a className="vitrine-text-link" href="/empresas">Para minha equipe <ArrowUpRight size={17}/></a></div><span className="vitrine-hero-hint">Para líderes, profissionais, equipes e RH.</span></div><div className="vitrine-hero-art"><img src="/images/hero-leadership-conversation.png" alt="Líder conversando com colegas em uma roda de equipe" loading="eager" fetchPriority="high"/><a className="vitrine-hero-callout" href="/experiencias/mirror"><span>SEU PRÓXIMO PASSO</span><strong>Espelho do Líder</strong><small>Escute a percepção do seu time.</small><b>Conhecer a experiência <ArrowRight size={16}/></b></a></div></section>

      <div className="vitrine-proof" aria-label="O que você encontra na plataforma"><div><span><BookOpen size={22}/></span><strong>06</strong><small>experiências práticas</small></div><div><span><UsersRound size={22}/></span><strong>Participação</strong><small>da equipe</small></div><div><span><LockKeyhole size={22}/></span><strong>Evolução</strong><small>com privacidade</small></div></div>

      <section className="vitrine-decisions" aria-labelledby="vitrine-decisions-title"><div className="vitrine-decisions-copy"><span className="vitrine-eyebrow">DECISÕES SOB PRESSÃO</span><h2 id="vitrine-decisions-title">Uma decisão pode mudar <em>tudo.</em></h2><p>Experimente uma situação que faz parte da plataforma.</p><a href="/experiencias/decisions">Conhecer a experiência <ArrowRight size={18}/></a></div><DecisionPreview/></section>

      <section className="vitrine-mirror" id="experiencia" aria-labelledby="vitrine-mirror-title"><div className="vitrine-mirror-copy"><span className="vitrine-eyebrow">01 / ESPELHO DO LÍDER</span><h2 id="vitrine-mirror-title">O que você vê.<br/><em>O que o time vive.</em></h2><p>Uma pergunta pode abrir uma conversa melhor.</p><a href="/experiencias/mirror">Conhecer o Espelho do Líder <ArrowRight size={18}/></a></div><MirrorPreview/></section>

      <section className="vitrine-close" aria-labelledby="vitrine-close-title"><div><span className="vitrine-eyebrow">PARA LÍDERES, EQUIPES E EMPRESAS</span><h2 id="vitrine-close-title">Leve a evolução<br/><em>para toda a equipe.</em></h2></div><div className="vitrine-close-side"><p>Convide pessoas, acompanhe experiências e encontre próximos passos com privacidade.</p><div><a className="vitrine-button" href="/empresas">Levar para minha equipe <ArrowRight size={18}/></a><a className="vitrine-text-link" href="/experiencias">Ver as experiências <ArrowUpRight size={17}/></a></div></div></section>
    </main><PublicFooter/></div>;
}
