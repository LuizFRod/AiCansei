# AiCansei

Plataforma web que conecta pessoas que querem doar itens em bom estado a quem gostaria de recebê-los. O projeto prioriza reutilização, solidariedade e redução de desperdício.

## Tecnologias

- **Frontend e API:** Next.js 16 (App Router), React 19 e TypeScript
- **Estilos:** Tailwind CSS 4
- **Autenticação:** NextAuth v5 com login por e-mail e senha
- **Banco de dados:** PostgreSQL com Prisma ORM
- **Fotos dos anúncios:** Cloudinary
- **Hospedagem prevista:** Vercel (aplicação) e Supabase (PostgreSQL)

## Requisitos

- Git
- Node.js 20.9 ou superior e npm
- Um banco PostgreSQL acessível pela máquina. Para o roteiro abaixo, use um projeto no Supabase.

## Executar localmente

### 1. Baixar o código

```bash
git clone https://github.com/LuizFRod/AiCansei.git
cd AiCansei
```

### 2. Preparar o banco

Crie um projeto PostgreSQL no Supabase. No painel do projeto, obtenha as URLs de conexão pooled e direta. Elas devem apontar para o mesmo banco.

### 3. Configurar as variáveis

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Abra `.env.local` e configure:

| Variável | Necessária | Uso |
|---|---|---|
| `DATABASE_URL` | Sim | URL de conexão pooled do PostgreSQL para a aplicação |
| `DIRECT_URL` | Sim | URL direta do mesmo banco, usada pelo Prisma |
| `NEXTAUTH_URL` | Sim para execução local | Mantenha `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Sim | Segredo usado para proteger as sessões |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Para upload de fotos | Credenciais do Cloudinary |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Não | Cloudflare Turnstile; sem elas, a aplicação usa o captcha matemático próprio |

Gere um segredo para `NEXTAUTH_SECRET` com `openssl rand -base64 32` e cole o resultado no arquivo. Não compartilhe nem publique o conteúdo de `.env.local`. As variáveis de OAuth Google presentes no exemplo estão reservadas para uma integração futura; o login disponível atualmente é por e-mail e senha.

### 4. Instalar dependências e preparar o banco

```bash
npm ci
npx prisma generate
npm run db:push
npm run db:seed
```

O comando de seed apaga os registros existentes nas tabelas do aplicativo e cria dados demonstrativos. Use-o somente em um banco local/de teste vazio ou descartável.

### 5. Iniciar a aplicação

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

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

- Cadastro e autenticação de usuários com perfis de doador, receptor e administrador
- Publicação, edição e remoção de anúncios de doação com fotos
- Feed público, busca textual e filtros por categoria, condição e cidade
- Manifestação de interesse e acompanhamento das doações
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

## Documentação do projeto

- [Especificação e documentação geral](docs/documentacao.md)
- [Construção — Iteração 2: anúncios e busca](docs/etapa-4-construcao-iteracao-2.md)
- [Continuação da Iteração 2: doações, interações e administração](docs/etapa-5-construcao-continuacao-iteracao-2.md)
- [Demais etapas do projeto](docs/)
