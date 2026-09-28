import PublicNavigation from "@/components/public-navigation";
import PublicFooter from "@/components/public-footer";
import { publicExperiences } from "@/lib/public-experiences";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

const steps = [
  { number: "01", title: "Escolha uma situação real", copy: "Comece por uma decisão, uma conversa, sua rotina ou uma percepção do time. Cada experiência tem um propósito claro." },
  { number: "02", title: "Responda no seu ritmo", copy: "Participe individualmente ou convide uma pessoa ou equipe, conforme a experiência. Cada participante responde por si." },
  { number: "03", title: "Transforme a resposta em ação", copy: "Reveja seus resultados, converse sobre diferenças e registre o próximo passo que faz sentido no seu trabalho." },
];

export default function Home() {
  return <div className="site lp-site"><PublicNavigation active="home" />
    <main className="lp-main">
      <section className="lp-hero" id="inicio" aria-labelledby="lp-title">
        <div className="lp-hero-copy">
          <span className="lp-kicker">SYNKY LÍDERES · DESENVOLVIMENTO NA PRÁTICA</span>
          <h1 id="lp-title">Liderar melhor começa com uma <em>conversa honesta.</em></h1>
          <p>Explore situações do trabalho, entenda diferentes perspectivas e escolha o que colocar em prática com seu time.</p>
          <div className="lp-actions">
            <a href="/experiencias" className="button primary">Explorar experiências <ArrowRight size={18} /></a>
            <a href="/empresas" className="button outline">Conhecer para empresas</a>
          </div>
          <div className="lp-hero-note"><span className="lp-note-line" />Um espaço para refletir, escutar e agir com mais clareza.</div>
        </div>
        <a className="lp-hero-feature" href="/experiencias/mirror" aria-label="Conhecer o Espelho do Líder">
          <img src="/images/experiences/mirror-v2.webp" alt="Líder ouvindo integrantes da equipe durante uma conversa" fetchPriority="high" />
          <span className="lp-feature-caption"><span><small>EXPERIÊNCIA EM DESTAQUE</small><strong>Espelho do Líder</strong><span>Escute a percepção do time e escolha uma ação para acompanhar.</span></span><ArrowUpRight size={22} aria-hidden="true" /></span>
        </a>
      </section>

      <section className="lp-intro" aria-label="Proposta da Synky Líderes">
        <span className="lp-intro-mark">01 / 03</span>
        <p>Uma boa liderança se constrói <strong>nas escolhas de todos os dias</strong> — e nas conversas que vêm depois delas.</p>
        <a href="#como-funciona">Veja como funciona <ArrowRight size={17} /></a>
      </section>

      <section className="lp-section lp-how" id="como-funciona" aria-labelledby="lp-how-title">
        <div className="lp-section-top"><span className="lp-kicker">DA REFLEXÃO À PRÁTICA</span><span className="lp-section-index">COMO FUNCIONA / 01</span></div>
        <div className="lp-section-heading"><h2 id="lp-how-title">Um caminho simples para <em>sair do automático.</em></h2><p>As experiências conectam o que você percebe, o que outras pessoas vivem e as ações que podem mudar a próxima conversa.</p></div>
        <div className="lp-step-grid">{steps.map(step=><article className="lp-step" key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></article>)}</div>
      </section>

      <section className="lp-section lp-experiences" id="experiencias" aria-labelledby="lp-experiences-title">
        <div className="lp-section-top"><span className="lp-kicker">ESCOLHA POR ONDE COMEÇAR</span><span className="lp-section-index">EXPERIÊNCIAS / 02</span></div>
        <div className="lp-section-heading"><h2 id="lp-experiences-title">O desenvolvimento acontece <em>em situações concretas.</em></h2><p>Seis experiências com objetivos diferentes. Cada uma oferece um jeito de observar seu trabalho e avançar a partir dele.</p></div>
        <div className="lp-experience-grid">{publicExperiences.map(item=><a className="lp-experience" href={`/experiencias/${item.slug}`} key={item.slug}>
          <img src={item.image} alt={item.imageAlt} loading="lazy" />
          <span className="lp-experience-content"><span className="lp-experience-meta"><span>{item.number} / {item.audience}</span><span>{item.duration}</span></span><strong>{item.title}</strong><span className="lp-experience-summary">{item.summary}</span><span className="lp-experience-link">Conhecer a experiência <ArrowUpRight size={17} /></span></span>
        </a>)}</div>
        <a className="lp-all-link" href="/experiencias">Ver detalhes de todas as experiências <ArrowRight size={18} /></a>
      </section>

      <section className="lp-mirror" aria-labelledby="lp-mirror-title">
        <div className="lp-mirror-heading"><span className="lp-kicker">ESCUTA COM RESPONSABILIDADE</span><h2 id="lp-mirror-title">A percepção do time precisa de <em>contexto e cuidado.</em></h2><p>No Espelho do Líder, o feedback coletivo ajuda a reconhecer pontos de encontro, diferenças de percepção e uma próxima ação possível.</p><a href="/experiencias/mirror">Entenda o Espelho do Líder <ArrowRight size={17} /></a></div>
        <div className="lp-mirror-flow"><div><span>01</span><strong>Você responde</strong><p>O líder faz sua autoavaliação de comportamentos observáveis.</p></div><div><span>02</span><strong>O time participa</strong><p>Cada pessoa convidada responde individualmente.</p></div><div><span>03</span><strong>Vocês conversam</strong><p>A comparação coletiva aparece após o encerramento e cinco respostas válidas.</p></div><small><Check size={15} /> Respostas individuais do time não são exibidas ao líder.</small></div>
      </section>

      <section className="lp-section lp-company" aria-labelledby="lp-company-title">
        <div className="lp-section-top"><span className="lp-kicker">PARA ORGANIZAÇÕES</span><span className="lp-section-index">EQUIPES / 03</span></div>
        <div className="lp-company-layout"><div><h2 id="lp-company-title">Desenvolvimento que continua <em>depois da experiência.</em></h2><p>Organize pessoas, acompanhe a participação e dê continuidade às conversas de desenvolvimento com experiências individuais, em dupla e em equipe.</p><div className="lp-actions"><a href="/empresas" className="button primary">Conhecer a solução <ArrowRight size={18} /></a><a href="/app" className="button outline">Acessar plataforma</a></div></div><div className="lp-company-list"><div><span>01</span><strong>Convites organizados</strong><p>Reúna participantes e acompanhe quem iniciou ou concluiu cada etapa.</p></div><div><span>02</span><strong>Resultados para agir</strong><p>Consulte devolutivas e acompanhe as ações escolhidas ao longo do tempo.</p></div><div><span>03</span><strong>Privacidade nas respostas</strong><p>As comparações coletivas respeitam as regras de participação de cada experiência.</p></div></div></div>
      </section>

      <section className="lp-faq" aria-labelledby="lp-faq-title"><div><span className="lp-kicker">DÚVIDAS COMUNS</span><h2 id="lp-faq-title">Antes de começar.</h2><p>O que vale saber sobre participação e resultados.</p></div><div className="lp-faq-list"><details><summary>Posso fazer uma experiência sozinho?</summary><p>Sim. Decisões Sob Pressão, Mapa de Energia e Bússola de Carreira são individuais. O Espelho envolve a equipe; o Raio X da Comunicação é feito em dupla.</p></details><details><summary>Como funciona uma experiência em dupla?</summary><p>Você escolhe uma pessoa para convidar. Cada participante responde separadamente. A comparação aparece quando os dois concluírem e consentirem com o compartilhamento.</p></details><details><summary>Quem pode ver minhas respostas?</summary><p>As regras mudam conforme a experiência. Você vê seus próprios resultados; o administrador master pode consultar resultados na plataforma. No Espelho, o líder recebe apenas a percepção agregada do time, depois do encerramento do ciclo e de cinco respostas válidas.</p></details></div></section>

      <section className="lp-final" aria-labelledby="lp-final-title"><span className="lp-kicker">SUA PRÓXIMA CONVERSA COMEÇA AQUI</span><h2 id="lp-final-title">Escolha uma experiência.<br /><em>Leve algo para a prática.</em></h2><p>Pequenas decisões, observadas com atenção, podem abrir conversas melhores.</p><a href="/experiencias" className="button primary">Explorar experiências <ArrowRight size={18} /></a></section>
    </main><PublicFooter /></div>;
}
