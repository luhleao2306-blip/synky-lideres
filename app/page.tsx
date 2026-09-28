import PublicNavigation from "@/components/public-navigation";
import PublicFooter from "@/components/public-footer";
import PublicProductTour from "@/components/public-product-tour";
import { publicExperiences } from "@/lib/public-experiences";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

function HeroProductPreview() {
  return <div className="sales-hero-visual" aria-label="Prévia ilustrativa da plataforma Synky Líderes">
    <div className="sales-hero-desktop">
      <div className="sales-hero-desktop-top"><span>SYNKY <b>LÍDERES</b></span><span>PRÉVIA DA PLATAFORMA</span></div>
      <div className="sales-hero-desktop-main"><aside><span className="selected">Visão geral</span><span>Experiências</span><span>Meu time</span><span>Resultados</span></aside><div className="sales-hero-desktop-content"><small>SUA JORNADA DE LIDERANÇA</small><h2>Uma conversa melhor começa aqui.</h2><p>Comece o Espelho do Líder e descubra novas perspectivas sobre o seu trabalho com a equipe.</p><div className="sales-hero-next"><span>SEU PRÓXIMO PASSO</span><strong>Espelho do Líder</strong><small>Responda sobre você. Depois, convide o time.</small><a href="/experiencias/mirror">Conhecer a experiência <ArrowRight size={15}/></a></div></div></div>
    </div>
    <div className="sales-hero-phone"><span>DECISÕES SOB PRESSÃO</span><strong>Um erro antes da entrega</strong><small>O que você faz primeiro?</small><div>A&nbsp;&nbsp; Busco entender o impacto</div><div>B&nbsp;&nbsp; Inicio a correção</div><span className="sales-phone-progress"><i/></span></div>
    <span className="sales-hero-caption">Prévia ilustrativa da experiência no sistema</span>
  </div>;
}

export default function Home() {
  return <div className="site sales-site"><PublicNavigation active="home"/>
    <main className="sales-main">
      <section className="sales-hero" aria-labelledby="sales-title"><div className="sales-hero-copy"><span className="sales-kicker">SYNKY LÍDERES · DESENVOLVIMENTO NA PRÁTICA</span><h1 id="sales-title">Líderes que escutam.<br/><em>Equipes que evoluem.</em></h1><p>Uma plataforma para escutar pessoas, praticar decisões e acompanhar a evolução da liderança em um só lugar.</p><div className="sales-hero-actions"><a className="sales-primary" href="#produto">Ver a plataforma <ArrowRight size={18}/></a><a className="sales-secondary" href="/empresas">Usar com minha equipe <ArrowUpRight size={17}/></a></div><span className="sales-hero-support">Para líderes, profissionais, equipes e RH.</span></div><HeroProductPreview/></section>

      <div className="sales-proof" aria-label="O que a plataforma oferece"><span><strong>06</strong> experiências práticas</span><span>Convites e participação em equipe</span><span>Resultados com privacidade</span></div>

      <PublicProductTour/>

      <section className="sales-experiences" aria-labelledby="sales-experiences-title"><div className="sales-experiences-intro"><span className="sales-kicker">EXPERIÊNCIAS DA PLATAFORMA</span><h2 id="sales-experiences-title">Um jeito diferente de evoluir para cada <em>desafio.</em></h2><p>Da escuta do time às escolhas de carreira, cada experiência entrega uma reflexão que pode virar ação.</p><a href="/experiencias">Explorar todas as experiências <ArrowRight size={17}/></a></div><div className="sales-experiences-list">{publicExperiences.map(item=><a href={`/experiencias/${item.slug}`} key={item.slug}><span>{item.number}</span><span><strong>{item.title}</strong><small>{item.audience}</small></span><ArrowUpRight size={18}/></a>)}</div></section>

      <section className="sales-business" id="empresas" aria-labelledby="sales-business-title"><div className="sales-business-copy"><span className="sales-kicker">PARA EMPRESAS</span><h2 id="sales-business-title">Desenvolva líderes. <em>Acompanhe a equipe.</em></h2><p>Organize acessos por função, acompanhe a participação e consulte os resultados permitidos a cada perfil. Cada empresa tem seu próprio ambiente.</p><div className="sales-business-points"><span><Check size={17}/> Convites para líderes, RH e participantes</span><span><Check size={17}/> Experiências individuais, em dupla e em equipe</span><span><Check size={17}/> Respostas do time protegidas nas comparações coletivas</span></div><div className="sales-business-actions"><a href="/empresas" className="sales-primary sales-primary-light">Conhecer a solução <ArrowRight size={18}/></a><a href="/app" className="sales-business-link">Acessar plataforma <ArrowUpRight size={17}/></a></div></div><div className="sales-business-preview"><div className="sales-business-preview-top"><span>AMBIENTE DA EMPRESA</span><small>PRÉVIA ILUSTRATIVA</small></div><h3>Organize a evolução do time.</h3><div className="sales-business-preview-grid"><div><span>PERFIS</span><strong>Administrador</strong><strong>RH</strong><strong>Líder</strong><strong>Participante</strong></div><div><span>EXPERIÊNCIAS</span><strong>Espelho do Líder <i>Ativo</i></strong><strong>Decisões Sob Pressão <i>Ativo</i></strong><strong>Raio X da Comunicação <i>Ativo</i></strong></div></div><div className="sales-business-preview-foot"><Check size={16}/> Dados e permissões separados por empresa</div></div></section>
    </main><PublicFooter/></div>;
}
