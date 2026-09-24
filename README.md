# Synky Evolução

Plataforma de experiências de desenvolvimento humano em português do Brasil.

## Funcional nesta versão

- **Espelho do Líder:** autoavaliação, ciclo, convites vinculados a e-mail, resposta do time, limite de cinco pessoas, comparação agregada após encerramento e ação escolhida.
- **Decisões Sob Pressão:** três cenários jogáveis com três etapas, consequências narrativas e histórico.
- **Raio X da Comunicação:** respostas separadas com consentimento, comparação compartilhada, acordo prático e remoção.
- Empresa, perfis e dados persistidos em D1; API aplica autorização por empresa e papel.

O primeiro acesso com a conta proprietária `contato@somus.group` configura a empresa inicial. Convites são gerados como links para compartilhamento manual e expiram após sete dias (acesso à empresa) ou quatorze dias (experiências). Participantes precisam entrar com o mesmo e-mail do convite.

## Verificação

- `node --test tests/results.test.mjs`
- `node node_modules/typescript/bin/tsc --noEmit`
- `npm run build`

## Ainda pendente

A integração com o DISC atual depende do repositório e dados originais, que não estavam no espaço de trabalho. Mapa de Energia, Bússola de Carreira, Termômetro de Liderança e gestão de múltiplas empresas pelo administrador da plataforma ainda não estão implementados. O envio automático de convites por e-mail também não está configurado.
