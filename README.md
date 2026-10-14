# 🌱 AiCansei

Plataforma de doação de itens usados. Doe o que não usa mais e encontre coisas incríveis!

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS v4
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** NextAuth v5 (Credentials + Google OAuth)
- **Storage:** Cloudinary (imagens)
- **Deploy:** Vercel (app) + Supabase (banco)

## Setup

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Gerar Prisma Client
npx prisma generate

# Criar tabelas no banco
npx prisma db push

# Popular com dados de teste
npx prisma db seed

# Iniciar desenvolvimento
npm run dev
```

## Usuários de teste

| Email | Senha | Papel |
|-------|-------|-------|
| admin@aicansai.com | 123456 | Admin |
| maria@email.com | 123456 | Doador |
| joao@email.com | 123456 | Doador |
| ana@email.com | 123456 | Receptor |
| pedro@email.com | 123456 | Receptor |

## Funcionalidades

- **CU-01:** Cadastro de usuários (credenciais + Google)
- **CU-02:** Criar e gerenciar anúncios de doação
- **CU-03:** Busca e filtros avançados
- **CU-04:** Manifestação de interesse
- **CU-05:** Avaliações (1-5 estrelas)
- **CU-06:** Painel admin (moderação + gestão)
- **CU-07:** Fluxo completo de doação

## Comandos

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar produção
npm test             # Rodar testes
npx prisma studio    # Abrir Prisma Studio
npx prisma db seed   # Popular banco
```

## Deploy

### Supabase (Banco de Dados)
1. Criar projeto no [Supabase](https://supabase.com)
2. Copiar connection string (Transaction mode)
3. Rodar `npx prisma db push` e `npx prisma db seed`

### Vercel (Aplicação)
1. Conectar repositório GitHub no [Vercel](https://vercel.com)
2. Configurar variáveis de ambiente
3. Deploy automático a cada push
