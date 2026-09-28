import PublicNavigation from "@/components/public-navigation";
import PublicFooter from "@/components/public-footer";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const featured = [
  { number: "01", title: "Espelho do Líder", text: "Escute como o time percebe sua liderança.", image: "/images/experiences/mirror-v2.webp", alt: "Líder ouvindo a equipe em uma conversa", href: "/experiencias/mirror" },
  { number: "02", title: "Decisões Sob Pressão", text: "Explore escolhas em situações do trabalho.", image: "/images/experiences/decisions-v2.webp", alt: "Líder analisando uma decisão com colegas", href: "/experiencias/decisions" },
  { number: "03", title: "Raio X da Comunicação", text: "Entenda o que duas pessoas ouviram de um mesmo combinado.", image: "/images/experiences/communication-v2.webp", alt: "Duas pessoas alinhando expectativas no trabalho", href: "/experiencias/communication" },
];

function ProfilePreview() {
  return <div className="clarity-preview" aria-label="Exemplo ilustrativo de uma comparação de percepções">
    <div className="clarity-preview-head"><div><span>ESPELHO DO LÍDER</span><strong>Percepções em perspectiva</strong></div><small>EXEMPLO VISUAL</small></div>
    <svg className="clarity-radar" viewBox="0 0 400 322" role="img" aria-label="Gráfico ilustrativo de seis comportamentos de liderança">
      <g fill="none" stroke="#d7e9dc" strokeWidth="1">
        <polygon points="200,136 221,148 221,172 200,184 179,172 179,148"/>
        <polygon points="200,112 241,136 241,184 200,208 159,184 159,136"/>
        <polygon points="200,88 262,124 262,196 200,232 138,196 138,124"/>
        <polygon points="200,64 283,112 283,208 200,256 117,208 117,112"/>
        <path d="M200 64V256M117 112L283 208M283 112L117 208"/>
      </g>
      <polygon points="200,91 262,125 252,190 200,226 148,190 145,128" fill="#9acba9" fillOpacity=".27" stroke="#8fbd9c" strokeWidth="2" strokeDasharray="5 5"/>
      <polygon points="200,81 255,129 268,199 200,240 135,198 130,120" fill="#168960" fillOpacity=".13" stroke="#168960" strokeWidth="2.5"/>
      <g fill="#168960"><circle cx="200" cy="81" r="4"/><circle cx="255" cy="129" r="4"/><circle cx="268" cy="199" r="4"/><circle cx="200" cy="240" r="4"/><circle cx="135" cy="198" r="4"/><circle cx="130" cy="120" r="4"/></g>
      <g fill="#42614d" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600">
        <text x="200" y="39" textAnchor="middle">Escuta</text>
        <text x="299" y="107">Clareza</text>
        <text x="299" y="221">Delegação</text>
        <text x="200" y="286" textAnchor="middle">Reconhecimento</text>
        <text x="101" y="221" textAnchor="end">Abertura</text>
        <text x="101" y="107" textAnchor="end">Acompanhamento</text>
      </g>
    </svg>
    <div className="clarity-preview-foot"><span><i/>Sua percepção</span><span><i/>Percepção do time</span></div>
    <small className="clarity-preview-note">Dados ilustrativos. Na plataforma, a visão do time só aparece com pelo menos cinco respostas válidas.</small>
  </div>;
}

export default function Home() {
  return <div className="site clarity-site"><PublicNavigation active="home"/>
    <main className="clarity-main">
      <section className="clarity-hero" aria-labelledby="clarity-title">
        <div className="clarity-hero-copy">
          <span className="clarity-kicker">AUTOCONHECIMENTO <b>·</b> PESSOAS <b>·</b> AÇÃO</span>
          <h1 id="clarity-title">Conheça seu jeito de <em>liderar.</em></h1>
          <p>Descubra padrões, escute seu time e transforme o que aprendeu em uma próxima atitude.</p>
          <div className="clarity-actions"><a className="clarity-button" href="/experiencias">Explorar experiências <ArrowRight size={18}/></a><a className="clarity-button clarity-button-secondary" href="/empresas">Para empresas</a></div>
          <div className="clarity-hero-line"><span>Respostas individuais protegidas</span><span>Resultados para agir</span></div>
        </div>
        <div className="clarity-stage">
          <ProfilePreview/>
          <div className="clarity-stage-side"><span>UMA JORNADA POSSÍVEL</span><a href="/experiencias/mirror"><b>01</b><strong>Escute o time</strong><ArrowUpRight size={17}/></a><a href="/experiencias/decisions"><b>02</b><strong>Teste escolhas</strong><ArrowUpRight size={17}/></a><a href="/app"><b>03</b><strong>Acompanhe o que mudou</strong><ArrowUpRight size={17}/></a></div>
        </div>
      </section>

      <section className="clarity-featured" aria-labelledby="clarity-featured-title">
        <div className="clarity-section-head"><div><span className="clarity-kicker">EXPERIÊNCIAS SYNKY</span><h2 id="clarity-featured-title">Para o que acontece <em>de verdade</em> no trabalho.</h2></div><a href="/experiencias">Todas as experiências <ArrowUpRight size={17}/></a></div>
        <div className="clarity-featured-grid">{featured.map(item=><a href={item.href} className="clarity-featured-item" key={item.number}><img src={item.image} alt={item.alt} loading="lazy"/><span className="clarity-featured-meta">{item.number} / EXPERIÊNCIA</span><span className="clarity-featured-title">{item.title}<ArrowUpRight size={21}/></span><span className="clarity-featured-text">{item.text}</span></a>)}</div>
      </section>

      <section className="clarity-practice" aria-labelledby="clarity-practice-title"><div><span className="clarity-kicker">DE UM INSIGHT A UMA AÇÃO</span><h2 id="clarity-practice-title">Olhe para si.<br/>Escute o time.<br/><em>Faça diferente.</em></h2></div><div className="clarity-practice-steps"><div><span>01</span><p>Escolha uma experiência que converse com seu momento.</p></div><div><span>02</span><p>Responda sozinho ou convide outras pessoas, quando fizer sentido.</p></div><div><span>03</span><p>Reveja o resultado e leve um próximo passo para a prática.</p></div><a href="/app">Começar na plataforma <ArrowRight size={18}/></a></div></section>

      <section className="clarity-close" aria-labelledby="clarity-close-title"><span className="clarity-kicker">PARA VOCÊ E PARA SUA EQUIPE</span><h2 id="clarity-close-title">A próxima conversa pode mudar <em>o caminho.</em></h2><div><p>Comece por uma experiência e descubra o que vale conversar agora.</p><a href="/experiencias" className="clarity-button clarity-button-light">Encontrar minha experiência <ArrowRight size={18}/></a></div></section>
    </main><PublicFooter/></div>;
}
