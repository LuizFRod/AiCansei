# 🌱 AiCansei

Plataforma web que conecta pessoas que querem doar itens em bom estado a quem gostaria de recebê-los. O projeto prioriza reutilização, solidariedade e redução de desperdício.

## Tecnologias

- **Frontend e API:** Next.js 16 (App Router), React 19 e TypeScript
- **Estilos:** Tailwind CSS 4
- **Autenticação:** NextAuth v5 com login por e-mail e senha
- **Banco de dados:** PostgreSQL com Prisma ORM
- **Fotos dos anúncios:** Cloudinary
- **E-mails:** Resend (opcional)
- **Hospedagem:** Vercel (aplicação) e Supabase (PostgreSQL)

## Requisitos

- Git
- Node.js 20.9 ou superior e npm
- Um banco PostgreSQL acessível pela máquina (um projeto no Supabase ou um PostgreSQL instalado localmente)
- Uma conta no Cloudinary, somente se quiser testar o envio de fotos dos anúncios

## Executar localmente

### 1. Baixar o código

```bash
git clone https://github.com/LuizFRod/AiCansei.git
cd AiCansei
```

### 2. Preparar o banco

**Opção A: Supabase.** Crie um projeto no [Supabase](https://supabase.com) e abra a opção **Connect** no painel. Copie as duas URLs de conexão:

- `DATABASE_URL`: URL do **Transaction pooler** (porta 6543), com `?pgbouncer=true` no final.
- `DIRECT_URL`: URL da **Direct connection** (porta 5432). Se a sua rede não tiver IPv6, use a URL do **Session pooler**.

**Opção B: PostgreSQL local.** Crie um banco vazio chamado `aicansei` e use a mesma URL nas duas variáveis:

```text
postgresql://postgres:SUA_SENHA@localhost:5432/aicansei
```

### 3. Configurar as variáveis

Copie o arquivo de exemplo para `.env`. O nome precisa ser exatamente esse, porque o Prisma lê o arquivo `.env`.

```bash
cp .env.example .env
```

No Prompt de Comando do Windows, use `copy .env.example .env`.

Abra o arquivo `.env` e configure:

| Variável | Necessária | Uso |
|---|---|---|
| `DATABASE_URL` | Sim | URL de conexão usada pela aplicação |
| `DIRECT_URL` | Sim | URL direta do mesmo banco, usada pelo Prisma |
| `NEXTAUTH_URL` | Sim | Mantenha `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Sim | Segredo das sessões, com pelo menos 16 caracteres |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Para envio de fotos | Credenciais do Cloudinary |
| `RESEND_API_KEY`, `EMAIL_FROM` | Não | Envio de e-mails; sem a chave, o conteúdo do e-mail aparece no terminal |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Não | Cloudflare Turnstile; sem as chaves, a aplicação usa um captcha matemático próprio |

Para gerar o `NEXTAUTH_SECRET`, rode o comando abaixo e cole o resultado no arquivo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Não compartilhe nem publique o conteúdo do `.env`.

### 4. Instalar as dependências e preparar o banco

```bash
npm ci
npx prisma generate
npm run db:push
npm run db:seed
```

**Atenção:** o comando `npm run db:seed` apaga os registros existentes nas tabelas do aplicativo e cria dados demonstrativos. Use-o somente em um banco de teste.

### 5. Iniciar a aplicação

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e entre com uma das contas demonstrativas abaixo.

## Contas demonstrativas

Depois de executar o seed, as contas abaixo usam a senha `123456`. Elas são apenas para desenvolvimento local e não devem ser usadas em produção.

| E-mail | Perfil |
|---|---|
| `admin@aicansai.com` | Administrador |
| `maria@email.com` | Doadora |
| `joao@email.com` | Doador |
| `ana@email.com` | Receptora |
| `carlos@email.com` | Receptor |

## Funcionalidades

- Cadastro, login e recuperação de senha, com perfis de doador, receptor e administrador
- Publicação, edição e remoção de anúncios de doação com fotos
- Feed público, busca textual e filtros por categoria, condição e cidade
- Manifestação de interesse e conclusão de doações
- Favoritos, notificações, avaliações e reputação
- Moderação de anúncios e gestão de usuários no painel administrativo
- Conversas entre doador e interessado

## Comandos disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o build de produção |
| `npm run lint` | Executa o ESLint |
| `npm run db:push` | Sincroniza o schema Prisma com o banco configurado |
| `npm run db:seed` | Apaga os dados existentes e popula o banco com dados demonstrativos |
| `npx prisma studio` | Abre uma interface para consultar o banco |

## Problemas comuns

- **`Environment variable not found: DIRECT_URL`:** confira se o arquivo se chama `.env`, se está na raiz do projeto e se a variável foi preenchida.
- **`NEXTAUTH_SECRET é obrigatório`:** preencha a variável com pelo menos 16 caracteres.
- **Erro ao enviar fotos:** confira as três variáveis do Cloudinary.

## Documentação do projeto

- [Especificação e documentação geral](docs/documentacao.md)
- [Construção — Iteração 2: anúncios e busca](docs/etapa-4-construcao-iteracao-2.md)
- [Continuação da Iteração 2: doações, interações e administração](docs/etapa-5-construcao-continuacao-iteracao-2.md)
- [Demais etapas do projeto](docs/)

## Exercício de controle de versão

Branch iteracao2: modificações realizadas para
demonstrar o processo de merge com a branch main.
