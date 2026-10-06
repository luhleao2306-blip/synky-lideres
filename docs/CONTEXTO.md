# Contexto do Synky Líderes

Este documento orienta quem vai continuar o desenvolvimento. O Synky Líderes é uma plataforma em português do Brasil para experiências práticas de liderança, comunicação, carreira e trabalho em equipe. O site público está em https://synky-lideres.contato146558.chatgpt.site.

## Direção definida pelo proprietário

O nome é **Synky Líderes** e a identidade usa branco e verde. O pedido original mencionava integração com o Synky DISC, mas o proprietário decidiu depois que essa integração não era necessária. O produto deve seguir o conteúdo do prompt e as referências visuais, preservando uma identidade própria.

A apresentação precisa ser marcante e profissional para quem considera comprar a solução. O proprietário pediu menos texto, prévias interativas que mostrem situações reais do sistema, imagens ligadas à liderança e boa experiência no celular. Evite símbolos genéricos, gráficos com dados inventados, cartões repetitivos, fotos distorcidas ou cortadas e páginas com aparência de catálogo.

## Funcionalidades atuais

Há seis experiências: Espelho do Líder, Decisões Sob Pressão, Raio X da Comunicação, Mapa de Energia, Bússola de Carreira e Termômetro de Liderança. O produto tem formulários, resultados e histórico, além de empresas, membros, convites, perfis de acesso, área de time e painel de evolução. A área de Resultados permite consultar o próprio histórico; a administração master pode localizar pessoas em todos os espaços.

O acesso às experiências é público. Cada visitante recebe um ambiente pessoal associado ao navegador. A administração central permanece protegida. O servidor aplica permissões por empresa e por perfil. Espelho do Líder e Termômetro só mostram médias do time depois do encerramento e de pelo menos cinco respostas válidas. A comparação do Raio X da Comunicação exige que as duas pessoas concluam e autorizem o compartilhamento.

## Estado visual da página inicial

A capa tem fundo claro, título à esquerda, uma imagem de conversa de equipe e um cartão do Espelho do Líder sobre a foto. Abaixo dela, a versão 33 traz as seis experiências em uma seleção visual, duas demonstrações interativas e uma chamada para empresas. As respostas dadas nas demonstrações não são gravadas.

## Atualização para colaboração — 6 de outubro de 2026

A descrição visual acima registra a versão 33 original. A cópia atual inclui as alterações posteriores da landing page, a marca animada Synky Leaders com transparência e a academia no painel em `/app`. A academia tem oito cursos, quarenta aulas, quinze práticas por curso, avaliações de dezesseis questões e prova final de quarenta questões. Consulte `app/app/JORNADA.md` para a evolução do painel e `README.md` para instalar uma cópia local. O progresso de estudos permanece no navegador, isolado por empresa e pessoa; os demais recursos continuam usando as integrações existentes. O envio desta versão ao GitHub compartilha o código para colaboração e não publica uma nova versão do site hospedado.

## Arquitetura e implantação

O código usa React, Next.js e vinext/Vite. A hospedagem Sites executa a aplicação em Cloudflare Workers com banco D1. As páginas ficam em `app/`, os componentes em `components/`, o conteúdo das experiências em `lib/`, o esquema do banco em `db/` e as migrações em `drizzle/`. As rotas principais da API são `app/api/app/route.ts` e `app/api/results/route.ts`.

O GitHub é o repositório de colaboração. O site publicado pertence ao projeto Sites `appgprj_6ab55eed7e1481918474765781235c05`; alterações no GitHub não entram automaticamente em produção. Preserve os dados do D1 e as regras de privacidade ao publicar uma nova versão. A versão 33 corresponde ao commit `ae9b28db9278b859310eeb4b5fc822773da8dd35` da origem Sites; commits posteriores deste repositório são voltados à colaboração até serem implantados separadamente.

## Limites conhecidos e verificações

Os convites são compartilhados por link ou por uma mensagem preparada no aplicativo de e-mail do usuário; o envio automático ainda não está configurado. Visitantes sem login dependem do cookie do navegador para recuperar o histórico, inclusive entre dispositivos.

Em uma instalação limpa em 30 de setembro de 2026, os seis testes de cálculo de resultados e a compilação passaram. O lint encontrou duas ocorrências de `react-hooks/set-state-in-effect` em `app/app/results-panel.tsx` e quatro avisos de uso de `<img>` em páginas públicas. O comando `npm run db:local:init` prepara o D1 local; sem essa etapa a API responde com erro de tabela ausente.

O prompt inicial completo está em [PROMPT-ORIGINAL.txt](PROMPT-ORIGINAL.txt). Suas partes sobre integração com DISC foram substituídas pela decisão posterior descrita acima.
