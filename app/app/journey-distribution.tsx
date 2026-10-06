"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartPie, ArrowRight } from "lucide-react";
import { statusLabels } from "./journey-ui";
import type { PersonalJourney } from "./journey-model";
const states=[{status:"draft",color:"#60a5fa"},{status:"active",color:"#1b8b6f"},{status:"paused",color:"#fbbf24"},{status:"completed",color:"#a78bfa"}] as const;
export default function JourneyDistribution({journeys,onStart}:{journeys:PersonalJourney[];onStart:()=>void}) {
 const data=states.map(item=>({...item,name:statusLabels[item.status],value:journeys.filter(journey=>(journey.plan?.status||"draft")===item.status).length})).filter(item=>item.value>0);
 return <section className="j-card p-summary"><h2>Resumo das jornadas</h2>{journeys.length?<><div className="p-distribution"><div className="p-donut" role="img" aria-label="Distribuição de jornadas por estado. Contagens na legenda ao lado."><ResponsiveContainer width="100%" height="100%" minWidth={0}><PieChart accessibilityLayer><Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={68} paddingAngle={3} stroke="#fff" strokeWidth={2} isAnimationActive={false}>{data.map(item=><Cell key={item.status} fill={item.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><span><b>{journeys.length}</b><small>JORNADAS</small></span></div><ul>{data.map(item=><li key={item.status}><span><i style={{background:item.color}}/>{item.name}</span><b>{item.value}</b></li>)}</ul></div><p className="p-data-source">Jornadas não arquivadas neste navegador. O estado acompanha seu plano atual.</p></>:<div className="p-empty"><ChartPie size={27}/><b>Seu desenvolvimento começa com um desafio.</b><p>Após criar sua primeira jornada, acompanhe aqui seus planos em construção, em prática, pausados e concluídos.</p><button className="j-text-button" onClick={onStart}>Criar minha primeira jornada<ArrowRight size={15}/></button></div>}</section>;
}
