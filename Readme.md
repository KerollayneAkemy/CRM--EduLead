EduLead — CRM para Captação de Alunos

O EduLead é um sistema de gerenciamento de relacionamento com clientes (CRM) desenvolvido para auxiliar instituições de ensino no processo de captação e acompanhamento de alunos interessados. A plataforma centraliza informações, organiza oportunidades e facilita o acompanhamento de cada etapa até a matrícula.

O projeto está sendo desenvolvido como parte do Projeto Prático 2026.2, com foco na aplicação de conhecimentos de desenvolvimento de software, organização de dados e trabalho colaborativo.


"Dashboard do EduLead" (docs/images/dashboard.png)

Dashboard principal do EduLead, com indicadores de captação, interessados por etapa, origem dos contatos, cursos mais procurados e contatos recentes.

✨ Funcionalidades

- Dashboard: visão geral dos indicadores e das atividades de captação.
- Gestão de interessados: cadastro e acompanhamento de potenciais alunos.
- Funil de captação: organização dos interessados conforme a etapa do processo.
- Gerenciamento de tarefas: acompanhamento de atividades e pendências.
- Gestão de cursos: organização e consulta dos cursos oferecidos.
- Usuários: gerenciamento de acesso à plataforma.
- Acompanhamento de contatos: consulta das informações e do andamento dos interessados.

Etapas do funil

1. Novo interessado
2. Primeiro contato
3. Aguardando retorno
4. Visita/aula experimental
5. Documentação
6. Matrícula realizada
7. Desistiu

🛠️ Tecnologias

Front-end

- React
- JavaScript (JSX)
- HTML5
- CSS3
- Vite

Back-end

- Java
- Spring Boot
- Spring Data JPA
- Maven

Banco de dados

- MySQL

🏗️ Arquitetura

O EduLead utiliza uma estrutura separada entre front-end e back-end, permitindo organizar a interface, as regras de negócio e a persistência dos dados em responsabilidades distintas.

- Front-end: responsável pela interface e pela interação com o usuário, desenvolvido em React.
- Back-end: responsável pelo processamento das requisições e pelas regras de negócio, utilizando Java e Spring Boot.
- Banco de dados: responsável pelo armazenamento e gerenciamento das informações, utilizando MySQL.

🚀 Como executar

As instruções de instalação e execução devem corresponder à configuração atual do projeto.

Pré-requisitos

- Node.js e npm
- Java JDK
- Maven
- MySQL

Front-end

cd frontend
npm install
npm run dev

Back-end

Entre na pasta do back-end e execute:

mvn spring-boot:run

Configure as variáveis de conexão com o MySQL conforme o arquivo de configuração do projeto antes de iniciar a aplicação.

👥 Equipe

Integrante| Responsabilidade
Ana| Front-end / UX / UI
Kerollayne| Back-end / Banco de Dados
Emily| Arquitetura / Análise

🎓 Contexto acadêmico

Projeto desenvolvido em grupo no Projeto Prático 2026.2, com o objetivo de aplicar conceitos de engenharia de software, desenvolvimento web, modelagem de dados e colaboração em equipe.

🔗 Links

- Repositório: "GitHub — EduLead" (https://github.com/KerollayneAkemy/CRM--EduLead)
- LinkedIn: "EduLead" (https://www.linkedin.com/company/edulead-524a36430/)

---

EduLead — Organizando oportunidades, aproximando alunos e instituições.
