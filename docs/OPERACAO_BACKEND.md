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
permite `NULL` em `usuario.email`, `interessado.nome` e `interacao.interessado_id`,
enquanto o backend os trata como obrigatórios. O e-mail também não possui índice único
no schema atual. A consulta de dados não encontrou e-mails nulos ou duplicados. Os
registros antigos sem responsável foram revisados e atribuídos manualmente ao usuário
correto; não há atribuição automática feita pelo backend para dados legados.

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

Não use `clean`, `repair` ou alterações de schema diretamente em produção sem backup
e revisão. A primeira migration depende da inspeção real acima.

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

Cloudflare R2 deve ser integrado somente pelo backend: uma futura entidade `anexo`
deve guardar interessado, usuário que enviou, nome original, chave privada no bucket,
tipo MIME, tamanho e datas. A API deve validar extensão/tamanho/tipo e fornecer URLs
assinadas temporárias; nenhuma chave R2 deve ir para o frontend.

O assistente de IA deve receber a chave da API por variável de ambiente exclusiva do
backend e expor operações de sugestão, resumo ou explicação. Ele não deve executar
mudanças automáticas no funil, tarefas, matrículas ou exclusões. Antes de implementá-lo,
definir limites de dados enviados, logs sem conteúdo sensível, prazo de retenção e o
contrato de cada operação.

## Testes

Execute no diretório `backend`:

```powershell
mvn test
```

Os testes unitários cobrem geração/validação JWT, login e compatibilidade de papel
legado, validações, isolamento de interessados/tarefas/interações, criação forçada de
responsável, bloqueio de transferência por atendente, cálculo de dashboard, respostas
de erro e autorizações HTTP. Os testes de integração contra MySQL e o baseline Flyway
devem ser feitos antes da ativação do Flyway.

## Endpoints preservados

| Método | Endpoint | Acesso |
| --- | --- | --- |
| POST | `/api/auth/login` | Público |
| GET/PATCH | `/api/perfil` | Usuário autenticado, somente o próprio perfil |
| GET/POST/PUT/PATCH/DELETE | `/api/interessados/**` | Autenticado; exclusão somente GESTOR; ATENDENTE limitado aos próprios leads |
| GET/POST/PUT/PATCH/DELETE | `/api/tarefas/**` | Autenticado; exclusão somente GESTOR; ATENDENTE limitado às próprias tarefas |
| POST | `/api/interacoes` | Autenticado e autorizado sobre o interessado |
| GET | `/api/interessados/{id}/interacoes` | Autenticado e autorizado sobre o interessado |
| GET | `/api/cursos` | Autenticado |
| POST/PUT/DELETE | `/api/cursos/**` | GESTOR |
| GET/POST/PUT/DELETE | `/api/usuarios/**` | GESTOR |
| GET | `/api/dashboard` | Autenticado; dados filtrados pelo perfil |

## Compatibilidade com o frontend atual

Os contratos de login, perfil, interessados, etapas do funil, cursos, tarefas,
interações, usuários e dashboard foram conferidos contra `frontend/src/api.js` e as
páginas que chamam a API. Os caminhos, campos JSON e uso de `Authorization: Bearer`
permanecem compatíveis; nenhuma mudança no frontend foi necessária.

Há duas melhorias de interface que podem ser feitas futuramente, mas não bloqueiam o
backend: a tela de tarefas ainda exibe o botão de exclusão para atendente, que recebe
`403` corretamente; e o formulário de interessado pode enviar outro responsável, que
o backend ignora para atendente e substitui pelo usuário do JWT. O ideal é o frontend
ocultar esses controles para reduzir tentativas inválidas.
