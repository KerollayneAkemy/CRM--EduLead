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
- Spring Security Crypto
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
    │       └── application.properties
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

5. O `AuthInterceptor` valida o token antes de permitir o acesso aos endpoints protegidos.
6. A anotação `@RequiresRole` permite restringir operações de acordo com o perfil.

As senhas são armazenadas utilizando `PasswordEncoder`.

> **Observação:** o segredo JWT presente como valor padrão no projeto é destinado ao ambiente local. Em produção, deve ser substituído por uma variável de ambiente segura.

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

Em ambiente local, a aplicação possui valores padrão para facilitar o desenvolvimento.

O Hibernate está configurado com:

```properties
spring.jpa.hibernate.ddl-auto=update
```

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

Entre as regras atualmente testadas estão:

- rejeição de interessado sem nome ou telefone;
- rejeição de alteração para uma etapa inexistente do funil.

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
