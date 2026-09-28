import PublicNavigation from "@/components/public-navigation";
import PublicFooter from "@/components/public-footer";
import { ArrowRight, BarChart3, Compass, MessageCircleMore, UsersRound, Zap } from "lucide-react";

const modules=[
  {title:"Espelho do Líder",description:"Peça feedback e compare percepções coletivas.",icon:UsersRound,view:"mirror"},
  {title:"Decisões Sob Pressão",description:"Escolha caminhos em situações de trabalho.",icon:Zap,view:"decisions"},
  {title:"Raio X da Comunicação",description:"Responda em dupla e registre um acordo.",icon:MessageCircleMore,view:"communication"},
];
const paths=[
  {tag:"PARA VOCÊ",title:"Veja suas escolhas com clareza",description:"Revisite decisões, anote o que dá energia e compare suas prioridades de carreira.",className:"personal",href:"/experiencias",icon:Compass},
  {tag:"PARA TIMES",title:"Combine formas de trabalhar",description:"Cada pessoa responde em separado. Depois, a dupla compara preferências e registra um acordo.",className:"teams",href:"/experiencias/communication",icon:UsersRound},
  {tag:"PARA EMPRESAS",title:"Acompanhe sem expor respostas",description:"Organize convites e veja a participação. A comparação do Espelho exige cinco respostas.",className:"business",href:"/empresas",icon:BarChart3},
];
function MirrorPreview(){
  return <div className="landing-radar landing-process"><div className="landing-radar-top"><span>ESPELHO DO LÍDER</span><small>Como funciona</small></div><h3>Da escuta à prática</h3><ol><li><b>01</b><span><strong>Responda sobre você</strong><small>Avalie comportamentos observáveis.</small></span></li><li><b>02</b><span><strong>Convide seu time</strong><small>Cada pessoa responde individualmente.</small></span></li><li><b>03</b><span><strong>Escolha uma ação</strong><small>Compare percepções e acompanhe a prática.</small></span></li></ol><p>O resultado coletivo aparece com pelo menos cinco respostas, após encerrar o ciclo.</p></div>;
}
export default function Home(){
  return <div className="site"><PublicNavigation active="home"/>
    <main><section className="landing-hero" id="inicio"><div className="landing-copy"><span className="eyebrow">AUTOCONHECIMENTO <b>•</b> PESSOAS <b>•</b> IMPACTO REAL</span><h1>Conheça seu jeito de <em>liderar.</em></h1><p>Descubra padrões, escute seu time e evolua na prática.</p><div className="landing-actions"><a href="/experiencias" className="button primary">Explorar experiências <ArrowRight size={17}/></a><a href="/empresas" className="button outline">Para empresas</a></div><div className="landing-proofs"><span><BarChart3 size={18}/> Resultados ligados às suas respostas</span><span><UsersRound size={18}/> Atividades individuais e em equipe</span><span><Zap size={18}/> Ações para praticar no trabalho</span></div></div><div className="landing-visual"><div className="landing-orbit"/><MirrorPreview/><div className="landing-module-stack">{modules.map((module,i)=><a href={`/experiencias/${module.view}`} className="landing-module" key={module.title}><span className={`landing-module-icon icon-${i}`}><module.icon size={18}/></span><span><strong>{module.title}</strong><small>{module.description}</small></span><ArrowRight size={16}/></a>)}</div></div></section>
    <section className="landing-paths" id="experiencias" aria-label="Caminhos de desenvolvimento">{paths.map(path=><a key={path.tag} href={path.href} className={`landing-path ${path.className}`}><span>{path.tag}</span><path.icon className="landing-path-icon" size={64} strokeWidth={1.2} aria-hidden="true"/><h2>{path.title}</h2><p>{path.description}</p><span className="landing-path-arrow"><ArrowRight size={18}/></span></a>)}</section>
    <section className="how" id="como-funciona"><div><span className="kicker">DA RESPOSTA À AÇÃO</span><h2>O que acontece depois de começar.</h2></div><div className="steps"><div><b>01</b><h3>Responda</h3><p>Escolha uma experiência e registre suas próprias respostas.</p></div><div><b>02</b><h3>Reveja</h3><p>Consulte escolhas, comparações e registros na sua evolução.</p></div><div><b>03</b><h3>Pratique</h3><p>Defina uma ação no trabalho e anote o que aconteceu.</p></div></div></section></main><PublicFooter/></div>;
}
