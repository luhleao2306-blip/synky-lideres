import { ArrowLeft, ArrowRight, Check, Clock3, LockKeyhole, UsersRound } from "lucide-react";
import PublicFooter from "@/components/public-footer";
import PublicNavigation from "@/components/public-navigation";
import { publicExperiences } from "@/lib/public-experiences";

export function generateStaticParams(){return publicExperiences.map(item=>({slug:item.slug}))}

export default async function ExperiencePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const item=publicExperiences.find(value=>value.slug===slug);
  if(!item)return <div className="site"><PublicNavigation active="experiences"/><main className="public-content public-missing"><h1>Experiência não encontrada.</h1><a href="/experiencias">Ver todas as experiências <ArrowRight size={16}/></a></main><PublicFooter/></div>;
  return <div className="site"><PublicNavigation active="experiences"/><main className="public-content"><section className={`public-detail-hero ${item.color}`}><div className="public-detail-copy"><a className="public-back" href="/experiencias"><ArrowLeft size={16}/> Todas as experiências</a><span className="eyebrow">EXPERIÊNCIA {item.number}</span><h1>{item.title}<em>.</em></h1><p>{item.summary}</p><div className="public-detail-meta"><span><UsersRound size={17}/>{item.audience}</span><span><Clock3 size={17}/>{item.duration}</span></div><a className="button primary" href={`/app?view=${item.slug}`}>Começar experiência <ArrowRight size={17}/></a><small>Acesso livre. Seu progresso fica vinculado ao seu acesso.</small></div><div className="public-detail-art"><img src={item.image} alt={item.imageAlt}/></div></section><section className="public-detail-grid"><div><span className="kicker">COMO FUNCIONA</span><h2>Um passo de cada vez.</h2><div className="public-step-list">{item.steps.map((step,index)=><div key={step}><span>{String(index+1).padStart(2,"0")}</span><p>{step}</p><Check size={17}/></div>)}</div></div><aside className="public-privacy"><span className="public-privacy-icon"><LockKeyhole size={23}/></span><span className="kicker">QUEM VÊ O RESULTADO</span><h2>Seus dados, com cuidado.</h2><p>{item.privacy}</p></aside></section><section className="public-next"><div><span className="kicker">PRONTO PARA EXPLORAR?</span><h2>Comece no seu ambiente.</h2><p>Responda com calma e volte aos seus resultados quando quiser.</p></div><a className="button primary" href={`/app?view=${item.slug}`}>Acessar {item.title} <ArrowRight size={17}/></a></section></main><PublicFooter/></div>;
}
