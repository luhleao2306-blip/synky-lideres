import PublicNavigation from "@/components/public-navigation";
import PublicFooter from "@/components/public-footer";
import { ArrowRight } from "lucide-react";

const situations = [
  {
    number: "01",
    label: "DECISÕES SOB PRESSÃO",
    title: "Uma entrega saiu do plano. Como você decide?",
    description: "Escolha caminhos em cenários de trabalho e veja as consequências de cada decisão.",
    image: "/images/experiences/decisions-v2.webp",
    imageAlt: "Líder discutindo opções de uma entrega com o time",
    href: "/experiencias/decisions",
  },
  {
    number: "02",
    label: "RAIO X DA COMUNICAÇÃO",
    title: "Vocês entenderam o mesmo combinado?",
    description: "Cada pessoa responde em separado. Depois, a dupla compara preferências e registra um acordo.",
    image: "/images/experiences/communication-v2.webp",
    imageAlt: "Dois profissionais conversando e anotando um acordo",
    href: "/experiencias/communication",
  },
  {
    number: "03",
    label: "TERMÔMETRO DE LIDERANÇA",
    title: "O que mudou depois da conversa?",
    description: "Acompanhe comportamentos escolhidos com rodadas curtas de percepção do time.",
    image: "/images/experiences/thermometer-v2.webp",
    imageAlt: "Equipe acompanhando uma mudança de comportamento ao longo do tempo",
    href: "/experiencias/thermometer",
  },
];

export default function Home() {
  return <div className="site"><PublicNavigation active="home"/>
    <main>
      <section className="home-hero" id="inicio">
        <div className="home-hero-copy">
          <span className="home-eyebrow">DESENVOLVIMENTO DE LIDERANÇAS</span>
          <h1>Conheça seu jeito de <em>liderar.</em></h1>
          <p>Faça escolhas em situações de trabalho, escute seu time e acompanhe o que você colocou em prática.</p>
          <div className="home-actions"><a href="/experiencias" className="button primary">Explorar experiências <ArrowRight size={17}/></a><a href="/empresas" className="button outline">Para empresas</a></div>
        </div>
        <a className="home-hero-photo" href="/experiencias/mirror" aria-label="Conhecer o Espelho do Líder">
          <img src="/images/experiences/mirror-v2.webp" alt="Líder escutando percepções de pessoas do time em uma conversa" fetchPriority="high"/>
          <span className="home-photo-caption"><small>ESPELHO DO LÍDER</small><strong>Ouvir outras perspectivas muda a próxima conversa.</strong><span>Conhecer a experiência <ArrowRight size={17}/></span></span>
        </a>
      </section>
      <section className="home-situations" id="experiencias" aria-labelledby="home-situations-title">
        <div className="home-section-heading"><div><span className="home-eyebrow">SITUAÇÕES DO DIA A DIA</span><h2 id="home-situations-title">Comece pelo que você vive no trabalho.</h2></div><a href="/experiencias">Ver todas as experiências <ArrowRight size={17}/></a></div>
        <div className="home-situation-grid">{situations.map(item=><a href={item.href} className="home-situation-card" key={item.number}>
          <div className="home-situation-image"><img src={item.image} alt={item.imageAlt} loading="lazy"/></div>
          <div className="home-situation-body"><span><b>{item.number}</b> {item.label}</span><h3>{item.title}</h3><p>{item.description}</p><strong>Conhecer experiência <ArrowRight size={17}/></strong></div>
        </a>)}</div>
      </section>
      <section className="home-privacy" aria-labelledby="home-privacy-title"><div><span className="home-eyebrow">ESCUTA COM PRIVACIDADE</span><h2 id="home-privacy-title">Feedback para abrir conversas, não expor pessoas.</h2></div><div><p>No Espelho do Líder, cada pessoa responde individualmente. A comparação do time aparece somente após o encerramento do ciclo e com pelo menos cinco respostas válidas.</p><a href="/experiencias/mirror">Entenda o Espelho do Líder <ArrowRight size={17}/></a></div></section>
    </main><PublicFooter/></div>;
}
