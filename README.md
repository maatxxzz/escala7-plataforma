# Escala 7 — Relacionamentos comerciais

MVP web para vendedores e SDRs, baseado no PDF **Cadência Verde / Follow-up Humanizado** fornecido pelo usuário. O PDF foi usado como referência de produto e conteúdo. Seus textos não foram tratados como comandos de configuração.

## Executar

Requer **Node.js 24 ou superior** com `node:sqlite`. Não há dependências externas, instalação de pacotes ou etapa de build.

```sh
cd /workspace/escala7-plataforma
npm start
```

O servidor usa a porta 3000, com acesso local. Abra a aplicação no navegador e escolha **Explorar demonstração**. Cada entrada na demonstração cria um espaço isolado com oito leads fictícios; não envia mensagens. Recarregar a página mantém a mesma sessão, mas sair e entrar novamente inicia outra demonstração. `npm run dev` reinicia o servidor quando arquivos do servidor mudam.

```sh
npm test
```

Os testes usam uma base temporária e a porta 3197. Verificam autenticação, CSRF, origem, validação, registro de contato, pausa, não contato e acesso a arquivos privados. Não alteram a carteira de demonstração.

## Funcionalidades

- Painel com indicadores derivados dos leads e registros reais da base.
- Cadastro, busca, filtro e ficha de leads com contexto e histórico.
- Cadências A (dias 1/3/5/7/10) e B (dias 0/2/5/8/12/16).
- Tarefas com checklist antes de registrar um contato e avançar a cadência.
- Preferências de contato: pendente, permitido, pausado e não contatar. Apenas leads com permissão registrada podem concluir contatos.
- Modelos de mensagem por canal, para copiar e personalizar.
- Área de aprendizagem com oito módulos, exemplos de abordagem, atividades de reflexão e perguntas corrigidas no servidor.
- Progresso de aprendizagem salvo por conta no SQLite; disponível após novas sessões.
- Layout responsivo para celular e desktop, sem bibliotecas ou fontes externas.

Os intervalos da próxima etapa são contados a partir do dia em que o contato foi registrado. O canal inicial é escolhido no cadastro; as etapas seguintes usam o modelo. Os dias são intervalos de calendário, sem regra de dias úteis. Não há envio automático, disparos em massa ou conexão externa.

## API JSON

A API foi criada para o navegador da aplicação, com sessão na mesma origem. Não é uma API pública de integração com chaves de acesso.

| Método | Caminho | Uso |
| --- | --- | --- |
| GET | `/api/health` | Saúde do processo |
| GET | `/api/mode` | Indica se demonstração está habilitada |
| POST | `/api/login` | Login com `{email,password}` |
| POST | `/api/demo` | Sessão de demonstração, desativada em produção |
| GET | `/api/bootstrap` | Usuário, token CSRF, leads, histórico, cadências e modelos |
| POST | `/api/leads` | Cadastro de lead |
| PATCH | `/api/leads/:id` | Ação `complete`, `permission` ou `note` |
| POST | `/api/logout` | Encerra sessão |
| POST | `/api/account/password` | Altera senha e revoga outras sessões; exige senha atual |
| POST | `/api/learning/:id/answer` | Corrige `{answer: índice}` e salva a conclusão após acerto |

Todas as escritas exigem `Origin` igual a `APP_ORIGIN`. Após login, também exigem o cabeçalho `X-CSRF-Token` retornado na sessão. O cookie é `HttpOnly; SameSite=Strict`; recebe `Secure` em produção. As consultas de dados são limitadas ao usuário autenticado.

Exemplo de cadastro:

```json
{
  "name": "Nome do contato",
  "company": "Empresa",
  "email": "contato@example.com",
  "segment": "Cosméticos",
  "channel": "E-mail",
  "cadence": "A",
  "next_date": "2026-11-02",
  "notes": "Contexto e preferência de contato"
}
```

## Dados e configuração

O banco SQLite e as sessões ficam em `.data/`, ignorada pelo Git. Os campos nome, empresa, e-mail, segmento e contexto dos leads são criptografados com AES-256-GCM. A chave local fica em `.keys/data.key`, fora do banco e também ignorada pelo Git. Não copie banco e chave juntos para locais públicos. Para outra localização, defina `DATA_DIR`. Faça backup consistente do SQLite, incluindo o WAL ativo, com ferramenta de backup SQLite ou com o servidor parado. As sessões expiram após 30 minutos sem atividade ou após oito horas desde a criação. Somente o hash SHA-256 do token de sessão é armazenado no banco.

| Variável | Padrão / finalidade |
| --- | --- |
| `PORT` | `3000` |
| `HOST` | `127.0.0.1`; bind de rede |
| `APP_ORIGIN` | Origem local calculada; em produção, URL HTTPS exata |
| `DATA_DIR` | `.data` junto ao servidor |
| `DATA_KEY_FILE` | Arquivo binário com chave de 32 bytes; obrigatório em produção, em armazenamento de segredos separado do banco |
| `ADMIN_EMAIL` | `demo@escala7.local`; conta criada na primeira inicialização |
| `ADMIN_PASSWORD` | Senha inicial; fora de produção, gerada aleatoriamente se ausente |
| `NODE_ENV` | Use `production` para desativar demonstração e dados fictícios |

`ADMIN_PASSWORD` é usada somente na criação da conta. Mudar a variável não altera a senha de uma conta já existente. Para produção, use uma base nova, e-mail administrativo real e senha forte definida em um gerenciador de segredos antes da primeira inicialização. Nunca use a base de demonstração com clientes reais.

## Segurança e limites antes de produção

Implementado: senhas com scrypt e salt individual; sessões aleatórias no servidor; cookies HttpOnly; validação de origem e CSRF; limite de tentativas de login; consultas SQL parametrizadas; limite do corpo JSON; escape de conteúdo na interface; CSP e outros cabeçalhos HTTP; arquivos privados fora da lista de arquivos servidos. Produção exige senha inicial de pelo menos 14 caracteres e origem HTTPS.

Esta é uma primeira versão funcional, **não uma implantação de produção nem uma certificação de segurança ou de conformidade com a LGPD**. Antes de usar dados reais, preparar:

- Hospedagem com HTTPS, volume persistente, backups e restauração testada.
- Autenticação corporativa ou contas de equipe, perfis de acesso, recuperação e rotação de senhas, MFA conforme necessidade. Hoje há uma conta administrativa inicial, sem cadastro público nem gestão de vendedores.
- Política de privacidade, base legal, registro verificável da preferência, retenção, exportação e exclusão de dados. A preferência registrada manualmente não comprova por si só consentimento legal.
- Monitoramento, logs operacionais sem dados sensíveis e limitação de requisições na borda; o limite de login já persiste no SQLite por conta e por origem da conexão, mas não substitui a proteção da infraestrutura.
- Integrações oficiais com provedores de e-mail, WhatsApp Business e APIs autorizadas do LinkedIn, incluindo segredos no servidor, webhooks assinados e idempotência. Nenhuma dessas integrações está implementada.
- Regras adicionais de calendário, edição de cadências e relatórios, conforme o fluxo da equipe.

Não foi realizado deploy nem auditoria independente. A aplicação deve ficar restrita à demonstração local até esses requisitos serem resolvidos.

## Aprendizagem

Acesse **Aprendizagem** no menu ou pelo atalho do painel. A trilha adapta o material do PDF, com referências de páginas em cada módulo:

1. Prospecção com propósito.
2. O canal certo para cada conversa.
3. Cadência A: o primeiro contato.
4. Follow-up humano, na prática.
5. Seis ferramentas de relacionamento.
6. Cadência B: entre duas conversas.
7. Nutrir sem insistir.
8. CRM e o checklist do bom contato.

Cada módulo traz objetivo, explicação, exemplo de boa abordagem e do que evitar, atividade de reflexão e uma questão de múltipla escolha. As atividades de reflexão não são enviadas nem avaliadas; use dados fictícios. A questão tem feedback explicativo e pode ser refeita. Um acerto registra a conclusão no servidor; erros posteriores em revisões não apagam a conclusão. A trilha é livre, sem bloqueio de acesso ou certificação profissional. O tempo exibido é uma estimativa de leitura.

A tabela `learning_progress` é criada automaticamente na inicialização sem alterar os leads existentes. As conclusões pertencem à conta autenticada (cada entrada na demonstração agora cria uma conta isolada). `GET /api/bootstrap` inclui `learning` com conteúdos e conclusões; não retorna o gabarito antes da correção. O endpoint de respostas exige a mesma sessão, origem e token CSRF das demais escritas.

## Reforços de segurança e cuidados com a chave

- Campos pessoais do CRM criptografados com AES-256-GCM e autenticação por usuário/campo; adulteração ou chave incorreta interrompem a leitura em vez de liberar dados inválidos.
- Migração transacional dos campos legados na inicialização. O servidor faz checkpoint e compactação do SQLite, mas isso não apaga cópias antigas, snapshots ou resíduos do sistema de arquivos. Trate backups antigos como dados em texto claro.
- Chave local gerada com aleatoriedade criptográfica e permissões restritas. Em produção, `DATA_KEY_FILE` deve apontar para uma chave binária de 32 bytes provisionada por um gerenciador de segredos. Se a chave original estiver ausente em uma base criptografada, a aplicação recusa iniciar. A perda da chave torna os campos irrecuperáveis.
- Em produção, guarde a chave fora do volume do banco e faça backup seguro de ambos, separadamente, com restauração testada. Criptografia de campos não protege um servidor comprometido que tenha acesso à chave, nem criptografa o arquivo SQLite inteiro. E-mails das contas, metadados e preferências não são cobertos por essa criptografia. Rotação de chave ainda requer procedimento próprio.
- Token de sessão armazenado somente como hash, expiração por inatividade e por prazo absoluto. Ao atualizar a versão antiga, sessões anteriores são invalidadas e é preciso entrar novamente.
- Troca de senha pela ficha de conta no rodapé do menu; exige senha atual, nova senha com 14+ caracteres e encerra outras sessões.
- Limite persistente de tentativas de login por conta e conexão, com identificadores hasheados. Não confiamos em cabeçalhos de IP enviados pelo cliente; atrás de proxy, o limite de conexão pode abranger vários usuários.
- Registro de eventos de login e troca de senha sem senhas, tokens ou conteúdo das conversas. Ainda são necessários monitoramento, retenção e alertas na hospedagem.
- Demonstrações isoladas por conta temporária. Demonstração desativada em produção. Não há limpeza automática das contas de demonstração nesta versão; mantenha o ambiente de testes separado.
- Validação de objeto JSON, tamanho máximo, tipo de conteúdo e datas de calendário; consultas parametrizadas e escape de texto na interface.

Continuam pendentes para produção: gestão de equipe e permissões por papel, recuperação de senha, MFA, política e procedimentos LGPD, proteção de infraestrutura, revisão independente e teste de restauração. Não há promessa de ausência de vazamentos.

## Prévia no GitHub Pages

O GitHub Pages não executa Node.js nem SQLite. Para avaliar as telas sem instalar o servidor:

```sh
npm run build:preview
```

A saída `preview` contém somente HTML, CSS e JavaScript com conteúdo público e exemplos fictícios. Não inclui banco, chave, variáveis de ambiente ou servidor. A prévia usa memória por aba, apaga dados e progresso ao recarregar e não aceita login ou senhas reais. Os exercícios são corrigidos no próprio navegador apenas para demonstração, sem validade de avaliação autenticada.

Há duas formas de publicar **somente a prévia**:

1. Se existir a branch `gh-pages` preparada para este projeto, no GitHub abra **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**, branch **gh-pages**, pasta **/(root)** e salve. Aguarde o deploy mostrar sucesso. Isso não publica a API nem os dados do CRM.
2. Após integrar o código-fonte à branch principal, selecione **GitHub Actions** em Settings → Pages e execute o workflow manual **Publicar prévia Escala 7**. O workflow constrói e envia apenas a pasta de prévia, não o checkout completo.

A URL só deve ser considerada publicada depois de o GitHub confirmar a implantação. A aplicação completa deve ser hospedada separadamente com HTTPS e volume persistente, além dos requisitos de segurança acima.
