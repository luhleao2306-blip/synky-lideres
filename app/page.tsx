import Link from "next/link";
import { ArrowRight, ArrowUpRight, BarChart3, MessageCircleMore, Sparkles, UsersRound, Zap } from "lucide-react";

const modules=[
  {title:"Espelho do Líder",description:"Reflita sobre seus padrões e amplie sua consciência.",icon:UsersRound},
  {title:"Decisões Sob Pressão",description:"Explore como você decide em cenários desafiadores.",icon:Zap},
  {title:"Raio X da Comunicação",description:"Entenda o impacto da sua comunicação no time.",icon:MessageCircleMore},
];
const paths=[
  {tag:"PARA VOCÊ",title:"Autoconhecimento que vira ação",description:"Experiências imersivas para descobrir padrões, fortalecer habilidades e liderar com mais clareza e propósito.",className:"personal"},
  {tag:"PARA TIMES",title:"Conversas que geram evolução",description:"Ferramentas para estimular diálogos sinceros, aumentar a colaboração e transformar insights em ação no dia a dia.",className:"teams"},
  {tag:"PARA EMPRESAS",title:"Liderança como vantagem coletiva",description:"Uma visão compartilhada para desenvolver líderes, fortalecer culturas e acompanhar mudanças com cuidado.",className:"business"},
];
function Radar(){
  const labels=["Visão","Comunicação","Gestão","Execução","Escuta","Decisão"];
  return <div className="landing-radar"><div className="landing-radar-top"><span>SEU PERFIL DE LIDERANÇA</span><small>Uma visão para conversar</small></div><h3>Visão geral</h3><svg viewBox="0 0 390 315" role="img" aria-label="Ilustração de uma comparação de habilidades de liderança">
    {[1,2,3,4].map(n=><polygon key={n} points={Array.from({length:6},(_,i)=>{const a=-Math.PI/2+i*Math.PI/3;return `${195+Math.cos(a)*28*n},${160+Math.sin(a)*28*n}`}).join(" ")} fill="none" stroke="#e0ebe1"/>)}
    {Array.from({length:6},(_,i)=>{const a=-Math.PI/2+i*Math.PI/3;return <line key={i} x1="195" y1="160" x2={195+Math.cos(a)*112} y2={160+Math.sin(a)*112} stroke="#e0ebe1"/>})}
    <polygon points="195,71 272,112 270,205 195,245 124,204 117,116" fill="#168960" fillOpacity=".16" stroke="#168960" strokeWidth="2"/>
    <polygon points="195,94 252,128 253,196 195,223 137,193 140,132" fill="#b2d4b9" fillOpacity=".15" stroke="#a3c9ac" strokeWidth="2" strokeDasharray="4 4"/>
    {labels.map((label,i)=>{const a=-Math.PI/2+i*Math.PI/3;return <text key={label} x={195+Math.cos(a)*141} y={164+Math.sin(a)*133} textAnchor="middle" fill="#345b42" fontSize="10">{label}</text>})}
  </svg><div className="landing-radar-legend"><span><i/>Você</span><span><i/>Seu time</span></div></div>;
}
export default function Home(){
  return <div className="site"><header className="topbar"><Link className="brand" href="/" aria-label="Synky Evolução, início"><span className="mark">S<i/></span><span>synky<small>EVOLUÇÃO</small></span></Link><nav aria-label="Navegação principal"><a href="#inicio" className="current">Início</a><a href="#experiencias">Experiências</a><a href="#empresas">Para empresas</a><Link href="/app" className="nav-enter">Entrar</Link></nav></header>
    <main><section className="landing-hero" id="inicio"><div className="landing-copy"><span className="eyebrow">AUTOCONHECIMENTO <b>•</b> PESSOAS <b>•</b> IMPACTO REAL</span><h1>Conheça seu jeito de <em>liderar.</em></h1><p>Descubra padrões, escute seu time e evolua na prática.</p><div className="landing-actions"><Link href="/app" className="button primary">Explorar experiências <ArrowRight size={17}/></Link><a href="#empresas" className="button outline">Para empresas</a></div><div className="landing-proofs"><span><BarChart3 size={18}/> Insights práticos baseados em evidências</span><span><UsersRound size={18}/> Experiências individuais e para times</span><span><Zap size={18}/> Evolução contínua no seu contexto</span></div></div><div className="landing-visual"><div className="landing-orbit"/><Radar/><div className="landing-module-stack">{modules.map((module,i)=><Link href="/app" className="landing-module" key={module.title}><span className={`landing-module-icon icon-${i}`}><module.icon size={18}/></span><span><strong>{module.title}</strong><small>{module.description}</small></span><ArrowRight size={16}/></Link>)}</div></div></section>
    <section className="landing-paths" id="experiencias" aria-label="Caminhos de desenvolvimento">{paths.map(path=><Link key={path.tag} href="/app" className={`landing-path ${path.className}`} id={path.className==="business"?"empresas":undefined}><span>{path.tag}</span><h2>{path.title}</h2><p>{path.description}</p><span className="landing-path-arrow"><ArrowRight size={18}/></span></Link>)}</section>
    <section className="how" id="como-funciona"><div><span className="kicker">DO INSIGHT À AÇÃO</span><h2>Seu desenvolvimento acontece em movimento.</h2></div><div className="steps"><div><b>01</b><h3>Explore</h3><p>Responda experiências curtas e relevantes, no seu ritmo.</p></div><div><b>02</b><h3>Entenda</h3><p>Veja padrões e perguntas que abrem novas perspectivas.</p></div><div><b>03</b><h3>Experimente</h3><p>Escolha uma ação pequena e acompanhe sua prática.</p></div></div></section></main><footer className="footer"><span className="brand"><span className="mark">S<i/></span><span>synky<small>EVOLUÇÃO</small></span></span><span>Desenvolvimento humano com espaço para cada pessoa.</span><Link href="/app">Acessar plataforma <ArrowUpRight size={16}/></Link></footer></div>;
}
