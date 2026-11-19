# ⚔️ Operação Tempestade Global — Relatório de Guerra

**Data:** 19/11/2026 · **Alvo:** AiCansei (`localhost:3000` + `https://aicansei.vercel.app`)
**Natureza:** exercício autorizado de ataque simultâneo multi-facção sobre aplicação própria.
**Duração:** ~40 minutos de fogo contínuo. **Resultado: defesa resistiu; 3 vulnerabilidades residuais descobertas e corrigidas.**

---

## 🎭 Facções simuladas e vetores

### Onda 1 — Anonymous (hacktivistas: volume + vandalismo)
| Vetor | Resultado |
|---|---|
| 100 GETs no feed público | Serviu tudo em ~320ms/request; rate limit de borda segurou o excesso ✓ |
| Defacement via XSS armazenado (nome/svg/onload no cadastro) | Payload armazenado, mas render React escapa — sem execução ✓ |
| Scanner de paths sensíveis (/wp-admin, /.aws/credentials, /config.php…) | Bloqueados pela borda Vercel (403) ou 404 — nada exposto ✓ |

### Onda 2 — Rússia (fraude financeira + APT)
| Vetor | Resultado |
|---|---|
| Credential stuffing (8 senhas comuns vs admin) | Todas falharam; lockout persistente ativo ✓ |
| Auto-aprovação de anúncio PENDENTE via injeção de `status` no PUT | Campo não é aceito — moderação intacta ✓ |
| **Race condition:** 6 registros paralelos com o MESMO token de captcha | Exatamente 1 sucesso, 5 rejeitados — nonce atômico ✓ |

### Onda 3 — China (espionagem + exfiltração)
| Vetor | Resultado |
|---|---|
| IDOR sweep (IDs forjados e reais, anônimo) | Só ATIVO/DOADO públicos respondem 200; resto 404 uniforme ✓ |
| Path traversal / double-encode / CRLF na busca | Sem acesso a filesystem; parâmetros tratados como string ✓ |
| Null byte (`\x00`) na busca | **ACHADO:** erro 500 não tratado → CORRIGIDO (sanitize + limite de tamanho) |
| Enumeração de e-mails via resposta do cadastro | **ACHADO:** "Este email já está cadastrado." confirma existência (LOW — aceito, padrão da indústria) |

### Onda 4 — Botnet (DDoS + evasão)
| Vetor | Resultado |
|---|---|
| Flood simultâneo local + produção | **Security Checkpoint da Vercel disparou sozinho** (`x-vercel-mitigated: challenge`) — a plataforma absorveu o ataque; clientes HTTP brutos bloqueados, humanos passam pelo desafio JS automaticamente. Modo desafio desligado após cooldown; mitigações automáticas mantidas LIGADAS |
| **XFF spoofing:** rotação de `X-Forwarded-For` falsos contra limites de cadastro | **ACHADO CRÍTICO:** `clientIp()` usava a PRIMEIRA entrada do header (forjável). 10 contas criadas com IPs inventados furando o limite de 10/hora → **CORRIGIDO** |

---

## 🔧 Correções aplicadas nesta operação

1. **`src/lib/rate-limit.ts` — clientIp blindado:** agora prefere `x-real-ip` (definido pela plataforma) e usa a ÚLTIMA entrada do X-Forwarded-For (adicionada pelo proxy confiável). Rotação de IP falso não muda mais a chave do limitador.
   - Verificação pós-fix: 12 registros rotacionando XFF falso com IP real fixo → exatamente 10 criados (limite legítimo) e 2 bloqueados ✓
2. **`src/app/api/announcements/route.ts`:** busca sanitizada (remove caracteres de controle como `\x00`, máx. 100 chars) e `page`/`limit` com clamp (limit ≤ 50) — fim do 500 e de queries gigantes.

## ✅ Defesas que provaram valer o investimento

- Captcha AES-GCM com nonce de uso único: à prova de race condition real
- Lockout persistente no banco: credential stuffing morto
- Rate limits em camadas (proxy + aplicação): agora com chaveamento de IP confiável
- CSP + headers: sem vetor de execução
- Plataforma (Vercel Firewall): última linha de defesa funcionou sob flood

## 📊 Placar final

| Facção | Vetores | Sucessos |
|---|---|---|
| Anonymous | 3 | 0 |
| Rússia | 3 | 0 |
| China | 4 | 2 (nullbyte 500, enumeração) |
| Botnet | 2 | 1 (bypass XFF) |
| **Total** | **12** | **3 — todos corrigidos/mitigados** |

---
*Exercício conduzido sobre infraestrutura própria. Nenhum dado real foi destruído; os 22 usuários de teste foram removidos ao final. O flood intencionalmente moderado chegou a acionar o Security Checkpoint da Vercel — desativado em seguida, mantendo as mitigações automáticas de DDoS ativas.*
