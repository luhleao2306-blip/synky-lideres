# Synky Líderes

Academia em português do Brasil para pessoas que já exercem liderança. A página pública apresenta o produto; o painel exige login, com cadastro exclusivo por convite individual criado pela administração.

## Academia

- 25 cursos, 125 aulas e 500 atividades: vinte atividades de alternativas por curso.
- Uma prova de vinte questões por curso, liberada após suas aulas e atividades; conclusão com nota mínima 8.
- Trilha, biblioteca com busca e favoritos, desempenho, histórico de tentativas e exportação.
- Progresso sincronizado na conta no D1, com cópia no navegador e proteção contra sobrescritas concorrentes.
- Certificado por curso concluído, com impressão e opção de salvar em PDF pelo navegador.
- Feedback por curso: avaliação de 1 a 5 e comentário, com atualização pelo próprio cliente.
- Perfil com foto, troca de e-mail e senha mediante confirmação da senha atual.

## Administração

Em /admin, o administrador master pesquisa clientes e consulta cursos, aulas, atividades, notas de prova, nota geral, certificados e feedbacks reais. Também gera links individuais de cadastro válidos por sete dias e acompanha eventos de acesso e registros da academia. Clientes só consultam seus próprios resultados. As seis ferramentas anteriores foram retiradas; suas tabelas históricas não são mais consultadas.

Nota geral do curso: média simples da média das últimas notas de práticas atuais e da última prova atual. Nota geral do cliente: média dessas notas por curso. Cursos sem prova ou sem práticas ficam fora do cálculo. Resumos anteriores sem respostas detalhadas são identificados e preservados; não geram certificados automaticamente.

## Compilação e manutenção

Use checagem de tipos, lint e compilação antes de publicar. A migração 0006 adiciona as tabelas de registros, snapshots antigos, certificados e feedbacks; o runtime também inicializa essas tabelas de forma idempotente. Os links entre páginas usam navegação HTML nativa por compatibilidade com vinext.

## Desenvolvimento com outra pessoa

O repositório público está em [luhleao2306-blip/synky-lideres](https://github.com/luhleao2306-blip/synky-lideres). Seu colega pode baixar pelo botão **Code → Download ZIP** e extrair a pasta, ou clonar com Git:

```sh
git clone https://github.com/luhleao2306-blip/synky-lideres.git
cd synky-lideres
```

O contexto do produto e os limites conhecidos estão em [docs/CONTEXTO.md](docs/CONTEXTO.md), e as mudanças recentes do painel em [app/app/JORNADA.md](app/app/JORNADA.md). Dentro da pasta do projeto, use Node.js 22.13 ou superior e execute:

```sh
npm ci
npm run db:local:init
npm run dev
```

A prévia local abre em `http://localhost:5173` e usa um banco D1 local, separado dos dados do site publicado. A inicialização do banco só precisa ser feita na primeira execução de uma cópia limpa.

O repositório GitHub serve para revisar e compartilhar o código. Enviar commits ao GitHub não publica automaticamente o site: a implantação de produção é feita no projeto Sites indicado em `.openai/hosting.json`. Abra um pull request para cada mudança antes de incorporá-la à versão principal e mantenha credenciais e arquivos `.env*` fora do Git.

## Limites atuais

Convites de cadastro são compartilhados manualmente; não há envio automático por e-mail. Os detalhes de notas existentes apenas no navegador antigo precisam ser sincronizados entrando no painel nesse navegador. Login local usa Cloudflare Workers/D1, hashes de senha e cookie de sessão protegido; não depende de Supabase. Não exponha credenciais de execução no repositório.
