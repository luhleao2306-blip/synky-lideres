# Contexto do Synky Líderes

Este documento orienta quem vai continuar o desenvolvimento. O Synky Líderes é uma academia em português do Brasil para desenvolvimento de pessoas que já lideram. O site público está em https://synky-lideres.contato146558.chatgpt.site.

## Direção definida pelo proprietário

O nome é **Synky Líderes** e a identidade usa branco e verde. O pedido original mencionava integração com o Synky DISC, mas o proprietário decidiu depois que essa integração não era necessária. O produto deve seguir o conteúdo do prompt e as referências visuais, preservando uma identidade própria.

A apresentação precisa ser marcante e profissional para quem considera comprar a solução. O proprietário pediu menos texto, prévias interativas que mostrem situações reais do sistema, imagens ligadas à liderança e boa experiência no celular. Evite símbolos genéricos, gráficos com dados inventados, cartões repetitivos, fotos distorcidas ou cortadas e páginas com aparência de catálogo.

## Funcionalidades atuais

A academia tem 25 cursos, 125 aulas e 500 atividades de alternativas. Cada curso tem 20 atividades e sua própria prova de 20 questões, liberada após estudar as aulas e realizar todas as atividades. A conclusão exige nota mínima 8 na prova. O painel possui trilha, atividades, provas, desempenho, biblioteca e perfil.

As seis experiências da implementação original foram retiradas integralmente das telas, páginas, APIs e componentes. URLs públicas antigas redirecionam para os cursos e ações antigas retornam 410. As tabelas antigas permanecem apenas como arquivo, sem consulta pela aplicação atual; não houve descarte de registros históricos no D1.

Resultados agora são de cursos: aulas, atividades, última nota de prova, média das práticas, nota geral, histórico de tentativas, certificados e feedbacks escritos pelo cliente. Clientes consultam seus próprios registros; a administração master pode pesquisar clientes por nome, e-mail ou empresa e abrir seus resultados. Não há exposição de respostas individuais na consulta administrativa.

## Estado visual da página inicial

A capa tem fundo claro, título à esquerda, uma imagem de conversa de equipe e um cartão do Espelho do Líder sobre a foto. Abaixo dela, a versão 33 traz as seis experiências em uma seleção visual, duas demonstrações interativas e uma chamada para empresas. As respostas dadas nas demonstrações não são gravadas.

## Atualização para colaboração — 6 de outubro de 2026

A descrição visual acima registra a versão 33 original. A cópia atual inclui as alterações posteriores da landing page, a marca animada Synky Leaders com transparência e a academia no painel em `/app`. A academia tem 25 cursos, 125 aulas e 500 atividades: vinte por curso (quinze exercícios de duas questões e cinco casos de quatro decisões). Cada curso possui sua própria prova final de vinte questões, liberada somente após estudar suas cinco aulas e realizar suas vinte atividades. Não há prova geral nem dependência entre cursos. A conclusão exige nota mínima 8 na prova do curso. Meu desempenho mostra os cursos abertos, progresso, média das práticas, última nota atual da prova e histórico de tentativas; cursos ainda não iniciados não aparecem nessa seleção. Notas das avaliações gerais anteriores permanecem em um histórico arquivado, sem entrar na média das provas atuais. O menu de experiências e a jornada pessoal foram retirados do painel; links antigos dessas telas voltam à visão geral da academia. Consulte `app/app/JORNADA.md` para a evolução do painel e `README.md` para instalar uma cópia local. O progresso de estudos permanece no navegador, isolado por empresa e pessoa; os demais recursos continuam usando as integrações existentes. O envio desta versão ao GitHub compartilha o código para colaboração e não publica uma nova versão do site hospedado.

## Arquitetura e implantação

O código usa React, Next.js e vinext/Vite. A hospedagem Sites executa a aplicação em Cloudflare Workers com banco D1. As páginas ficam em `app/`, os componentes em `components/`, o conteúdo das experiências em `lib/`, o esquema do banco em `db/` e as migrações em `drizzle/`. As rotas principais da API são `app/api/app/route.ts` e `app/api/results/route.ts`.

O GitHub é o repositório de colaboração. O site publicado pertence ao projeto Sites `appgprj_6ab55eed7e1481918474765781235c05`; alterações no GitHub não entram automaticamente em produção. Preserve os dados do D1 e as regras de privacidade ao publicar uma nova versão. A versão 33 corresponde ao commit `ae9b28db9278b859310eeb4b5fc822773da8dd35` da origem Sites; commits posteriores deste repositório são voltados à colaboração até serem implantados separadamente. O subdomínio `leaders.synky.com.br` está associado a esse projeto Cloudflare Sites.

## Administração da plataforma

A rota `/admin` é uma central restrita à administração master, autorizada no servidor pelas contas administrativas inicialmente associadas a `contato@somus.group` ou `admin@synky.com.br`. Para contas locais, a permissão fica vinculada ao ID autenticado em `synky_auth_admins` e permanece após troca de e-mail; identidades externas mantêm o fluxo de autorização existente. O acesso do projeto usa Cloudflare Workers e o D1 já associado ao Site; não depende de projeto Supabase. Contas locais usam hash PBKDF2 e sessões opacas em cookie HTTP-only. A senha inicial de `admin@synky.com.br` é fornecida como segredo temporário de execução e deve ser removida depois que a conta for criada no primeiro login. A central consulta empresas, pessoas, convites, eventos de acesso e atividades. A academia continua mantendo os detalhes das respostas no navegador, e envia ao D1 somente marcos de aulas e notas para consulta administrativa. Não há tabela de feedback livre. Avaliações individuais de pares continuam sujeitas aos consentimentos e agregações já definidos.

## Limites conhecidos e verificações

Os convites de cadastro são compartilhados manualmente pelo administrador. O progresso detalhado da academia continua no navegador da pessoa; apenas o resumo de estudos e notas é sincronizado à conta no D1. Uma troca de navegador pode não recuperar respostas e rascunhos que ainda só existam localmente.

Em uma instalação limpa em 30 de setembro de 2026, os seis testes de cálculo de resultados e a compilação passaram. O lint encontrou duas ocorrências de `react-hooks/set-state-in-effect` em `app/app/results-panel.tsx` e quatro avisos de uso de `<img>` em páginas públicas. O comando `npm run db:local:init` prepara o D1 local; sem essa etapa a API responde com erro de tabela ausente.

O prompt inicial completo está em [PROMPT-ORIGINAL.txt](PROMPT-ORIGINAL.txt). Suas partes sobre integração com DISC foram substituídas pela decisão posterior descrita acima.


## Perfil da conta — 7 de outubro de 2026

Os itens Minha conta e espaço, Pessoas e convites e Empresas foram retirados do menu do aluno. Meu perfil abre a página própria de foto, e-mail e senha. Links antigos de equipe e empresas no painel levam ao perfil; a administração master continua acessível somente aos perfis autorizados. O site público não foi modificado.

O perfil usa /api/profile e /api/profile/photo, com identidade derivada da sessão autenticada e proteção de origem nas alterações. Fotos PNG/JPEG/WebP são preparadas no navegador em 512x512, com prévia e gravação explícita; o servidor limita o arquivo a 350 KB e verifica assinatura e formato. A foto fica no D1 em synky_profile_photos, servida somente para o próprio usuário autenticado, sem cache público, e aparece no cabeçalho após atualizar os dados.

E-mail e senha exigem confirmação da senha atual e proteção contra repetidas tentativas. Senhas usam o hash existente; alterações acontecem em transação com rotação da sessão e encerramento das demais sessões. Trocar e-mail atualiza os membros pertencentes ao mesmo ID, preservando notas, cursos e papéis, e rejeita endereços em uso e endereços administrativos reservados. Eventos de alteração não incluem senhas ou tokens. A permissão administrativa local é preservada por ID para evitar mudança de acesso ao editar o e-mail. O cadastro continua exclusivo por convite, sem criação de contas pelo perfil. E-mail novo não recebe verificação automática por mensagem.

Contas sem credenciais locais podem editar foto; e-mail e senha permanecem sob responsabilidade do provedor de login, com indicação explícita na tela. As duas tabelas auxiliares são aditivas e inicializadas pelo mecanismo existente de ensureAuthSchema. Checagem de tipos integral e lint dos novos arquivos aprovados; compilação de produção no fluxo de publicação. Nenhuma conta real teve foto, e-mail ou senha alterados para conferência.

## Resultados da academia — 7 de outubro de 2026

Esta atualização substitui as descrições anteriores de persistência somente local. O progresso completo agora é sincronizado no D1 por membro e empresa, com cópia no navegador e recuperação no login. A união preserva aulas e tentativas; revisões e identificador de escrita protegem contra sobrescritas concorrentes. Falhas de recuperação impedem o envio de um histórico vazio e mostram ação para tentar novamente. Notas antigas sem respostas detalhadas ficam preservadas em snapshots; o painel distingue resumo antigo de registro completo e não inventa atividades, notas gerais ou certificados.

Notas de atividades e provas são recalculadas no servidor com o currículo correspondente. A prova exige aulas e atividades anteriores; somente conclusão validada emite um certificado único por membro, empresa e curso. Certificados são registros persistidos e podem ser abertos pelo próprio aluno ou administrador, com impressão/salvamento em PDF. Não são criados retroativamente a partir de notas resumidas sem detalhes.

A nota geral de um curso é a média simples entre a média das últimas práticas atuais realizadas e a última prova atual. A nota geral do cliente é a média dessas notas por curso. Sem prova e práticas, a nota geral fica indisponível. A aprovação continua dependendo da prova ≥ 8 e de todas as aulas e práticas.

Feedback fica disponível em Meu desempenho: curso iniciado, avaliação de 1 a 5 e comentário de até 2.000 caracteres. A pessoa pode atualizar seu próprio feedback; o administrador apenas consulta. As APIs /api/results, /api/academy/progress, /api/academy/feedback e /api/academy/certificates/[id] validam sessão e vínculo no servidor. Alterações exigem origem do próprio site. A migração 0006 é aditiva, com quatro tabelas próprias da academia, também inicializadas pelo mecanismo runtime existente.

Componentes antigos e ações de experiências foram removidos. O layout, imagens e estilos da LP foram mantidos; somente textos que descreviam recursos retirados (FAQ, privacidade e página empresarial) foram corrigidos para o produto atual. Checagem integral de tipos e lint dos arquivos alterados aprovados; compilação de produção pelo fluxo Sites. Nenhum dado de cliente foi criado para conferência e nenhuma conta real foi alterada.

## Fonte da administração — 7 de outubro de 2026

A área /admin usa LandingDisplay (Red Hat Display), já disponível localmente na marca, para títulos, números, menus, campos, botões e consulta de resultados. Títulos e métricas usam peso 600; números de notas e métricas têm alinhamento tabular. A alteração é restrita a app/admin/admin.css e aos seletores dentro de .admin-shell, incluindo a tela de resultados compartilhada somente quando exibida pela administração. Nenhum estilo da LP ou da academia do aluno foi alterado.
