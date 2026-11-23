# Operação do backend EduLead

## Perfis de execução

O projeto mantém Java 21, Spring Boot 3.4.2 e MySQL. O perfil padrão é `dev`;
produção deve ser explicitamente iniciada com `SPRING_PROFILES_ACTIVE=prod`.

| Perfil | Banco e Hibernate | Seed | JWT | Flyway |
| --- | --- | --- | --- | --- |
| `dev` | MySQL local; `ddl-auto=update` | Ativado por padrão, sem sobrescrever dados | segredo local somente para desenvolvimento | Desativado até o baseline ser feito |
| `prod` | MySQL persistente; `ddl-auto=validate` | Desativado | `JWT_SECRET` obrigatório, sem valor padrão | Desativado até adoção controlada |

Copie `backend/.env.example` para um arquivo local ignorado pelo Git ou configure
as variáveis no terminal/na IDE. O Spring Boot não lê `.env` sozinho: a IDE, um
gerenciador de ambiente ou o terminal deve carregá-lo.

Exemplo para desenvolvimento no PowerShell (preencha somente no seu computador):

```powershell
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:DB_URL = "jdbc:mysql://localhost:3306/edulead?createDatabaseIfNotExist=true"
$env:DB_USER = "root"
$env:DB_PASSWORD = "sua-senha-local"
$env:JWT_SECRET = "um-segredo-local-com-pelo-menos-32-caracteres"
cd backend
mvn spring-boot:run
```

Para produção, configure `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` e
`CORS_ALLOWED_ORIGIN` no provedor de hospedagem. `JWT_SECRET` precisa ter pelo
menos 32 caracteres; a aplicação falha ao iniciar se ele estiver ausente ou curto.
Não versionar essas variáveis.

## Credenciais que estiveram no Git

Uma senha MySQL esteve em commits antigos. Ela deve ser considerada comprometida,
mesmo após a remoção dos arquivos atuais. O histórico não foi reescrito, para não
prejudicar clones e contribuições existentes.

Procedimento manual seguro para a troca:

1. Criar uma senha forte nova para o usuário MySQL utilizado pela aplicação.
2. Atualizar o segredo no ambiente local e, depois, no cofre de segredos do ambiente
   de produção.
3. Reiniciar a aplicação com a nova variável `DB_PASSWORD` e testar o login.
4. Revogar a senha antiga e revisar os privilégios do usuário MySQL (somente o banco
   necessário; sem privilégios administrativos).
5. Revogar e recriar qualquer outro token que seja encontrado em histórico, issues,
   capturas de tela ou logs. Segredos não devem ser enviados ao frontend.

Também foi removido o segredo JWT padrão de produção. O valor de desenvolvimento é
isolado em `application-dev.properties` e não é carregado com o perfil `prod`.

## Autorização

O backend usa Spring Security com `SecurityFilterChain`, sessão stateless e filtro
JWT. O contrato de login permanece `POST /api/auth/login`, retornando `usuario` e
`token`. `GESTORA` e `ADMIN` legados são normalizados para a autoridade `GESTOR` no
token, preservando a compatibilidade com dados antigos.

- **GESTOR**: todos os registros, dashboard geral, usuários, cursos e atribuições.
- **ATENDENTE**: somente interessados sob sua responsabilidade, interações desses
  interessados, tarefas próprias e dashboard derivado desses registros. Pode consultar
  cursos, mas não gerenciar usuários nem transferir responsáveis.
- Ao criar interessado ou tarefa como atendente, o responsável é extraído do JWT. Um
  `responsavel.id` recebido do cliente é ignorado. A atualização de um interessado ou
  tarefa também preserva o responsável para atendentes.
- O login aceita no máximo cinco falhas por combinação de origem e e-mail em uma janela
  de 15 minutos. O sexto pedido retorna `429` e `Retry-After: 900`. O contador é local
  ao processo e é limpo quando a aplicação reinicia.
- O assistente limita chamadas ao provedor a 20 perguntas por usuário em cinco minutos.
  O endpoint continua indisponível quando `AI_ENABLED=false` ou a chave não foi definida.
- Novas senhas e trocas de senha precisam ter pelo menos 8 caracteres e, para evitar o
  truncamento silencioso do BCrypt, no máximo 72 bytes UTF-8. Senhas legadas existentes
  continuam funcionando e são convertidas para BCrypt apenas após login válido.

## Cabeçalhos e navegador

O Nginx do frontend adiciona CSP, HSTS, `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy` e `Permissions-Policy`. A CSP
permite somente recursos do mesmo domínio e as fontes Google usadas pela interface.
`CORS_ALLOWED_ORIGIN` deve ser uma lista de origens explícitas separadas por vírgula;
curingas são recusados na inicialização.

O token JWT permanece em `localStorage` porque este é o contrato do frontend atual.
O CSP reduz a superfície de XSS, mas a proteção máxima exige uma futura migração para
cookie `HttpOnly`/`Secure` e uma estratégia CSRF coordenada com o frontend.

Registros sem responsável não são apagados nem recebem uma atribuição automática.
Gestores continuam vendo-os; atendentes não. Antes de ativar essa regra em uma base
existente, gere uma lista revisável dos interessados e tarefas sem responsável usando
os nomes de colunas confirmados no schema, revise-a com a equipe e atribua cada item
pelo fluxo administrativo existente. Faça backup antes de qualquer correção manual.

## Flyway: adoção segura

O schema MySQL atual foi inspecionado por `SHOW CREATE TABLE`. Existem as tabelas
`curso`, `usuario`, `interessado`, `interacao` e `tarefa`, com as FKs entre cursos,
interessados, tarefas, usuários e interações confirmadas. O banco contém dados; por
segurança, **nenhuma migration inicial foi criada** e o Flyway continua desativado
(`FLYWAY_ENABLED=false`). Isso evita recriar tabelas ou apagar dados.

Foram identificadas diferenças a resolver somente por migration revisada: o banco ainda
permite `NULL` em `usuario.email`, `interessado.nome`, `interacao.interessado_id` e
`tarefa.titulo`, enquanto o backend os trata como obrigatórios. O e-mail também não
possui índice único no schema atual. A consulta de dados não encontrou e-mails nulos ou
duplicados. Os registros antigos sem responsável foram revisados e atribuídos manualmente
ao usuário correto; não há atribuição automática feita pelo backend para dados legados.

Antes de habilitá-lo em outra base existente, um responsável pelo banco deve executar e
guardar o resultado de:

```sql
USE edulead;
SHOW TABLES;
SHOW CREATE TABLE curso;
SHOW CREATE TABLE usuario;
SHOW CREATE TABLE interessado;
SHOW CREATE TABLE interacao;
SHOW CREATE TABLE tarefa;
SHOW INDEX FROM curso;
SHOW INDEX FROM usuario;
SHOW INDEX FROM interessado;
SHOW INDEX FROM interacao;
SHOW INDEX FROM tarefa;
```

Após conferir esse resultado contra as entidades Java e fazer backup:

1. Fazer backup e verificar novamente e-mails nulos/duplicados e referências nulas.
2. Criar migrations somente para mudanças futuras, em
   `backend/src/main/resources/db/migration`.
3. Registrar um baseline do schema existente com a ferramenta Flyway, em uma versão
   anterior à primeira migration nova. Não usar uma migration que recrie o schema atual.
4. Em um clone restaurado do banco, habilitar `FLYWAY_ENABLED=true`, executar `info` e
   `validate`, e só então `migrate`.
5. Para banco novo, criar uma migration inicial a partir do schema **inspecionado e
   aprovado**, testar nela e só depois habilitar Flyway.

### Artefatos preparados

- `docs/sql/flyway-prevalidation.sql`: somente consultas de leitura. Ele verifica
  e-mails nulos/vazios/duplicados, títulos nulos/vazios, definição das colunas,
  charset, collation, índices e constraints atuais.
- `V2__enforce_usuario_email_and_tarefa_title.sql`: torna `tarefa.titulo` e
  `usuario.email` obrigatórios e cria `uk_usuario_email`. A versão é **2** porque a
  versão **1** será somente o baseline manual do schema já existente; não existe e não
  deve existir uma `V1` que recrie tabelas.

O script de pré-validação precisa retornar **zero linhas** nas três primeiras consultas
de dados antes da migration. Caso retorne qualquer linha, pare o procedimento: a equipe
deve decidir e corrigir manualmente os dados, com backup e aprovação. A migration não
faz correção automática e pode falhar de forma segura se a pré-condição não for atendida.

### Teste em cópia isolada

O projeto possui as dependências Flyway, mas não configura o plugin Maven nem inclui a
CLI. Por isso, `info`, `validate` e `baseline` devem ser executados com uma instalação
externa e aprovada da Flyway CLI compatível com a versão resolvida pelo Spring Boot. Não
execute estes comandos no banco real.

1. Faça backup do banco real e restaure-o em um banco MySQL de teste com outro nome.
2. Compare `SHOW CREATE TABLE` e `SHOW INDEX` da cópia com o backup/origem e confirme
   que ela contém os mesmos dados e schema antes de continuar.
3. No cliente MySQL da cópia, execute o conteúdo de
   `docs/sql/flyway-prevalidation.sql`. Corrija manualmente qualquer resultado de dados
   incompatíveis antes de seguir.
4. No diretório `backend`, configure variáveis que apontem **somente** para a cópia:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/edulead_teste"
$env:DB_USER = "usuario_de_teste"
$env:DB_PASSWORD = "senha-local-da-copia"
$migrationPath = "filesystem:$((Resolve-Path 'src/main/resources/db/migration').Path.Replace('\', '/'))"
```

5. Com a Flyway CLI instalada, registre o baseline explicitamente. O comando cria
   apenas a tabela de histórico do Flyway na cópia e marca o schema existente como
   versão `1`:

```powershell
flyway "-url=$env:DB_URL" "-user=$env:DB_USER" "-password=$env:DB_PASSWORD" "-locations=$migrationPath" "-baselineVersion=1" baseline
flyway "-url=$env:DB_URL" "-user=$env:DB_USER" "-password=$env:DB_PASSWORD" "-locations=$migrationPath" info
flyway "-url=$env:DB_URL" "-user=$env:DB_USER" "-password=$env:DB_PASSWORD" "-locations=$migrationPath" validate
```

6. Habilite o Flyway somente para a cópia (`$env:FLYWAY_ENABLED = "true"`) e inicie o
   backend com o perfil `prod`. A integração Spring Boot aplicará a `V2`; depois, use
   novamente `flyway info` e execute as consultas de metadados do pré-check para
   confirmar `NOT NULL` e o índice único.

```powershell
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:JWT_SECRET = "um-segredo-de-teste-com-pelo-menos-32-caracteres"
$env:CORS_ALLOWED_ORIGIN = "http://localhost:5173"
$env:FLYWAY_ENABLED = "true"
mvn spring-boot:run
```

7. Se qualquer etapa falhar, pare a aplicação, descarte apenas a cópia de teste e
   restaure novamente o backup nela. Não use `clean` ou `repair` como tentativa de
   reversão.

`FLYWAY_ENABLED=false` continua sendo o padrão em `dev` e `prod`. A ativação no banco
real só pode ocorrer após esse roteiro ser concluído e revisado pela equipe.

## Seed de desenvolvimento

`SeedData` existe somente com perfil `dev` e `SEED_ENABLED=true`. Ele só cria dados
demonstrativos se não houver usuário algum no banco; não sobrescreve dados. Em produção
ele nunca é carregado. Para demonstração local recém-criada, o usuário é
`ana@edulead.com` com senha `123456`; é uma conta didática, não deve ser usada em
produção nem em banco acessível pela internet.

## Onboarding proposto (não implementado)

Quando o fluxo do frontend estiver definido, a proposta é criar um registro por
usuário, por exemplo `onboarding_progresso`, com `usuario_id` único, `concluido`,
`etapa_atual`, `concluido_em`, `criado_em` e `atualizado_em`.

Contrato sugerido, sempre usando o usuário do JWT:

```text
GET   /api/onboarding/me
PATCH /api/onboarding/me
```

```json
{
  "concluido": false,
  "etapaAtual": "FUNIL",
  "concluidoEm": null
}
```

O `PATCH` deve aceitar somente transições permitidas pelo tutorial. O endpoint de
leitura permite rever o tutorial sem alterar o progresso. Nenhuma tabela ou endpoint
foi criado nesta etapa para não fixar o contrato antes da definição do frontend.

## Próximas extensões: anexos e IA

### Arquivos privados com Cloudflare R2

A migration `V3__create_anexo.sql` cria a tabela `anexo` para guardar somente
metadados: nome original, MIME type, tamanho, chave privada, interessado, usuário que
enviou e data. Ela deve ser testada em uma cópia do banco antes de ser aplicada.

Com `R2_ENABLED=true`, o backend aceita PDF, PNG, JPG/JPEG, DOC e DOCX de até 10 MB. Ele confere extensão, MIME declarado e assinatura básica do conteúdo. Para produção, mantenha um antivírus/serviço de inspeção complementar: essa verificação não substitui a análise contra malware.
O conteúdo fica no bucket privado e o MySQL guarda apenas metadados. Upload, listagem e
download verificam o acesso ao interessado. Downloads retornam URLs temporárias, limitadas
pelo backend a 1--60 minutos; trate-as como credenciais temporárias e não as registre em
logs ou mensagens. Gestor pode excluir qualquer anexo e atendente apenas os que enviou.

```text
R2_ENABLED=true
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_BUCKET=nome-do-bucket-privado
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_MAX_FILE_SIZE=10MB
R2_MAX_FILE_SIZE_BYTES=10485760
R2_SIGNED_URL_MINUTES=10
```

Nunca exponha as chaves R2 no frontend. Se o navegador receber URLs assinadas, configure
CORS no bucket para a origem permitida do frontend.

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| GET/POST | `/api/interessados/{id}/anexos` | Listar ou enviar anexo autorizado |
| GET | `/api/anexos/{id}/download` | Obter URL temporária de download |
| DELETE | `/api/anexos/{id}` | Excluir objeto e metadados autorizados |

### Histórico do funil

A migration `V4__create_historico_etapa.sql` prepara a tabela `historico_etapa`.
Ela é aditiva: não altera nem remove registros existentes. A cada mudança de etapa, o
backend registra a etapa anterior, a nova etapa e a data. Como as demais migrations,
execute-a primeiro em uma cópia validada do banco usando Flyway; a configuração padrão
continua com Flyway desativado.

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| GET | `/api/interessados/{id}/historico-etapas` | Consultar as mudanças autorizadas de etapa |

### Assistente interno de IA

O assistente atende apenas funcionários autenticados e explica os módulos e fluxos do
EduLead. Ele não recebe dados de interessados, não executa ações e não expõe senhas,
tokens ou informações de outro usuário. Perguntas com e-mail ou telefone são recusadas
antes de chamar o provedor; ainda assim, usuários não devem inserir dados pessoais. O contrato `AssistantProvider` permite trocar
o provedor sem alterar endpoints. A implementação atual usa Gemini quando configurada.

```text
AI_ENABLED=true
AI_PROVIDER=gemini
GEMINI_API_KEY=...
AI_MODEL=gemini-3.5-flash-lite
```

Sem essas variáveis, o endpoint informa que o assistente não está configurado. Endpoints:
`GET /api/assistente/status` e `POST /api/assistente` com `{ "pergunta": "..." }`.

### Apresentação e onboarding

A apresentação pública fica disponível antes do login. Após a autenticação, o botão
**Assistente** fica na barra superior para tirar dúvidas sobre os módulos. O onboarding
ainda não persiste progresso nesta versão.

## Testes

Execute no diretório `backend`:

```powershell
mvn test
```

Os testes unitários cobrem geração/validação JWT, login e compatibilidade de papel
legado, validações, isolamento de interessados/tarefas/interações, criação forçada de
responsável, bloqueio de transferência por atendente, CRUD de cursos, edição e conclusão
de tarefas, registro de interações, movimentação do funil, cálculo de dashboard,
respostas de erro e autorizações HTTP. Os testes de integração contra MySQL e o baseline
Flyway devem ser feitos antes da ativação do Flyway.

## Endpoints preservados

| Método | Endpoint | Acesso |
| --- | --- | --- |
| POST | `/api/auth/login` | Público |
| GET/PATCH | `/api/perfil` | Usuário autenticado, somente o próprio perfil |
| GET/POST/PUT/PATCH/DELETE | `/api/interessados/**` | Autenticado; exclusão somente GESTOR; ATENDENTE limitado aos próprios leads |
| GET/POST/PUT/PATCH/DELETE | `/api/tarefas/**` | Autenticado; exclusão somente GESTOR; ATENDENTE limitado às próprias tarefas |
| POST | `/api/interacoes` | Autenticado e autorizado sobre o interessado |
| GET | `/api/interessados/{id}/interacoes` | Autenticado e autorizado sobre o interessado |
| GET | `/api/interessados/{id}/historico-etapas` | Autenticado e autorizado sobre o interessado |
| GET | `/api/cursos` | Autenticado |
| POST/PUT/DELETE | `/api/cursos/**` | GESTOR |
| GET/POST/PUT/DELETE | `/api/usuarios/**` | GESTOR |
| GET | `/api/dashboard` | Autenticado; dados filtrados pelo perfil |

## Compatibilidade com o frontend atual

Os contratos de login, perfil, interessados, etapas do funil, cursos, tarefas,
interações, usuários e dashboard foram conferidos contra `frontend/src/api.js` e as
páginas que chamam a API. Os caminhos, métodos HTTP, campos JSON, resposta do login
(`usuario` e `token`) e uso de `Authorization: Bearer` permanecem compatíveis; nenhuma
mudança no frontend foi necessária.

Há duas melhorias de interface que podem ser feitas futuramente, mas não bloqueiam o
backend: a tela de tarefas ainda exibe o botão de exclusão para atendente, que recebe
`403` corretamente; e o formulário de interessado pode enviar outro responsável, que
o backend ignora para atendente e substitui pelo usuário do JWT. O ideal é o frontend
ocultar esses controles para reduzir tentativas inválidas.
