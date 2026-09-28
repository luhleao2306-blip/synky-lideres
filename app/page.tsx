import PublicNavigation from "@/components/public-navigation";
import PublicFooter from "@/components/public-footer";
import { DecisionPreview, MirrorPreview } from "@/components/public-experience-preview";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export default function Home() {
  return <div className="site vitrine-site"><PublicNavigation active="home"/>
    <main className="vitrine-main">
      <section className="vitrine-hero" aria-labelledby="vitrine-title"><div className="vitrine-hero-copy"><span className="vitrine-eyebrow">SYNKY LÍDERES / DESENVOLVIMENTO NA PRÁTICA</span><h1 id="vitrine-title">Liderar é<br/>fazer <em>escolhas.</em></h1><p>Pratique decisões, escute sua equipe e transforme percepções em ação.</p><div className="vitrine-hero-actions"><a className="vitrine-button" href="#demonstracao">Experimente agora <ArrowRight size={18}/></a><a className="vitrine-text-link" href="/empresas">Para empresas <ArrowUpRight size={17}/></a></div><span className="vitrine-hero-hint">Comece pela situação ao lado. É uma prévia real da plataforma.</span></div><DecisionPreview/></section>

      <section className="vitrine-mirror" id="experiencia" aria-labelledby="vitrine-mirror-title"><div className="vitrine-mirror-copy"><span className="vitrine-eyebrow">01 / ESPELHO DO LÍDER</span><h2 id="vitrine-mirror-title">O que você vê.<br/><em>O que o time vive.</em></h2><p>Uma pergunta pode abrir uma conversa melhor.</p><a href="/experiencias/mirror">Conhecer o Espelho do Líder <ArrowRight size={18}/></a></div><MirrorPreview/></section>

      <section className="vitrine-close" aria-labelledby="vitrine-close-title"><div><span className="vitrine-eyebrow">PARA LÍDERES, EQUIPES E EMPRESAS</span><h2 id="vitrine-close-title">Leve a evolução<br/><em>para toda a equipe.</em></h2></div><div className="vitrine-close-side"><p>Convide pessoas, acompanhe experiências e encontre próximos passos com privacidade.</p><div><a className="vitrine-button" href="/empresas">Levar para minha equipe <ArrowRight size={18}/></a><a className="vitrine-text-link" href="/experiencias">Ver as experiências <ArrowUpRight size={17}/></a></div></div></section>
    </main><PublicFooter/></div>;
}
