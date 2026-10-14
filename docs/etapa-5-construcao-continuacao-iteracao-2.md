# Etapa 5 — Construção (Continuação da Iteração 2)

**Projeto:** AiCansei
**Fase do RUP:** Construção — Continuação da Iteração 2
**Foco:** CU-04/05/06/07 — Interações sociais, administração e testes

## 1. Objetivo da Iteração

Completar o ciclo de valor do produto: manifestação de interesse, conclusão da doação, avaliações, favoritos, notificações, painel administrativo e a suíte automatizada de testes.

## 2. Escopo Entregue

### Interação e Doação (CU-04 / CU-07)

- 🙋 Manifestar interesse no anúncio com mensagem (1 por usuário/anúncio)
- ✅ Doador **aceita/recusa** interessados
- 🤝 Concluir doação: doador escolhe receptor → anúncio vira **DOADO**, manifestação **CONCLUIDA**
- ⭐ Avaliações recíprocas 1–5 estrelas com comentário (CU-05); reputação recalculada

### Engajamento

- ❤️ Favoritos (`FavoriteButton` + página `/favoritos`)
- 🔔 Notificações por evento (interesse, avaliação, moderação) com `NotificationBell` e página dedicada (`/notificacoes`)
- 👥 Perfil público (`/usuario/[id]`) com reputação, anúncios e avaliações; edição em `/perfil`

### Administração (CU-06)

- 📊 Dashboard com estatísticas gerais (`/api/stats`)
- 🕵️ Fila de moderação: aprovar → ATIVO / rejeitar com motivo → REJEITADO
- 👮 Gestão de usuários: listar, alterar papel, desativar
- Acesso restrito a `role=ADMIN`

### Institucionais

- Páginas `/sobre`, `/contato` (com API de contato), `/termos`
- Seed de dados de teste (`prisma/seed.ts`) — 5 usuários de demonstração

### Qualidade — Suíte de Testes

- 🧪 **290 testes unitários e de integração** (Jest):
  - `__tests__/api/*` — rotas de announcements, favorites, manifestations, etc.
  - `__tests__/components/ui/*` — componentes visuais
  - `__tests__/lib/*` — utils, constants e validações
- Configurações: `jest.config.js`, `jest.setup.js`, `jest.node-setup.js`, `vitest.config.mts`

## 3. Fluxo Completo de Doação (ponta a ponta)

```
Doador publica (PENDENTE) ──► Admin aprova (ATIVO)
                                     │
Receptor manifesta interesse ────────┘
                                     │
                    Doador aceita interesse
                                     │
                    Doador conclui doação ──► status DOADO
                                     │
              Ambos se avaliam ──► reputação atualizada
```

## 4. Critérios de Aceite

- ✅ Ciclo completo publicar → doar → avaliar funciona ponta a ponta
- ✅ Apenas o dono conclui a doação; apenas ADMIN modera
- ✅ Notificações geradas para todos os eventos-chave
- ✅ Reputação reflete média das avaliações recebidas
- ✅ Suíte de testes cobre APIs, componentes e libs

➡️ **Próxima etapa:** [Transição](./etapa-6-transicao.md)
