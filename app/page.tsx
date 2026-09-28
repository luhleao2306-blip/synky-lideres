import PublicNavigation from "@/components/public-navigation";
import PublicFooter from "@/components/public-footer";
import LandingExperienceSelector from "@/components/landing-experience-selector";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

export default function Home() {
  return <div className="site editorial-site"><PublicNavigation active="home" />
    <main className="editorial-main">
      <section className="editorial-hero" aria-labelledby="editorial-title">
        <div className="editorial-hero-copy">
          <span className="editorial-eyebrow"><span /> DESENVOLVIMENTO DE LIDERANÇAS</span>
          <h1 id="editorial-title">Seu jeito de liderar aparece em <em>cada conversa.</em></h1>
          <p>Enxergue seus padrões, escute quem trabalha com você e transforme percepção em ação.</p>
          <div className="editorial-actions">
            <a href="#explorar" className="editorial-button editorial-button-light">Descobrir experiências <ArrowRight size={19}/></a>
            <a href="/app" className="editorial-text-link">Acessar plataforma <ArrowUpRight size={17}/></a>
          </div>
        </div>
        <div className="editorial-hero-image">
          <img src="/images/experiences/mirror-v2.webp" alt="Uma líder escuta atentamente as pessoas da equipe durante uma conversa" fetchPriority="high"/>
          <span className="editorial-image-tag">A liderança acontece entre pessoas.</span>
        </div>
      </section>

      <div className="editorial-statement" aria-label="Escute, escolha, evolua">
        <span>Escute o que muda.</span><span>Escolha o próximo passo.</span><a href="#explorar" aria-label="Explorar experiências"><ArrowDownRight size={31}/></a>
      </div>

      <LandingExperienceSelector />

      <section className="editorial-bridge" aria-labelledby="editorial-bridge-title">
        <span className="editorial-label">DA PERCEPÇÃO À PRÁTICA</span>
        <h2 id="editorial-bridge-title">O resultado importa quando muda <em>a próxima atitude.</em></h2>
        <p>Responda, reflita e leve uma ação concreta para o seu dia a dia.</p>
      </section>

      <section className="editorial-company" aria-labelledby="editorial-company-title">
        <div className="editorial-company-image"><img src="/images/experiences/thermometer-v2.webp" alt="Equipe conversa sobre a evolução de comportamentos de liderança" loading="lazy"/></div>
        <div className="editorial-company-copy">
          <span className="editorial-label">SYNKY LÍDERES PARA EMPRESAS</span>
          <h2 id="editorial-company-title">Conversas melhores fazem equipes <em>avançar.</em></h2>
          <p>Convide pessoas, acompanhe a participação e dê continuidade ao desenvolvimento da liderança.</p>
          <a href="/empresas" className="editorial-button editorial-button-dark">Conhecer para empresas <ArrowUpRight size={18}/></a>
        </div>
      </section>
    </main><PublicFooter /></div>;
}
