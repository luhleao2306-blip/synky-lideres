export const mirrorQuestions = [
  "Escuta até o fim antes de responder em conversas importantes.",
  "Explica prioridades e expectativas com clareza.",
  "Distribui responsabilidades e dá autonomia para executar.",
  "Reconhece contribuições de forma específica.",
  "Convida opiniões diferentes antes de decidir.",
  "Retoma combinados e oferece apoio durante a execução.",
];
export const mirrorLabels = ["Escuta","Clareza","Delegação","Reconhecimento","Abertura","Acompanhamento"];
export const mirrorActions = [
  "Reservar 10 minutos de escuta sem interrupções em cada conversa individual.",
  "Confirmar prioridades e critérios de sucesso ao distribuir uma tarefa.",
  "Pedir uma opinião divergente antes da próxima decisão importante.",
  "Reconhecer uma contribuição específica de alguém a cada semana.",
];
export const communicationTopics = [
  { label: "Pedidos", options: ["Contexto primeiro","Pedido direto"] },
  { label: "Prazos", options: ["Combinar marcos","Definir data final"] },
  { label: "Feedback", options: ["Conversar em particular","Registrar por escrito"] },
  { label: "Divergências", options: ["Debater na hora","Refletir antes"] },
  { label: "Mudanças de plano", options: ["Aviso rápido","Conversa detalhada"] },
];
export type Choice = { text: string; consequence: string; behavior: string };
export type Scene = { title: string; prompt: string; choices: Choice[] };
export type Scenario = { id: string; title: string; summary: string; duration: string; scenes: Scene[] };
export const scenarios: Scenario[] = [
  { id:"erro-entrega", title:"Um erro antes da entrega", summary:"Um dado importante está errado e o prazo termina hoje.", duration:"7 min", scenes:[
    {title:"A descoberta",prompt:"Duas horas antes da apresentação, alguém da equipe encontra um número incorreto no relatório. O que você faz primeiro?",choices:[
      {text:"Reúno quem conhece o dado para dimensionar o impacto.",consequence:"O time identifica quais páginas foram afetadas e quanto tempo a correção exige.",behavior:"Buscou contexto antes de agir"},
      {text:"Peço que corrijam o número imediatamente.",consequence:"A correção começa, mas outras partes ligadas ao número continuam sem revisão.",behavior:"Priorizou velocidade"},
      {text:"Aviso o cliente antes de entender a extensão do problema.",consequence:"O cliente agradece a transparência, mas pede uma previsão que ainda não existe.",behavior:"Priorizou transparência"},
    ]},
    {title:"O alinhamento",prompt:"A correção levará mais tempo que o previsto. O time está tenso. Como você organiza os próximos 40 minutos?",choices:[
      {text:"Divido verificação, correção e comunicação entre pessoas diferentes.",consequence:"Cada pessoa sabe seu papel e o grupo consegue revisar a entrega com mais segurança.",behavior:"Distribuiu responsabilidades"},
      {text:"Assumo a correção para evitar novos erros.",consequence:"Você controla uma parte crítica, mas a revisão fica concentrada em uma pessoa.",behavior:"Centralizou a execução"},
      {text:"Peço ao grupo que decida sem interferir.",consequence:"O time ganha autonomia, mas perde tempo para combinar quem faz o quê.",behavior:"Abriu espaço sem estruturar"},
    ]},
    {title:"A decisão",prompt:"Faltam 20 minutos e ainda há uma página sem validação. Qual é sua escolha?",choices:[
      {text:"Entrego a parte validada e explico o que será atualizado.",consequence:"O cliente recebe informação confiável e uma previsão explícita para o restante.",behavior:"Comunicou limites com clareza"},
      {text:"Envio tudo e reviso depois.",consequence:"A entrega sai no prazo, com risco de um segundo ajuste público.",behavior:"Aceitou risco para cumprir prazo"},
      {text:"Adio tudo sem apresentar alternativa.",consequence:"O time ganha tempo, mas o cliente fica sem material para a reunião.",behavior:"Protegeu a qualidade"},
    ]},
  ]},
  { id:"conflito-time", title:"Um conflito no time", summary:"Duas pessoas discordam sobre como conduzir uma entrega.", duration:"7 min", scenes:[
    {title:"Sinais de tensão",prompt:"Uma reunião termina com interrupções e ironias. Qual é o primeiro passo?",choices:[
      {text:"Converso separadamente com cada pessoa para entender os fatos.",consequence:"Você descobre que há expectativas diferentes sobre quem decide.",behavior:"Escutou perspectivas"},
      {text:"Peço que resolvam entre si.",consequence:"Elas tentam conversar, mas a disputa sobre decisão continua.",behavior:"Preservou autonomia"},
      {text:"Defino imediatamente quem está certo.",consequence:"A discussão para, mas uma pessoa sente que não foi ouvida.",behavior:"Trouxe direção rápida"},
    ]},
    {title:"A conversa conjunta",prompt:"Ambas aceitam conversar, mas começam a defender posições. Como você conduz?",choices:[
      {text:"Peço exemplos concretos e resumo o ponto de cada um.",consequence:"A conversa sai das acusações e chega a situações observáveis.",behavior:"Criou clareza e escuta"},
      {text:"Peço que cada uma ceda metade.",consequence:"Há acordo rápido, mas a causa do atrito permanece.",behavior:"Buscou conciliação"},
      {text:"Explico a solução que considero melhor.",consequence:"O caminho fica claro, embora algumas informações não sejam exploradas.",behavior:"Assumiu a direção"},
    ]},
    {title:"O combinado",prompt:"O grupo definiu um caminho. O que você faz para evitar repetição?",choices:[
      {text:"Registro decisões, responsáveis e uma data de revisão.",consequence:"Todos têm um acordo verificável e oportunidade de ajustar.",behavior:"Acompanhou o combinado"},
      {text:"Encerro a conversa e sigo para a próxima pauta.",consequence:"O clima melhora, mas cada pessoa pode lembrar do acordo de outro jeito.",behavior:"Priorizou fluidez"},
      {text:"Assumo todas as decisões futuras desse projeto.",consequence:"A tensão cai por enquanto, mas a autonomia do time diminui.",behavior:"Centralizou decisões"},
    ]},
  ]},
  { id:"prioridades", title:"Prioridades em mudança", summary:"Uma demanda urgente chega quando o time já está no limite.", duration:"7 min", scenes:[
    {title:"A urgência",prompt:"A direção pede uma entrega nova para amanhã. O time já tem dois compromissos. Como você responde?",choices:[
      {text:"Peço contexto, impacto e margem real do prazo.",consequence:"A urgência ganha contornos mais claros e há espaço para negociar.",behavior:"Investigou a prioridade"},
      {text:"Aceito e peço esforço extra ao time.",consequence:"A demanda avança, mas os compromissos anteriores ficam em risco.",behavior:"Assumiu a urgência"},
      {text:"Recuso sem discutir alternativas.",consequence:"O time fica protegido, mas uma necessidade importante pode ficar descoberta.",behavior:"Protegeu a capacidade"},
    ]},
    {title:"O redesenho",prompt:"Você precisa reorganizar a semana. Como envolve a equipe?",choices:[
      {text:"Mostro os trade-offs e construo uma proposta de corte com o time.",consequence:"A equipe entende o motivo das mudanças e aponta dependências ocultas.",behavior:"Deu contexto e escutou"},
      {text:"Redistribuo tarefas sozinho para ganhar tempo.",consequence:"A mudança é rápida, mas uma tarefa crítica fica com quem não tem disponibilidade.",behavior:"Decidiu com agilidade"},
      {text:"Deixo cada pessoa escolher o que priorizar.",consequence:"Há liberdade, mas as escolhas não se alinham entre si.",behavior:"Abriu autonomia"},
    ]},
    {title:"A comunicação",prompt:"Uma entrega anterior será adiada. O que você comunica aos envolvidos?",choices:[
      {text:"Explico o motivo, o novo prazo e o que será entregue antes.",consequence:"As pessoas conseguem ajustar seus planos e sabem o que esperar.",behavior:"Comunicou uma troca concreta"},
      {text:"Aviso apenas que haverá atraso.",consequence:"A mensagem chega, mas surgem perguntas sobre impacto e próximos passos.",behavior:"Avisou com rapidez"},
      {text:"Espero ter certeza absoluta antes de falar.",consequence:"A informação fica mais precisa, porém outros grupos perdem tempo para reagir.",behavior:"Buscou precisão"},
    ]},
  ]},
];
export function decisionFeedback(scenarioId:string, choices:number[]) {
  const scenario=scenarios.find(s=>s.id===scenarioId);
  if(!scenario || choices.length!==scenario.scenes.length || choices.some((c,i)=>!Number.isInteger(c)||!scenario.scenes[i].choices[c])) return null;
  return scenario.scenes.map((scene,i)=>({moment:scene.title, choice:scene.choices[choices[i]].text, consequence:scene.choices[choices[i]].consequence, behavior:scene.choices[choices[i]].behavior}));
}
