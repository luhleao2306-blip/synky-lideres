# Synky Líderes

Plataforma de experiências de desenvolvimento humano em português do Brasil.

A página pública tem catálogo, páginas próprias das seis experiências e uma página para empresas. Os links entre páginas usam navegação HTML nativa porque a navegação cliente do `next/link` falha no runtime vinext da hospedagem Sites. O acesso às experiências não exige login: cada visitante recebe um espaço próprio, associado a um cookie seguro do navegador.

## Funcional nesta versão

- **Espelho do Líder:** autoavaliação, ciclo, convites vinculados a e-mail, resposta do time, limite de cinco pessoas, comparação agregada após encerramento e ação escolhida.
- **Decisões Sob Pressão:** três cenários jogáveis com três etapas, consequências narrativas e histórico.
- **Raio X da Comunicação:** respostas separadas com consentimento, comparação compartilhada, acordo prático e remoção.
- **Mapa de Energia:** registros rápidos por atividade e dia, padrões por categoria, diário privado e compartilhamento revogável somente do resumo com líder ou RH da mesma empresa.
- **Bússola de Carreira:** oito dilemas, prioridades e tensões para reflexão, novas tentativas e comparação com o histórico pessoal.
- **Termômetro de Liderança:** seleção de até três comportamentos após um Espelho concluído, rodadas respondidas pela mesma equipe e evolução agregada liberada só após encerramento e cinco respostas válidas por item.
- **Equipe:** convites, lista de pessoas, visão de participação da empresa e alteração de perfil pelo administrador.
- **Administração:** criação e alternância entre empresas pelo proprietário; nome e módulos configuráveis pelo administrador de cada empresa.
- Empresas, perfis e dados persistidos em D1; API aplica autorização por empresa e papel.

Visitantes sem conta recebem automaticamente um ambiente pessoal e podem usar as seis experiências. Seus dados são separados dos demais visitantes. Para convidados sem conta, o próprio link funciona como chave de acesso; depois de aceito, fica associado àquele navegador. Convites expiram após sete dias (acesso à empresa) ou quatorze dias (experiências). Contas ChatGPT existentes continuam podendo entrar para administração; nesse caso, o convite exige o e-mail informado.

## Verificação

- `node --test tests/results.test.mjs`
- `node node_modules/typescript/bin/tsc --noEmit`
- `npm run build`

## Limites atuais

O envio automático de convites por e-mail ainda não está configurado. Convites funcionam por links copiados da plataforma. Sem login, o histórico depende do cookie deste navegador e não acompanha a pessoa em outro dispositivo. A integração com o DISC anterior foi retirada do escopo a pedido do proprietário.
