# Ambiente independente da plataforma

Repositório de destino: `maatxxzz/escala7-plataforma`.

Este projeto deve ter um repositório e um ambiente de nuvem próprios. Não selecione o repositório de apresentação do perfil para desenvolvê-lo ou publicar sua prévia.

Depois de o novo repositório estar criado e o código enviado:

1. Crie um novo ambiente no Codex e selecione somente `maatxxzz/escala7-plataforma`, branch `main`.
2. Use Node.js 24 ou superior. Não é necessário instalar dependências.
3. Na raiz do checkout, execute `npm test` e `npm run build:preview` para validar o ambiente.
4. Inicie a aplicação com `npm start`. Não exponha a demonstração com dados reais.
5. Preserve os diretórios locais `.data` e `.keys` em armazenamento privado. Nunca publique esses diretórios.

Cada tarefa de nuvem já é isolada. Use o checkout existente e não crie worktrees sem pedido explícito.

A prévia do GitHub Pages é separada da aplicação com servidor. O workflow `.github/workflows/pages.yml` publica somente `preview/`. Para usá-lo, ative GitHub Actions em Settings → Pages do NOVO repositório e execute o workflow manual. Nenhum ajuste deve ser feito em Pages do repositório de apresentação para publicar esta plataforma.

A criação do novo repositório e do novo ambiente depende de acesso às respectivas ferramentas. A presença desta documentação ou de um checkout local não confirma que esses recursos já foram criados no GitHub ou no Codex.
