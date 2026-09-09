# Etapa 1 — Concepção

**Projeto:** AiCansei — Plataforma de doação de itens usados
**Fase do RUP:** Concepção
**Período:** Agosto/2026

## 1. Visão do Produto

O AiCansei (*"Ai, cansei desse item"*) é uma plataforma web que conecta pessoas que possuem itens em bom estado, mas sem uso, a pessoas interessadas em recebê-los por doação. Em vez de descartar, o usuário doa; em vez de comprar, o usuário encontra.

> Doe o que não usa mais. Encontre coisas incríveis. Conecte pessoas.

## 2. Problema

- Milhares de itens úteis são descartados diariamente por falta de canal simples de doação.
- Doações informais (grupos de vizinhança) não oferecem segurança, histórico nem moderação.
- Não há reputação das partes envolvidas em doações informais.

## 3. Solução Proposta

Plataforma onde o **doador** publica anúncios com fotos e detalhes, o **receptor** manifesta interesse, o doador escolhe para quem doar e ambos se **avaliam**, criando confiança e histórico. Um **administrador** modera os anúncios antes da publicação.

## 4. Interessados (Stakeholders)

| Stakeholder | Interesse |
|---|---|
| Doador | Descartar itens com responsabilidade e ganhar reputação |
| Receptor | Conseguir itens gratuitamente de forma confiável |
| Administrador | Moderar conteúdo e gerenciar usuários |
| Equipe de desenvolvimento | Manutenibilidade, testabilidade |
| Comunidade / Meio ambiente | Menos desperdício, mais solidariedade |

## 5. Objetivos Funcionais (alto nível)

1. Cadastro e autenticação segura de usuários (e-mail/senha + Google)
2. Criação e gestão de anúncios com fotos
3. Busca e filtros avançados
4. Manifestação de interesse
5. Fluxo completo de doação (escolha do receptor → conclusão)
6. Avaliações recíprocas (1–5 estrelas)
7. Moderação de anúncios e gestão administrativa

## 6. Objetivos Não-Funcionais (alto nível)

- Segurança: bcrypt, JWT, RBAC, validação de entrada
- Usabilidade: interface responsiva, fluxo em 3 passos (Anuncie → Conecte-se → Doe)
- Performance e escalabilidade: serverless (Vercel), CDN para imagens
- Confiabilidade: suíte automatizada de testes

## 7. Casos de Uso Identificados (CU-01 a CU-07)

| CU | Nome | Ator principal |
|---|---|---|
| CU-01 | Cadastro/Login | Visitante |
| CU-02 | Gerenciar anúncios | Doador |
| CU-03 | Buscar anúncios | Público |
| CU-04 | Manifestar interesse | Receptor |
| CU-05 | Avaliar usuário | Doador/Receptor |
| CU-06 | Moderar/Administrar | Admin |
| CU-07 | Concluir doação | Doador |

*Detalhamento completo na documentação consolidada (`docs/documentacao.md`).*

## 8. Escopo Preliminar e Restrições

- **Incluído:** plataforma web responsiva, 3 perfis de usuário, moderação manual.
- **Não incluído (nesta versão):** app mobile nativo, chat em tempo real, logística de entrega integrada.
- **Restrições:** prazo acadêmico, orçamento zero (uso de serviços free tier: Supabase, Cloudinary, Vercel).

## 9. Riscos Principais Identificados

| Risco | Impacto | Mitigação |
|---|---|---|
| Conteúdo inadequado nos anúncios | Alto | Moderação prévia obrigatória (status PENDENTE) |
| Fraude/mau comportamento | Alto | Sistema de reputação e avaliações |
| Baixo engajamento | Médio | UX simples, feed público sem login |

## 10. Critérios de Sucesso

- Usuário consegue publicar um anúncio em menos de 2 minutos
- Ciclo completo doação (publicar → interesse → aceitar → concluir → avaliar) funcional ponta a ponta
- Anúncio só fica público após aprovação de moderador

## Artefatos Produzidos Nesta Etapa

- ✅ Documento de visão (este documento)
- ✅ Lista de stakeholders e casos de uso preliminares
- ✅ Objetivos funcionais e não funcionais
- ✅ Identificação de riscos

➡️ **Próxima etapa:** [Elaboração](./etapa-2-elaboracao.md)
