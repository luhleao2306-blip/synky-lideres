# Painel pessoal do Synky Líderes

## Limites e integração

A reconstrução atual está restrita a `app/app/`. O ponto de integração é
`dashboard.tsx`: autenticação, convites, contexto de empresa, permissões,
carregamento de dados e chamadas à API continuam no componente existente.
O novo `JourneyWorkspace` substitui sua composição visual após a resolução do
acesso. As ferramentas anteriores permanecem acessíveis em um grupo próprio.
Não há mudanças em componentes compartilhados, landing page, API ou banco.

## Decisão de armazenamento

O serviço atual não possui entidades para desafios, planos pessoais, exercícios
privados, diário e revisões da nova jornada. Como o pedido restringe a alteração à
interface, não foi criado um serviço de persistência nem reutilizados endpoints
de avaliações corporativas para armazenar reflexões privadas.

O novo progresso é local, em `localStorage`, com chave baseada em `companyId` e
`membership.id` recebidos pelo fluxo de acesso atual. Rascunhos e alterações são
salvos a cada edição. Não há envio automático à empresa, RH ou servidor.
Separação por chave é organização local, não uma barreira de segurança: quem
tiver acesso ao perfil do navegador pode consultar os dados, que não são
criptografados. A interface explica essa limitação, ausência de sincronização e
perda dos registros ao limpar dados do navegador.

São oferecidos backup JSON, importação validada sem sobrescrever jornadas
existentes, resumo TXT e impressão. Arquivar é reversível; reiniciar um ciclo
preserva planos e registros anteriores. Remoção local requer confirmação e não
exclui dados dos serviços anteriores. Dados ilegíveis não são sobrescritos
automaticamente; conflitos entre abas pedem uma escolha e permitem exportação.
Falhas de gravação preservam os textos na aba e mostram recuperação/exportação.

Sincronização privada entre dispositivos depende de uma integração futura com
controle de acesso e regras explícitas de consentimento, retenção e exclusão.
Lembretes atuais aparecem com o painel aberto; não enviam e-mail ou push.

## Conteúdo e dados

As três jornadas recomendadas são autoconfiança para decidir, limites e
priorização e gestão emocional sob pressão. Há um desafio livre, com aviso de
que utiliza perguntas de decisão que podem ser adaptadas no plano.
A reflexão usa seis frequências observáveis e uma regra determinística
explicada na interface. Não é diagnóstico clínico, ranking ou classificação de
personalidade. Sugestões editáveis de plano só são ativadas por confirmação.
Os cenários de decisão reaproveitam conteúdo e cálculo de feedback existentes;
as respostas feitas dentro da nova jornada permanecem locais.

Gráficos mostram exclusivamente registros confirmados do diário da jornada
selecionada. Contagem de práticas exige dois registros no período. Confiança
antes/depois exige duas práticas com ambas as respostas preenchidas. Rascunhos,
respostas ausentes e datas fora do filtro não entram. Intervalos zerados são
contagens derivadas, não métricas ilustrativas. Não são criados indicadores de
clima, engajamento, metas corporativas ou produtividade sem fonte disponível.

## Estrutura

- `journey-model.ts`: tipos, recomendações, validação, agregações e backups.
- `use-journey-store.ts`: persistência local, recuperação e conflito entre abas.
- `journey-workspace.tsx`: menu, contexto, seleção de jornada e exportação.
- `journey-home.tsx`: dashboard pessoal e caminhos recomendados.
- `starting-page.tsx`, `starting-page.css`: ponto de partida em três etapas.
- `journey-forms.tsx`: reflexão, plano, diário e revisão; exporta o ponto de partida.
- `journey-exercises.tsx`: ensaios, cenários e histórico privado.
- `journey-progress.tsx`: gráficos carregados sob demanda e tabela acessível.
- `journey-ui.tsx`, `journey.css`: componentes e estilos exclusivos do painel.

O menu tem grupos, modo compacto com submenus, indicação ativa e nomes
acessíveis. O menu móvel usa fundo inerte, contenção e retorno de foco e Escape.
Movimento reduzido é respeitado. Somente tema claro.

## Verificação

Os testes de modelo usam dados descartáveis em memória, sem acesso à API.
Foram verificadas validação, recomendação, reinício, prazos, agregação, isolamento
de chaves, serialização, importação e falhas de armazenamento. Os testes existentes
de cálculo de resultados foram mantidos.

Uma página temporária de verificação injetou armazenamento em memória pelo
`JourneyStorageContext`. Nela foram exercitados desafio → reflexão → plano →
ensaio e cenário → diário → revisão → reinício, edição sem duplicação,
pausa/retomada, gráficos e exportação. Essa página é removida após a verificação;
nenhum registro fictício é inserido na conta do usuário ou no banco.

## 2026-10-01 — Composição do Synky People para líderes

Referência: componentes reais de `C:/Users/luisf/Projetos/synky-people`, incluindo
AppSidebar, SidebarNav, AppLayout, StatCard, DashboardAnalytics e DecisionCenter.
O People local foi aberto, mas o painel exige uma sessão; suas fontes foram usadas
para reproduzir a composição, sem alterar autenticação nem arquivos do People.

Mudanças restritas ao painel: journey-workspace, journey-home, journey-ui,
journey-progress; novos people-panel.css, journey-dashboard-widgets e
journey-distribution. Tema claro, menu com grupos independentes e navegação por
ícones quando recolhido, cabeçalho compacto, busca funcional por módulo (Ctrl+K),
lembretes locais, cinco indicadores reais e dashboard com cartões reorganizáveis
por arraste ou botões acessíveis. Largura e ordem são preferências locais separadas
por usuário e empresa, sem alterar registros de desenvolvimento.

Os indicadores contam jornadas abertas, planos ativos, práticas confirmadas,
ciclos concluídos e revisões pendentes. O gráfico circular usa o estado atual das
jornadas não arquivadas; evolução e confiança usam os registros confirmados da
jornada selecionada. Não foram copiados níveis, pontos, rankings ou métricas de
RH sem fonte no produto. Os seis fluxos pessoais e as experiências conectadas
continuam disponíveis, mantendo as regras e limitações de armazenamento acima.

Verificação: tipos, lint dos arquivos alterados, build e 18 testes aprovados.
No navegador: busca sem acento e atalho, navegação, grupos do menu, modo compacto,
menu móvel com foco e fundo inativo; reordenação com persistência ao recarregar e
expansão de cartões; gráficos de práticas, confiança e estados com registros
isolados em memória. A rota temporária de validação foi removida após conferir.
Os 142 arquivos protegidos da LP, componentes compartilhados, API e dados
mantiveram seus hashes anteriores.

## 2026-10-01 — Meu ponto de partida

O formulário foi reorganizado em escolha do tema, situação concreta e foco
pessoal. Os quatro temas usam as opções existentes; exemplos são orientações,
sem preencher respostas. Impacto, frequência e disposição continuam como
percepções de 1 a 5, sem indicador ou classificação agregada.

Validação antes de avançar, retorno para editar, resumo e criação/edição da
jornada reaproveitam o modelo e o armazenamento existentes. Estilos exclusivos
da seção, navegação de teclado e transições com movimento reduzido. Verificação
visual em desktop e celular, fluxo de criação e edição em memória, sem inserir
registros na conta. A página temporária foi removida. LP e arquivos compartilhados
permanecem inalterados.

## 2026-10-01 — Identidade verde do painel

A paleta do painel passa a usar o verde `#1B8B6F` da referência, com navegação
verde profunda, superfícies menta, estados ativos e componentes de foco ajustados
para manter contraste. A aplicação está restrita a `people-panel.css`, aos
estilos próprios do ponto de partida e à cor das séries do gráfico pessoal.
Verificação visual no dashboard e no histórico de experiências; a LP e os 142
arquivos protegidos mantiveram seus hashes.

## 2026-10-01 — Painel para o desenvolvimento de quem já lidera

Composição exclusiva de /app com verde, fotografias existentes lidas sem
alterar os arquivos, capas para cada módulo e navegação por seis etapas.
O dashboard acompanha jornadas não arquivadas, planos, práticas, ciclos e
revisões; os gráficos continuam baseados exclusivamente nos registros.
No celular, as etapas podem ser percorridas horizontalmente.

Reflexão com cartões e avanço real de respostas; plano com três ações;
exercícios com fotografias, foco e rolagem ao abrir/avançar; diário com
evidências do ciclo e edição que retorna ao formulário; revisão com
evidências, ajuste, conclusão e recomeço mantendo o histórico. Resumo
com prévia, download e cópia com seleção manual quando indisponível.
Backup JSON tem alternativa de visualização e cópia. Restaurar seleciona
a jornada; navegar sem seleção retoma uma jornada existente quando há uma.

As ferramentas conectadas mantêm suas chamadas, consentimentos, papéis e
regras de agregação. Os novos estilos são ancorados em
.journey-shell.people-panel.leader-panel. Nenhum arquivo da LP foi editado.

Verificação em memória: criação, validação, diagnóstico, edição de plano,
pausa/retomada, reflexão, cenário de três escolhas, dois registros de diário,
edição sem duplicação, gráficos/filtros/tabela, ajuste e conclusão, novo ciclo,
arquivamento/restauração e busca. Seis abas em 390 × 844 sem transbordamento
horizontal, fotografias carregadas. Download TXT conferido no arquivo.
Resultados e filtro, catálogo e filtro e histórico conectados conferidos
sem gravar dados nem enviar convites na conta real. 18 testes existentes
aprovados. Rota temporária de validação removida antes da entrega.

Limitação preservada: a jornada pessoal é salva neste navegador por usuário
e espaço, com backup; ainda não existe sincronização no servidor.

## 2026-10-02 — Academia de desenvolvimento para líderes

O painel /app usa agora um menu superior com visão geral, trilha de estudos,
atividades, prova final, desempenho e biblioteca. A jornada pessoal anterior
e as ferramentas conectadas continuam acessíveis pelo menu da conta, com as
mesmas integrações, permissões e registros. A LP permanece inalterada.

Conteúdo autoral para pessoas que já lideram: quatro módulos (decisões,
comunicação e feedback, delegação e prioridades, desenvolvimento da equipe),
três aulas de leitura por módulo, exemplos de trabalho e sugestões de prática.
Cada atividade oferece quatro questões de marcar. A prova final contém doze
questões diferentes, vinculadas explicitamente às aulas estudadas. A correção
explica a resposta e permite retornar à aula correspondente. Não há vídeos,
certificados ou indicadores de desempenho profissional simulados.

A conclusão de leitura é confirmada pela pessoa. Atividades exigem as três
aulas estudadas; a prova final exige todas as aulas e nota mínima 7 na última
atividade de cada módulo. Notas calculadas de 0 a 10, histórico preservado em
novas tentativas, gráfico interativo das últimas notas, filtros e exportação
CSV/JSON com prévia copiável para navegadores que bloqueiam downloads.

Progresso separado da jornada anterior, por pessoa e espaço, no localStorage
synky:academy:v1. Armazenamento validado, notas recalculadas a partir das
respostas, rascunhos retomáveis, avisos de falha e proteção contra sobrescrita
de dados inválidos. Ainda não há sincronização de estudos no servidor.

Estilos novos restritos a .academy-shell, fotografias existentes reutilizadas
sem alterar os arquivos, verdes profundos e esmeralda, tema claro e movimento
reduzido. Validação em memória: doze aulas, quatro atividades, prova final,
correção de erro, nova tentativa sem apagar histórico, favoritos, retomada,
pré-requisitos, navegação voltar/avançar e filtros do gráfico. Desktop e
celular com menu responsivo e sem transbordamento horizontal. Rota temporária
de verificação removida. Cinco testes do modelo de estudos aprovados.

## 2026-10-02 — Marca Synky Leaders fornecida pelo usuário

Substituição expressamente solicitada para todas as logos, incluindo a LP.
O componente BrandLogo utiliza a imagem fornecida sem redesenhar o símbolo
ou redigitar as letras. A versão inicial usava apenas o quadro estático e foi
substituída por variantes animadas WebP, com fundo transparente e animação
conferida no navegador. O painel e as superfícies claras usam o texto verde
profundo; a LP usa o texto branco sobre verde. A transparência considera a
distância da cor do fundo original (#00120c), preservando as três folhas
completas e suas dobras em verde escuro. Apenas o fundo e sua franja residual
são removidos. O ícone compacto e o favicon usam a animação do símbolo.
O GIF original em Downloads não foi alterado.


## 2026-10-02 — Ampliação da academia de liderança

Alterações limitadas à academia do painel, sem editar a landing page ou a marca.
A trilha passou de quatro cursos com doze aulas para oito cursos com quarenta
aulas (cinco por curso). Cada curso tem quinze atividades de prática separadas
(três por aula), totalizando 120 atividades breves com uma situação objetiva,
nota e correção. Cada curso também tem uma avaliação de dezesseis questões:
as quinze práticas e um caso integrador, totalizando 128 questões nessas
avaliações. As práticas são liberadas pelo estudo da sua aula específica.
A prova final tem quarenta questões diferentes, uma para cada
aula. Novos temas: metas e resultados, confiança e conflitos, mudança e adoção,
e rotina de liderança. As aulas anteriores receberam aprofundamentos; o
material inclui mais de dez mil palavras entre conteúdo, casos e aplicações.

Contadores, navegação entre aulas, pré-requisitos, notas e correção usam as
quantidades do currículo. A biblioteca permite filtrar por curso, busca e
favoritos. O gráfico amplia a área de rolagem conforme o número de avaliações.
IDs antigos, favoritos e rascunhos foram mantidos. Tentativas antigas são
recalculadas somente sobre seu conjunto histórico exato de questões; a
correção mostra esse conjunto e sinaliza a versão anterior. A prova ampliada
exige estudo das quarenta aulas e nota ≥ 7 na avaliação atual de cada curso.
O histórico anterior permanece disponível, mas não substitui novas atividades.
Persistência continua local ao navegador, isolada por empresa e pessoa.
Conferência: tipos e compilação aprovados. No navegador, trilha com oito cursos, lista de quinze práticas por curso, vínculo da prática à aula e bloqueio por estudo, biblioteca com filtro por curso e layout de celular a 390 px sem transbordamento horizontal. Nenhum progresso ou nota de usuário foi criado durante a conferência.


## 2026-10-07 — Academia com aplicação e avaliação avançada

Removidos do menu do aluno os itens de experiências conectadas, histórico, resultados e jornada pessoal (ponto de partida, reflexão, plano, exercícios, diário e revisão). O painel usa a navegação superior da academia; conta, pessoas e administração continuam acessíveis pelos respectivos perfis. Links antigos das telas removidas abrem a visão geral. Não foi alterado nenhum arquivo, imagem ou estilo da landing page.

Os oito cursos mantêm cinco aulas cada, ampliadas com cenário, restrições e raciocínio de aplicação. Cada curso reúne vinte atividades: quinze exercícios de duas questões e cinco casos com quatro decisões. Há filtros por curso, atividades pendentes, realizadas e casos. As avaliações têm vinte questões contextuais; a prova final reúne vinte novos casos que cobrem os oito cursos. As respostas continuam por alternativas, com nota, correção, referência à aula e histórico.

As práticas exigem estudo da aula; a avaliação do curso exige todas as aulas e práticas atuais; nota mínima 8 conclui o curso. A prova final exige os oito cursos concluídos. Versões anteriores de avaliações e práticas preservam notas, rascunhos e correções, mas não substituem os requisitos novos. O resumo administrativo considera a conclusão completa e a nota da versão atual. Nenhum dado real foi criado ou removido.

Verificação: sete testes de conteúdo, cálculo, bloqueios, isolamento e compatibilidade do histórico passaram. Na prévia com armazenamento descartável, conferidos menu, filtro de casos, estudo, liberação da prática, validação de respostas em branco, nota calculada, correção e prova final de vinte questões. Tela de 390 px sem transbordamento horizontal. A rota de prévia é removida antes de publicar. Correções exclusivamente de tipos no cadastro e no buffer de hash também permitem a checagem integral do projeto, sem alterar esses fluxos.
