# Publicação do EduLead com Hostinger VPS + Coolify

Este roteiro publica o frontend e o backend no mesmo domínio, usando o proxy interno
do frontend para encaminhar `/api` ao Spring Boot. O navegador acessa somente
`https://edulead.duckdns.org`; a porta `8080` e o MySQL não ficam expostos na internet.

> Não copie senhas, chaves R2, chaves Gemini, token DuckDNS ou JWT para o Git, Dockerfile,
> compose ou chat. Cadastre-os somente em **Environment Variables** no Coolify.

## Pré-requisitos

1. Uma **VPS** da Hostinger com acesso administrativo/SSH. Hospedagem compartilhada não
   executa Coolify e containers Docker.
2. Coolify instalado e acessível na VPS.
3. Portas TCP `80` e `443` liberadas no firewall da VPS e no painel da Hostinger.
4. O DuckDNS `edulead.duckdns.org` apontando para o IP público da VPS.
5. Uma cópia de segurança recente do banco MySQL local antes de qualquer importação.

O token DuckDNS serve apenas para atualizar o DNS. Como a VPS normalmente tem IP público
fixo, ele não é necessário dentro dos containers do EduLead. Se um token foi compartilhado
em uma captura, revogue-o e gere outro antes de configurar atualizações automáticas.

## Arquitetura publicada

```text
Internet -> https://edulead.duckdns.org -> Coolify/HTTPS -> frontend (Nginx)
                                                          -> /api -> backend (Spring Boot)
                                                                    -> mysql (rede interna)
                                                                    -> Cloudflare R2 / Gemini
```

O arquivo `docker-compose.coolify.yml` cria três containers e um volume persistente:

- `frontend`: React/Vite compilado e servido por Nginx na porta interna `80`.
- `backend`: Spring Boot na porta interna `8080`, somente disponível ao Nginx.
- `mysql`: MySQL 8.0 com volume `edulead_mysql_data`.

O Coolify deve expor **somente o serviço `frontend`, porta interna `80`**.

## 1. Preparar o banco sem perder dados

O perfil `prod` usa `ddl-auto=validate`. Portanto, ele não cria tabelas e não deve ser
iniciado com MySQL vazio. Antes do primeiro deploy:

1. Faça backup do banco local em arquivo SQL.
2. Guarde esse backup fora do repositório.
3. Crie o recurso Compose no Coolify, mas não considere o backend aprovado até restaurar
   o dump dentro do container MySQL.
4. No terminal do serviço `mysql` no Coolify, importe o dump. Exemplo conceitual, após
   enviar o arquivo para a VPS/terminal seguro:

   ```bash
   mysql -u root -p edulead < /caminho-seguro/edulead-backup.sql
   ```

5. Verifique as tabelas e os dados importados antes de abrir o domínio ao público.

Não ative `FLYWAY_ENABLED` neste primeiro deploy. A base restaurada já deve ser a cópia
validada do ambiente atual. O baseline/migrations só devem ser feitos posteriormente,
em uma cópia de teste, seguindo `docs/OPERACAO_BACKEND.md`.

## 2. Criar o recurso no Coolify

1. Faça push destes arquivos ao GitHub, sem arquivos `.env` ou dumps SQL.
2. No Coolify, crie um **Application** a partir do repositório GitHub.
3. Em *Build strategy*, escolha **Docker Compose**.
4. Configure:
   - Base directory: `/`
   - Docker Compose Location: `/docker-compose.coolify.yml`
   - Branch: `main` (ou a branch que será publicada)
5. Em **Domains**, adicione:
   - serviço: `frontend`
   - protocolo: `https`
   - domínio: `edulead.duckdns.org`
   - porta interna: `80`
6. Ative o redirecionamento HTTP para HTTPS após o certificado ser emitido.

Não publique portas de host para `mysql` ou `backend`: o proxy do Coolify já encaminha o
tráfego HTTPS ao frontend.

## 3. Variáveis de ambiente

Em **Environment Variables** do recurso no Coolify, cadastre todos os valores de
`deploy/production.env.example`. Use geradores de senha para `MYSQL_PASSWORD`,
`MYSQL_ROOT_PASSWORD` e `JWT_SECRET`. Os nomes devem ser idênticos aos do arquivo.

Valores obrigatórios:

```text
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
MYSQL_ROOT_PASSWORD
JWT_SECRET
CORS_ALLOWED_ORIGIN=https://edulead.duckdns.org
```

Para habilitar anexos e assistente, inclua também as variáveis R2 e Gemini. Mantenha
as chaves exclusivamente no Coolify. O frontend não recebe nenhuma dessas chaves.

## Segurança operacional

O `frontend/nginx.conf` aplica automaticamente CSP, HSTS, `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy` e `Permissions-Policy`. Depois de
um deploy, valide os cabeçalhos sem enviar credenciais:

```bash
curl -I https://edulead.duckdns.org
```

`CORS_ALLOWED_ORIGIN` deve conter somente origens completas e explícitas, por exemplo
`https://edulead.duckdns.org`. Não use `*` nem inclua caminhos como `/api`.

- Após cinco falhas de login para a mesma combinação de origem e e-mail, o backend
  bloqueia novas tentativas por 15 minutos.
- O assistente de IA aceita até 20 perguntas por usuário a cada cinco minutos, evitando
  uso acidental ou abusivo da chave do provedor.
- Senhas criadas ou trocadas devem ter no mínimo 8 caracteres e no máximo 72 bytes
  em UTF-8, limite seguro do BCrypt. Senhas existentes não são alteradas automaticamente.
- Os limites são locais ao container e reiniciam quando ele é recriado. Se o sistema
  crescer para múltiplas réplicas, configure também rate limiting no proxy/gateway.

Como credenciais foram exibidas durante a configuração em telas e conversas, revogue e
gere novas chaves R2, token DuckDNS e chave Gemini caso tenham sido compartilhados. Em
seguida, atualize apenas as variáveis do Coolify e faça um redeploy. Nunca coloque esses
valores em commits, arquivos `.env` versionados ou no frontend.

## 4. Primeiro deploy e validação

1. Faça o primeiro deploy e acompanhe os logs.
2. O MySQL iniciará com o volume persistente. Restaure o backup conforme a seção 1.
3. Reinicie/redeploy o recurso após a restauração do banco.
4. Confirme nos logs do backend que o perfil é `prod`, que o SeedData está desabilitado
   e que o Hibernate validou o schema.
5. Abra `https://edulead.duckdns.org` e teste:
   - apresentação e login;
   - gestão e acesso de atendente;
   - criação/edição de interessado e tarefa;
   - anexo R2 e link temporário de download;
   - assistente Gemini.
6. Verifique o cadeado HTTPS, o redirecionamento de HTTP e que `/api` funciona pelo
   mesmo domínio.

Se o backend não iniciar, não altere `ddl-auto` para `update` ou `create` em produção.
Leia o log, confirme se o dump foi restaurado por completo e corrija a variável ausente.
Em caso de falha no banco, restaure o backup em vez de recriar tabelas manualmente.

## Rotina após a publicação

- Habilite backups do volume MySQL no Coolify/Hostinger e mantenha uma cópia externa.
- Use o GitHub como fonte do deploy; cada atualização deve passar por testes antes de
  um novo deploy.
- Atualize o domínio DuckDNS somente se o IP da VPS mudar.
- Revogue imediatamente qualquer credencial exposta em print, commit, log ou conversa.
