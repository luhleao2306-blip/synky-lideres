# Synky Líderes

Plataforma de experiências de desenvolvimento humano em português do Brasil.

## Funcional nesta versão

- **Espelho do Líder:** autoavaliação, ciclo, convites vinculados a e-mail, resposta do time, limite de cinco pessoas, comparação agregada após encerramento e ação escolhida.
- **Decisões Sob Pressão:** três cenários jogáveis com três etapas, consequências narrativas e histórico.
- **Raio X da Comunicação:** respostas separadas com consentimento, comparação compartilhada, acordo prático e remoção.
- **Mapa de Energia:** registros rápidos por atividade e dia, padrões por categoria, diário privado e compartilhamento revogável somente do resumo com líder ou RH da mesma empresa.
- **Bússola de Carreira:** oito dilemas, prioridades e tensões para reflexão, novas tentativas e comparação com o histórico pessoal.
- **Termômetro de Liderança:** seleção de até três comportamentos após um Espelho concluído, rodadas respondidas pela mesma equipe e evolução agregada liberada só após encerramento e cinco respostas válidas por item.
- **Equipe:** convites, lista de pessoas, visão de participação da empresa e alteração de perfil pelo administrador.
- Empresa, perfis e dados persistidos em D1; API aplica autorização por empresa e papel.

O primeiro acesso com a conta proprietária `contato@somus.group` configura a empresa inicial. Convites são gerados como links para compartilhamento manual e expiram após sete dias (acesso à empresa) ou quatorze dias (experiências). Participantes precisam entrar com o mesmo e-mail do convite.

## Verificação

- `node --test tests/results.test.mjs`
- `node node_modules/typescript/bin/tsc --noEmit`
- `npm run build`

## Limites atuais

O ambiente inicial atende uma empresa por conta. A gestão de múltiplas empresas pelo mesmo administrador e o envio automático de convites por e-mail ainda não estão configurados. Convites funcionam por links copiados da plataforma. A integração com o DISC anterior foi retirada do escopo a pedido do proprietário.
