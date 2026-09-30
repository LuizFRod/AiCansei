# Etapa 3 — Construção (Iteração 1)

**Projeto:** AiCansei
**Fase do RUP:** Construção — Iteração 1
**Foco:** CU-01 Cadastro/Login + Design System base

## 1. Objetivo da Iteração

Entregar a fundação de acesso ao sistema: registro com e-mail/senha, login com sessão JWT, proteção de rotas e os componentes visuais reutilizáveis que sustentam as próximas iterações.

## 2. Escopo Entregue

### Autenticação (CU-01)

- 📝 Página de cadastro (`/cadastro`) com validação inline (nome ≥ 3 chars, e-mail válido, senha ≥ 6, confirmação)
- 🔑 Página de login (`/login`) via credenciais
- 🔒 API de registro (`POST /api/auth/register`) com hash **bcrypt**
- 🎫 NextAuth v5 configurado (`src/lib/auth.ts`):
  - Sessão **JWT** com `id` e `role` no token
  - Callbacks `jwt`, `session` e `authorized`
- 🛡️ Proteção de rotas: páginas públicas (`/`, `/sobre`, `/contato`, `/termos`, `/login`, `/cadastro`); todo o resto exige autenticação
- 👤 Papel padrão `RECEPTOR` no cadastro

### Design System

- Componentes UI: `Button`, `Input`, `Card`, `Badge`, `Toast`
- Layout: `Navbar` (navegação + sessão) e `Footer`
- Provider global: `SessionProvider` (contexto NextAuth)
- Estilos globais e tema (`globals.css`, Tailwind v4)
- Home pública (`/`) com apresentação do produto em 3 passos

## 3. Telas da Iteração

| Tela | Rota | Descrição |
|---|---|---|
| Login | `/login` | E-mail + senha; link para cadastro |
| Cadastro | `/cadastro` | Nome, e-mail, senha, confirmação |
| Home | `/` | Hero institucional + CTA "Comece agora" |

## 4. Critérios de Aceite

- ✅ Usuário consegue se cadastrar e logar
- ✅ Senha armazenada apenas como hash bcrypt
- ✅ Rotas privadas redirecionam não autenticados para `/login`
- ✅ Sessão carrega id/role do usuário em toda a aplicação
- ✅ Componentes base reutilizados nas iterações seguintes

## 5. Lições Aprendidas

- Centralizar validações Zod evitou duplicação client/server desde o início.
- Incluir `role` no JWT logo cedo simplificou o RBAC das telas de admin.

➡️ **Próxima etapa:** [Construção — Iteração 2](./etapa-4-construcao-iteracao-2.md)
