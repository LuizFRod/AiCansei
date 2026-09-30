# Etapa 4 — Construção (Iteração 2)

**Projeto:** AiCansei
**Fase do RUP:** Construção — Iteração 2
**Foco:** CU-02 Anúncios + CU-03 Busca e Filtros

## 1. Objetivo da Iteração

Entregar o núcleo do produto: criação e gestão de anúncios com fotos, feed público com busca/filtros e detalhe do anúncio.

## 2. Escopo Entregue

### Anúncios (CU-02)

- 📄 Criar anúncio (`/anuncio/novo`): título, descrição, categoria (8 opções), condição (NOVO/ÓTIMO/BOM/REGULAR), disponibilidade (RETIRADA/ENTREGA/AMBAS), cidade/estado/endereço
- ✏️ Editar anúncio próprio (`/anuncio/[id]/editar`)
- 🗑️ Excluir anúncio (`/meus-anuncios`)
- 🚫 Todo anúncio nasce **PENDENTE** de moderação

### Upload de Imagens

- 🖼️ Componente `ImageUpload` com preview e ordenação (`sortOrder`)
- ☁️ API `POST /api/upload` → armazenamento no **Cloudinary**
- 📎 Fotos vinculadas ao anúncio via modelo `Photo`

### Feed e Busca (CU-03)

- 🔍 Feed (`/feed`) com paginação de anúncios **ATIVOS**
- 🔎 `SearchBar`: busca textual + filtros por categoria, condição e cidade
- 🏷️ Badges de categoria/condição nos cards do feed

### APIs

| Rota | Método | Função |
|---|---|---|
| `/api/announcements` | GET / POST | Listar (filtros/paginação) e criar |
| `/api/announcements/[id]` | GET / PATCH / DELETE | Detalhe, editar, excluir |
| `/api/announcements/[id]/photos` | POST / DELETE | Gerenciar fotos |
| `/api/upload` | POST | Upload para Cloudinary |

## 3. Telas da Iteração

| Tela | Rota |
|---|---|
| Feed com busca | `/feed` |
| Novo anúncio | `/anuncio/novo` |
| Detalhe do anúncio | `/anuncio/[id]` |
| Editar anúncio | `/anuncio/[id]/editar` |
| Meus anúncios | `/meus-anuncios` |

## 4. Critérios de Aceite

- ✅ Doador publica anúncio completo em menos de 2 minutos
- ✅ Anúncio PENDENTE não aparece no feed público
- ✅ Busca retorna resultados combinando texto + filtros
- ✅ Dono consegue editar/excluir apenas os próprios anúncios (403 caso contrário)
- ✅ Validação Zod rejeita payloads inválidos com mensagens em português

➡️ **Próxima etapa:** [Construção — Continuação da Iteração 2](./etapa-5-construcao-continuacao-iteracao-2.md)
