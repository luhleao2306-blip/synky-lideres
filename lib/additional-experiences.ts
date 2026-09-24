export const energyTypes = ["Reuniões", "Foco individual", "Colaboração", "Planejamento", "Atendimento", "Aprendizado"] as const;
export type EnergyEntry = { entryDate: string; activityType: string; energy: number };
export function summarizeEnergy(entries: EnergyEntry[]) {
  const categories=energyTypes.map(type=>{
    const values=entries.filter(entry=>entry.activityType===type).map(entry=>entry.energy);
    return {type,count:values.length,average:values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10:null};
  }).filter(category=>category.count>0);
  const days=[...new Set(entries.map(entry=>entry.entryDate))].sort().map(date=>{
    const values=entries.filter(entry=>entry.entryDate===date).map(entry=>entry.energy);
    return {date,count:values.length,average:Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10};
  });
  return {total:entries.length,categories,days};
}

export const careerAxes=[
  {left:"Autonomia",right:"Orientação próxima",question:"Ao começar um projeto novo, o que mais ajuda você a avançar?",options:["Definir meu caminho e alinhar marcos", "Ter acompanhamento frequente para decidir"]},
  {left:"Gestão",right:"Especialização",question:"Uma oportunidade abre espaço para uma nova responsabilidade. O que chama mais sua atenção?",options:["Orientar pessoas e coordenar entregas", "Aprofundar uma habilidade técnica"]},
  {left:"Variedade",right:"Estabilidade",question:"Você pode escolher seu próximo ciclo de trabalho. Qual cenário parece mais estimulante hoje?",options:["Projetos diferentes e aprendizado constante", "Um plano previsível para ganhar domínio"]},
  {left:"Influência entre áreas",right:"Profundidade técnica",question:"Um desafio exige sua contribuição. Onde você prefere concentrar tempo?",options:["Conectar áreas e construir alinhamento", "Resolver a parte técnica em profundidade"]},
] as const;
export const careerDilemmas=[
  ...careerAxes.map((axis,index)=>({...axis,axis:index})),
  {axis:0,question:"Surge uma decisão ambígua com prazo curto. Que apoio você escolheria?",options:["Liberdade para testar uma solução e prestar contas", "Trocas frequentes com alguém experiente"]},
  {axis:1,question:"No próximo ano, qual contribuição você gostaria de praticar mais?",options:["Desenvolver outras pessoas", "Ser referência em um assunto específico"]},
  {axis:2,question:"O time planeja a próxima fase. O que você prefere explorar?",options:["Alternar desafios e contextos", "Consolidar um processo que já funciona"]},
  {axis:3,question:"Você recebe duas propostas para a mesma semana. Qual escolheria agora?",options:["Facilitar uma decisão entre áreas", "Investigar a causa técnica de um problema"]},
];
export function careerPriorities(choices:number[]){
  if(choices.length!==careerDilemmas.length||choices.some(choice=>choice!==0&&choice!==1))return null;
  return careerAxes.map((axis,index)=>{
    const related=careerDilemmas.flatMap((dilemma,i)=>dilemma.axis===index?[choices[i]]:[]);
    const left=related.filter(choice=>choice===0).length;
    return {left:axis.left,right:axis.right,leftCount:left,rightCount:related.length-left,mixed:left===1};
  });
}
