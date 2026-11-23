# 🎓 EduLead — CRM Educacional

> Plataforma web de CRM desenvolvida para instituições de ensino, com foco na captação, organização e acompanhamento de potenciais alunos desde o primeiro contato até a matrícula.

O **EduLead** foi desenvolvido como projeto acadêmico no **Projeto Prático 2026.2**, integrando desenvolvimento web, banco de dados, arquitetura de software, segurança, UX/UI e práticas de desenvolvimento em equipe.

## 📌 Sobre o projeto

O EduLead centraliza o processo de relacionamento com potenciais alunos em uma única plataforma. A aplicação permite registrar interessados, acompanhar a evolução de cada oportunidade no funil de matrícula, registrar interações, organizar tarefas e visualizar indicadores por meio de um dashboard.

### Fluxo do funil

`Novo interessado` → `Primeiro contato` → `Aguardando retorno` → `Visita/aula experimental` → `Documentação` → `Matrícula realizada` / `Desistiu`

## ✨ Principais funcionalidades

- 🔐 **Autenticação:** login com geração e validação de token JWT.
- 👤 **Usuários e perfis:** controle de acesso por cargo/perfil.
- 👥 **Gestão de interessados:** cadastro, consulta, edição, exclusão e acompanhamento de potenciais alunos.
- 🔄 **Funil de matrícula:** alteração e acompanhamento da etapa de cada interessado.
- 📚 **Gestão de cursos:** cadastro e organização dos cursos.
- 📝 **Histórico de interações:** registro e consulta dos contatos realizados.
- ✅ **Tarefas:** criação, acompanhamento e controle de atividades relacionadas aos interessados.
- 📊 **Dashboard:** indicadores de interessados, matrículas, desistências, taxa de conversão, tarefas pendentes e distribuição por etapa, curso e origem.
- 🔎 **Pesquisa e filtros:** apoio à localização e organização dos registros.
- 🛡️ **Tratamento de erros:** respostas padronizadas para exceções da API.
- 🧪 **Testes automatizados:** testes unitários de regras importantes do fluxo de interessados.
- 📎 **Anexos privados:** estrutura preparada para arquivos de interessados no Cloudflare R2.
- 🤖 **Assistente interno:** suporte orientado ao uso do CRM, configurável por provedor de IA.
- 👋 **Apresentação e guia inicial:** página pública e onboarding para usuários autenticados.

## 🛠️ Tecnologias

### Front-end

- React
- JavaScript / JSX
- HTML5
- CSS3
- Vite
- Fetch API

### Back-end

- Java 21
- Spring Boot 3.4.2
- Spring Web
- Spring Data JPA
- Spring Validation
- Spring Security
- Flyway (preparado para adoção controlada)
- Maven
- JWT (JJWT)

### Banco de dados

- MySQL
- Hibernate / JPA

## 🏗️ Arquitetura

O back-end segue uma organização em camadas, separando responsabilidades:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
MySQL
```

Também existem componentes específicos para segurança e tratamento de exceções.

```text
backend/
└── src/
    ├── main/
    │   ├── java/com/edulead/
    │   │   ├── controller/   # Endpoints da API
    │   │   ├── service/      # Regras de negócio
    │   │   ├── repository/   # Acesso aos dados
    │   │   ├── model/        # Entidades e enums
    │   │   ├── security/     # JWT e controle de acesso
    │   │   └── exception/    # Tratamento de exceções
    │   └── resources/
    │       ├── application.properties
    │       ├── application-dev.properties
    │       └── application-prod.properties
    └── test/                 # Testes automatizados
```

## 🔐 Segurança

A autenticação da aplicação utiliza **JWT (JSON Web Token)**.

Após o login:

1. O usuário envia e-mail e senha para `POST /api/auth/login`.
2. O back-end valida as credenciais.
3. Um token JWT é gerado com o identificador e o perfil do usuário.
4. As requisições protegidas enviam o token no header:

```http
Authorization: Bearer <token>
```

5. O filtro JWT do Spring Security valida o token em todas as rotas protegidas.
6. As permissões são aplicadas nas rotas e nas regras de negócio: GESTOR administra
   todos os dados; ATENDENTE acessa somente seus interessados, tarefas e indicadores.

As senhas são armazenadas com BCrypt e nunca são retornadas pela API. Os cargos legados
`GESTORA` e `ADMIN` continuam compatíveis como `GESTOR`.

O backend limita tentativas inválidas de login e chamadas ao assistente de IA. Senhas
novas ou alteradas exigem pelo menos 8 caracteres e respeitam o limite seguro de 72 bytes
do BCrypt. Na publicação, o Nginx aplica CSP, HSTS e cabeçalhos contra clickjacking,
sniffing de MIME e vazamento indevido de referenciador.

> O token JWT ainda segue o contrato atual do frontend e fica no armazenamento local do
> navegador. A migração futura para cookie `HttpOnly` requer mudança coordenada no fluxo
> de autenticação e proteção CSRF.

> Em produção, `JWT_SECRET`, `DB_URL`, `DB_USER`, `DB_PASSWORD` e
> `CORS_ALLOWED_ORIGIN` são obrigatórios. Consulte
> [`docs/OPERACAO_BACKEND.md`](docs/OPERACAO_BACKEND.md) para a configuração completa.

## 🗄️ Banco de dados

O projeto utiliza **MySQL** com **Spring Data JPA/Hibernate**.

A conexão é configurada por variáveis de ambiente:

```text
DB_URL
DB_USER
DB_PASSWORD
SERVER_PORT
JWT_SECRET
CORS_ALLOWED_ORIGIN
```

Use `backend/.env.example` como referência para as variáveis locais. O perfil `dev`
usa Hibernate `update`; o perfil `prod` usa `validate` e não cria dados de demonstração.
O Flyway está incluído, porém permanece desativado até o baseline seguro de bancos já
existentes descrito na documentação operacional.

Cloudflare R2 e Gemini são opcionais e ficam desabilitados até suas variáveis de ambiente
serem configuradas. Veja `backend/.env.example` e
[`docs/OPERACAO_BACKEND.md`](docs/OPERACAO_BACKEND.md).

## 🚀 Como executar

### Pré-requisitos

- Java 21
- Maven
- Node.js e npm
- MySQL

### 1. Clonar o repositório

```bash
git clone https://github.com/KerollayneAkemy/CRM--EduLead.git
cd CRM--EduLead
```

### 2. Executar o back-end

```bash
cd backend
$env:DB_PASSWORD="sua-senha-local" # PowerShell
mvn spring-boot:run
```

A API será iniciada em:

```text
http://localhost:8080
```

### 3. Executar o front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O front-end será disponibilizado pelo Vite, normalmente em:

```text
http://localhost:5173
```

## 🔌 Principais endpoints

| Método | Endpoint | Finalidade |
|---|---|---|
| POST | `/api/auth/login` | Autenticação |
| GET | `/api/interessados` | Listar interessados |
| POST | `/api/interessados` | Cadastrar interessado |
| GET | `/api/interessados/{id}` | Consultar interessado |
| PUT | `/api/interessados/{id}` | Atualizar interessado |
| PATCH | `/api/interessados/{id}/etapa` | Alterar etapa do funil |
| GET | `/api/interessados/{id}/interacoes` | Consultar histórico |
| GET | `/api/interessados/{id}/tarefas` | Consultar tarefas |
| DELETE | `/api/interessados/{id}` | Excluir interessado |
| GET | `/api/cursos` | Consultar cursos |
| POST/PUT/DELETE | `/api/cursos/**` | Gerenciar cursos (GESTOR) |
| GET/POST/PUT/DELETE | `/api/usuarios/**` | Gerenciar usuários (GESTOR) |
| GET/POST/PUT/PATCH/DELETE | `/api/tarefas/**` | Gerenciar tarefas conforme perfil |
| POST | `/api/interacoes` | Registrar interação em interessado autorizado |
| GET/PATCH | `/api/perfil` | Consultar ou alterar o próprio perfil |
| GET | `/api/dashboard` | Consultar indicadores |

## 🧪 Testes

Os testes ficam em:

```text
backend/src/test/
```

Para executar:

```bash
cd backend
mvn test
```

Os testes cobrem JWT, login, perfis, rotas protegidas, isolamento entre atendentes,
CRUD de cursos, tarefas, interações, movimentação do funil, dashboard, validações e
respostas de erro. A documentação de operação informa a situação do schema MySQL e a
estratégia segura do Flyway.

## 📚 Documentação

A pasta `docs/` reúne os materiais acadêmicos e de projeto, incluindo:

- C4;
- diagrama de casos de uso;
- diagrama de atividades;
- diagrama de classes;
- diagrama de sequência;
- organograma;
- gerenciamento de custos;
- gerenciamento de recursos humanos;
- gerenciamento de qualidade;
- Business Model Canvas (BMC);
- proposta de valor.

## 👥 Equipe

| Integrante | Responsabilidade |
|---|---|
| Ana | Front-end e UX/UI |
| Kerollayne | Back-end e Banco de Dados |
| Emily | Arquitetura e Requisitos |

## 🎓 Contexto acadêmico

**Projeto Prático 2026.2**

Projeto desenvolvido na categoria **CRM (Customer Relationship Management)**, com foco na gestão e captação de alunos para instituições de ensino.

## 📈 Status

**🚀 Versão funcional — em evolução**

O sistema possui uma versão funcional com autenticação, gestão de interessados, cursos, funil, interações, tarefas e dashboard. O projeto continua em evolução com melhorias de documentação, testes, experiência do usuário e infraestrutura.

---

<p align="center">
  🎓 <strong>EduLead</strong><br>
  <em>Conectando instituições a novos alunos.</em>
</p>
