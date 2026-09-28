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
  { id:"feedback-dificil", title:"Uma conversa de feedback", summary:"Uma entrega recorrente está abaixo do combinado e a conversa foi adiada.", duration:"7 min", scenes:[
    {title:"A preparação",prompt:"Você precisa conversar com uma pessoa que perdeu três prazos. Ela contribui muito em outras frentes. Como começa?",choices:[
      {text:"Reúno exemplos, impactos e abro espaço para ouvir sua perspectiva.",consequence:"A conversa parte de fatos e revela uma dependência que você não conhecia.",behavior:"Preparou uma conversa justa"},
      {text:"Espero mais uma semana para ver se melhora sozinho.",consequence:"A pessoa não recebe orientação e outra entrega fica em risco.",behavior:"Adiou uma conversa necessária"},
      {text:"Envio uma mensagem cobrando mais compromisso.",consequence:"A urgência fica clara, mas a pessoa não sabe quais situações precisam mudar.",behavior:"Sinalizou o problema rapidamente"},
    ]},
    {title:"A reação",prompt:"Durante a conversa, a pessoa diz que recebeu pedidos conflitantes de duas lideranças. O que você faz?",choices:[
      {text:"Peço exemplos e ajudo a definir uma prioridade única com os envolvidos.",consequence:"A causa do atraso fica visível e o time passa a ter um critério comum.",behavior:"Investigou o contexto"},
      {text:"Reforço que os prazos devem ser cumpridos de qualquer forma.",consequence:"A expectativa fica explícita, mas o conflito de prioridades permanece.",behavior:"Enfatizou a responsabilidade individual"},
      {text:"Retiro todas as demandas da pessoa até a situação se acalmar.",consequence:"A pressão diminui, mas a pessoa perde autonomia sem um plano de retomada.",behavior:"Protegeu no curto prazo"},
    ]},
    {title:"O acompanhamento",prompt:"Vocês chegam a um acordo para as próximas entregas. Como transformá-lo em progresso?",choices:[
      {text:"Registro o combinado, marco uma revisão e pergunto que apoio será útil.",consequence:"Há clareza sobre o que observar e uma oportunidade de ajustar o plano.",behavior:"Criou acompanhamento concreto"},
      {text:"Encerramos com a promessa de que vai melhorar.",consequence:"O clima melhora, mas cada um pode entender o acordo de um jeito.",behavior:"Preservou a confiança"},
      {text:"Passo a aprovar cada tarefa antes de ser enviada.",consequence:"Você reduz incertezas, mas cria uma fila de aprovação.",behavior:"Aumentou o controle"},
    ]},
  ]},
  { id:"delegacao", title:"Delegar com autonomia", summary:"Você recebeu um projeto importante e a equipe quer assumir mais responsabilidade.", duration:"7 min", scenes:[
    {title:"A escolha",prompt:"Uma pessoa menos experiente se oferece para liderar uma entrega visível. Como você decide?",choices:[
      {text:"Alinho o resultado esperado, os riscos e o apoio disponível antes de delegar.",consequence:"A pessoa assume uma responsabilidade real com limites compreendidos.",behavior:"Delegou com contexto"},
      {text:"Faço eu mesmo porque o projeto é importante.",consequence:"A qualidade imediata parece mais previsível, mas sua agenda fica sobrecarregada.",behavior:"Centralizou por segurança"},
      {text:"Entrego o projeto inteiro sem conversar sobre critérios.",consequence:"A pessoa ganha espaço, mas pode descobrir expectativas tarde demais.",behavior:"Deu autonomia sem alinhamento"},
    ]},
    {title:"O primeiro obstáculo",prompt:"Na metade do prazo, uma área parceira muda um requisito. A pessoa procura você. O que faz?",choices:[
      {text:"Ajudo a avaliar opções e deixo que ela conduza a negociação.",consequence:"Ela mantém a liderança do projeto e aprende a lidar com a mudança.",behavior:"Apoiou sem tomar o lugar"},
      {text:"Assumo a conversa com a outra área e resolvo sozinho.",consequence:"O impasse pode terminar mais rápido, mas a pessoa sai da decisão.",behavior:"Assumiu o controle da crise"},
      {text:"Peço que resolva sem me envolver.",consequence:"Ela tem liberdade, mas talvez não tenha autoridade para negociar o impacto.",behavior:"Preservou distância"},
    ]},
    {title:"A revisão",prompt:"A entrega ficou boa, embora tenha exigido um ajuste final. Como encerra o projeto?",choices:[
      {text:"Reconheço o resultado, revisamos decisões e combinamos a próxima autonomia.",consequence:"O aprendizado fica explícito e a pessoa sabe o que pode assumir depois.",behavior:"Transformou entrega em desenvolvimento"},
      {text:"Agradeço e passo para o próximo trabalho.",consequence:"O reconhecimento acontece, mas lições úteis não são registradas.",behavior:"Valorizou o resultado"},
      {text:"Foco apenas no ajuste que foi necessário.",consequence:"O erro recebe atenção, porém o progresso pode passar despercebido.",behavior:"Priorizou a correção"},
    ]},
  ]},
  { id:"cansaco-time", title:"Um time no limite", summary:"Os sinais de cansaço aumentam após semanas de entregas intensas.", duration:"7 min", scenes:[
    {title:"O sinal",prompt:"Em duas reuniões, pessoas antes participativas permanecem em silêncio. O que você faz primeiro?",choices:[
      {text:"Converso individualmente e reviso carga, prioridades e obstáculos.",consequence:"Você encontra tarefas invisíveis e entende melhor o que está drenando a equipe.",behavior:"Escutou sinais e investigou causas"},
      {text:"Organizo um encontro para motivar o grupo.",consequence:"Há um momento de conexão, mas a carga de trabalho segue igual.",behavior:"Buscou elevar o ânimo"},
      {text:"Espero alguém pedir ajuda diretamente.",consequence:"Você preserva espaço, mas problemas podem permanecer ocultos.",behavior:"Aguardou um pedido explícito"},
    ]},
    {title:"A negociação",prompt:"Você confirma que o volume de trabalho não cabe na semana. A direção quer manter todos os prazos. O que propõe?",choices:[
      {text:"Levo cenários de escopo e prazo, mostrando consequências de cada opção.",consequence:"A negociação passa a considerar capacidade real e prioridades claras.",behavior:"Tornou os limites visíveis"},
      {text:"Peço mais esforço por um último período.",consequence:"As entregas podem avançar, mas o desgaste continua sem previsão de alívio.",behavior:"Protegeu os compromissos imediatos"},
      {text:"Cancelo atividades sem avisar os envolvidos.",consequence:"O time ganha tempo, mas outras áreas são surpreendidas.",behavior:"Reduziu a carga unilateralmente"},
    ]},
    {title:"A retomada",prompt:"Um prazo foi renegociado. Como evitar que o time volte ao mesmo ponto?",choices:[
      {text:"Crio uma revisão semanal de capacidade e ajusto o que entra na fila.",consequence:"Os sinais de excesso aparecem antes de virar uma nova crise.",behavior:"Criou um ritmo sustentável"},
      {text:"Prometo que a próxima semana será mais tranquila.",consequence:"A intenção é boa, mas sem mudança no processo a carga pode voltar.",behavior:"Ofereceu tranquilidade"},
      {text:"Peço que cada pessoa administre melhor o próprio tempo.",consequence:"Há incentivo à organização, porém demandas concorrentes seguem sem decisão.",behavior:"Transferiu a gestão da carga"},
    ]},
  ]},
];
export function decisionFeedback(scenarioId:string, choices:number[]) {
  const scenario=scenarios.find(s=>s.id===scenarioId);
  if(!scenario || choices.length!==scenario.scenes.length || choices.some((c,i)=>!Number.isInteger(c)||!scenario.scenes[i].choices[c])) return null;
  return scenario.scenes.map((scene,i)=>({moment:scene.title, choice:scene.choices[choices[i]].text, consequence:scene.choices[choices[i]].consequence, behavior:scene.choices[choices[i]].behavior}));
}
