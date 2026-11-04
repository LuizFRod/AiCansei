# 🔒 Auditoria de Segurança — AiCansei v1.0

**Data:** 21/08/2026 · **Escopo:** código-fonte completo (`src/`, `prisma/`, configs, dependências)
**Metodologia:** revisão manual de autenticação, autorização (RBAC/IDOR), validação de entrada, manipulação de arquivos, exposição de dados e dependências + `npm audit`.

---

## Resumo Executivo

| Severidade | Qtd | Status |
|---|---|---|
| 🔴 Crítico | 0 | — |
| 🟠 Alto | 2 | Recomendado corrigir antes da entrega |
| 🟡 Médio | 4 | Corrigir em curto prazo |
| 🔵 Baixo/Info | 5 | Backlog / observações |

**Veredito geral:** fundação sólida — bcrypt, Zod em todas as entradas críticas, Prisma parametrizado (sem SQL injection), React sem `dangerouslySetInnerHTML` (sem XSS), checagens de posse (`IDOR`) presentes na maioria das rotas, RBAC consistente. Os pontos fracos concentram-se em **integridade da reputação**, **ausência de rate limiting** e **validações de estado ausentes**.

---

## 🟠 Achados Altos

### A-1 · Reputação manipulável — avaliações sem vínculo com doação real
**Arquivo:** `src/app/api/reviews/route.ts:64-77`

`POST /api/reviews` aceita `reviewedId` de **qualquer usuário** — basta estar logado. Não existe verificação de que houve manifestação/doação concluída entre `reviewer` e `reviewed`. Um atacante autenticado pode:
- inflar a reputação de cúmplices com notas 5★ infinitas (o dedup por `reviewerId+reviewedId+donationId` só impede repetição da mesma dupla);
- derrubar a reputação de qualquer usuário com avaliações 1★ em massa.

**Recomendação:** exigir vínculo real — validar existência de `Manifestation CONCLUIDA` ou `Announcement recipientId` ligando os dois usuários antes de aceitar a review.

### A-2 · Ausência total de rate limiting
**Arquivos:** todas as rotas `/api/**`, especialmente `auth/callback/credentials` e `api/auth/register`

Nenhum throttle por IP/usuário. Vetores: força-bruta de senha no login, criação massiva de contas, spam de manifestações/notificações e scraping do feed público.

**Recomendação:** middleware de rate limit (ex.: `@upstash/ratelimit` ou limite simples em memória/Redis) — mínimo viável: login (5/min/IP), registro (3/hora/IP), escritas gerais (30/min/usuário).

---

## 🟡 Achados Médios

### M-1 · Conclusão de doação sem validar estado atual
**Arquivo:** `src/app/api/announcements/[id]/donate/route.ts:20-33`

Valida posse e existência da manifestação, mas **não exige `status === "ATIVO"`**. Um dono pode "doar" anúncio `PENDENTE`, `REJEITADO` ou já `DOADO` para outro interessado, quebrando a invariantes do ciclo de vida.

**Recomendação:** `if (existing.status !== "ATIVO") return 409`.

### M-2 · Moderação pode reabrir anúncio já doado
**Arquivo:** `src/app/api/announcements/[id]/moderate/route.ts:53-55`

`moderationSchema` aceita `ATIVO|REJEITADO` para qualquer anúncio, inclusive `DOADO` → admin pode ressuscitar um item já entregue.

**Recomendação:** permitir moderação apenas a partir de `PENDENTE`.

### M-3 · Rota de contato: entrada livre sem validação + log injection
**Arquivo:** `src/app/api/contact/route.ts:6-27`

Sem autenticação, sem Zod, sem limites de tamanho; `nome/mensagem` entram crus em `console.log` — quebras de linha forjadas podem mascarar entradas de log (log forging). Hoje só loga, mas é vetor pronto quando virar e-mail real (header injection).

**Recomendação:** schema Zod (tamanhos máximos, e-mail válido), sanitizar CRLF antes de logar.

### M-4 · Segredo de produção fraco no ambiente local
**Arquivo:** `.env` (`NEXTAUTH_SECRET="[SEGREDO-REMOVIDO]"`)

A Vercel está com segredo forte gerado ✓, mas o `.env` local usa string previsível. Se alguém assinar tokens localmente com esse segredo… risco baixo (dev), porém hábito ruim.

**Recomendação:** gerar segredo forte também local (`openssl rand -base64 32`) e nunca reaproveitar entre ambientes.

---

## 🔵 Baixos / Observações

| ID | Achado | Referência | Nota |
|---|---|---|---|
| B-1 | Papel `ADMIN` vive no JWT até expirar — rebaixamento não é imediato | `src/lib/auth.ts:50-63` | Aceitável com sessões curtas; considerar consulta ao banco em rotas sensíveis |
| B-2 | Upload confia no `Content-Type` enviado pelo cliente | `src/app/api/upload/route.ts:24` | Mitigado: Cloudinary reprocessa e falha se não for imagem; validar magic bytes se migrar de provedor |
| B-3 | Credenciais de demonstração públicas (`123456`) no README/seed | `README.md`, `prisma/seed.ts` | Ok para contexto acadêmico; remover em produção real |
| B-4 | 3 vulnerabilidades *high* em `deepmerge-ts` via CLI do Prisma (dev-only) | `npm audit` | Sem impacto em runtime; acompanhar patch do Prisma |
| B-5 | `bcrypt` cost 10 | `register/route.ts:38` | Dentro do mínimo OWASP; 12 é recomendado quando o hardware permitir |

---

## ✅ Controles Verificados e Aprovados

- **Senhas:** hash bcrypt, nunca retornadas em selects (`users/route.ts`, `users/admin/route.ts`)
- **SQL Injection:** 100% Prisma parametrizado; zero `$queryRaw` no projeto
- **XSS:** nenhuma instância de `dangerouslySetInnerHTML`; escaping padrão do React
- **IDOR:** checagens de posse corretas em `announcements/[id]` (PATCH/DELETE), `photos` (POST/DELETE), `notifications/[id]`, `manifestations` (GET por anúncio só p/ dono)
- **RBAC:** rotas admin (`stats`, `users/admin`, `moderate`) validam `role === "ADMIN"` no servidor, além do proxy
- **Perfil público:** `users/[id]` usa `select` restrito — sem e-mail, telefone ou endereço
- **Auto-interesse bloqueado:** doador não manifesta interesse no próprio anúncio; usuário não se auto-avalia
- **Upload:** limite de 5MB + tipo de imagem, armazenamento em CDN externa
- **Segredos:** `.env*` gitignored; histórico limpo; `.env.example` sem valores reais
- **Cookies de sessão:** NextAuth v5 com `Secure`/`HttpOnly` automáticos em HTTPS e `SameSite=Lax` (mitiga CSRF em POST)

---

## Plano de Remediação Sugerido (ordem)

1. A-1 — travar avaliações em doações reais *(integridade do principal recurso de confiança)*
2. M-1 — guard de status no donate *(1 linha)*
3. A-2 — rate limit básico em login/registro
4. M-3 — Zod + sanitização no contato
5. M-2, M-4, B-* — ajustes rápidos

---
*Auditoria realizada por revisão manual assistida. Revisões automatizadas por PR podem ser adicionadas via `.github/workflows/security.yml`.*
