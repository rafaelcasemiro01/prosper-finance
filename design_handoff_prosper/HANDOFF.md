# Prosper Finance — Pacote de Handoff para Desenvolvimento

> Documento de transição do protótipo funcional (HTML/React) para o produto real.
> Versão: protótipo v1 · Data: 2026-06

---

## 1. O que já existe (protótipo funcional)

Um app de finanças pessoais **mobile + web**, totalmente navegável e com dados reais
(persistidos no `localStorage`). Serve como **especificação viva** de UI, UX e regras de negócio.

| Tela | Status | Funcional? |
|------|--------|-----------|
| Onboarding / Login | ✅ | Visual (sem auth real) |
| Dashboard | ✅ | Saldo, receita, despesa e meta **derivados dos dados** |
| Lançar receita/despesa | ✅ | Grava no store, aparece na lista |
| Movimentos (lista) | ✅ | Busca, filtros, **editar e excluir** |
| Análises | ✅ | Gráficos refletem dados reais (donut, barras, categorias) |
| Metas | ✅ | **Criar meta** + **registrar aporte** (barra atualiza) |
| Contas & Cartões | ✅ | Bancos BR, cartões, empréstimos, **nova operação** |
| Consultor IA | ⚠️ | Respostas de exemplo (sem API; gancho pronto) |
| Configurações | ✅ | Editar perfil, toggles, tema claro/escuro |

### Estrutura de arquivos do protótipo
```
Prosper Finance.html   → entrypoint (carrega tudo, monta o canvas mobile+web)
styles.css             → design tokens (cores, tipografia, sombras, animações)
data.js                → seed de dados + catálogo de bancos + formatadores (PF_FMT)
store.js               → store reativo + persistência + ações + seletores (PFSelect)
icons.jsx              → ícones (SVG line, stroke 1.5)
components.jsx         → primitivos (Card, Button, Amount, charts, ProgressBar...)
screens.jsx            → Onboarding, Dashboard, NewTransaction, Transactions, Logomark
screens-2.jsx          → Analytics, Goals, GoalDetail, Settings + modais
accounts.jsx           → Contas & Cartões (bancos BR)
ai-chat.jsx            → Consultor (respostas de exemplo; gancho de IA comentado)
shells.jsx             → navegação (MobileShell tab bar / WebShell sidebar)
```

---

## 2. Identidade visual (já definida)

**Conceito:** navy profundo (confiança/segurança) + **ouro** (prosperidade, riqueza, sucesso).
Tipografia **Inter** em toda a interface.

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--accent` (ouro) | `#C8A02C` | `#E7B53C` | marca, progresso, CTA de destaque |
| `--ink` (navy) | `#14203A` | `#F4EFE2` | texto, superfícies hero |
| `--bg` | `#FAF8F1` | `#0A0E16` | fundo |
| `--positive` | `#1F8A5B` | `#4FB985` | receitas |
| `--negative` | `#C2412D` | `#E0735E` | despesas |

Logo: moeda/sol dourado com monograma "P". Os tokens completos estão em `styles.css`.

---

## 3. Modelo de dados (extraído do store)

```ts
Transaction { id, date: 'YYYY-MM-DD', name, cat, amount /* + receita, - despesa */, currency, type }
Goal        { id, name, emoji, target, current, deadline, color, monthly, shared, note }
Account     { id, bank, kind: 'conta'|'cartao'|'emprestimo'|'investimento',
              label, balance?, limit?, used?, due?, outstanding?, installment?, paid?, total? }
Profile     { name, fullName, email, avatar, plan }
Settings    { coupleMode, biometric, notif, currency }
```
Saldo = `openingBalance + Σ(transações)`. Receita/despesa do mês, breakdown por categoria,
série de 6 meses e taxa de poupança são **derivados** (ver `PFSelect` em `store.js`).
Toda essa lógica de cálculo deve migrar para o back-end como fonte da verdade.

---

## 4. Recomendação de stack (a pergunta que você deixou em aberto)

Para um app de finanças BR, com web + mobile, IA futura e integração bancária, recomendo:

### Stack recomendada — "Next.js + Supabase + Expo"
| Camada | Escolha | Por quê |
|--------|---------|---------|
| **Web + API** | **Next.js (App Router)** | Reaproveita os componentes React do protótipo; SSR + API routes no mesmo projeto |
| **Banco + Auth** | **Supabase** (Postgres + Auth + RLS) | Gerenciado, rápido de subir, **Row-Level Security** essencial para dados financeiros; LGPD-friendly |
| **Mobile** | **React Native (Expo)** | Compartilha lógica/design tokens com o web; biometria nativa (Face ID) |
| **Open Finance / Pix** | **Pluggy** ou **Belvo** | Agregadores brasileiros homologados no Open Finance; conectam os bancos reais (Nubank, Itaú, etc.) |
| **Consultor IA** | **Claude API** via rota server-side | Nunca expor chave no cliente; enviar contexto financeiro do usuário |
| **Infra** | **Vercel** (web) + **EAS** (mobile) | Deploy contínuo, previews por PR |

> Alternativa enxuta para validar rápido (MVP solo): só **Next.js + Supabase** (web first),
> e adicionar o app Expo na fase 2.

### Arquitetura de referência
```
[ Expo app ] ─┐
              ├─► [ Next.js API / Edge ] ─► [ Supabase Postgres + RLS ]
[ Web app  ] ─┘            │
                           ├─► [ Pluggy/Belvo ] (Open Finance, saldos, cartões)
                           └─► [ Claude API ] (consultor, server-side)
```

---

## 5. Checklist de Segurança da Informação (antes de produção)

- [ ] **Auth** com e-mail+senha + 2FA; biometria no mobile (apenas desbloqueio local).
- [ ] **Row-Level Security** no Postgres: cada linha amarrada a `user_id`; políticas testadas.
- [ ] **Criptografia** em trânsito (TLS) e em repouso; segredos em vault (não no código).
- [ ] **Nunca** expor chaves de IA/Open Finance no cliente — somente rotas server-side.
- [ ] **LGPD**: consentimento, política de privacidade, direito de exclusão de dados.
- [ ] **Open Finance**: usar provedor homologado; nunca pedir/armazenar senha de banco.
- [ ] Rate limiting, logs de auditoria, e validação de input em todas as rotas.
- [ ] **Modo casal**: modelo de compartilhamento explícito (convites + permissões por meta).

---

## 6. Roadmap sugerido

1. **Fase 0 — Fundação:** Next.js + Supabase, auth, modelo de dados, RLS. Migrar tokens e componentes do protótipo.
2. **Fase 1 — Core:** lançamento manual de transações, metas, dashboard e análises (a lógica já está especificada em `PFSelect`).
3. **Fase 2 — Bancos:** integração Open Finance (Pluggy/Belvo) para importar saldos, cartões e transações automaticamente. Pix.
4. **Fase 3 — Mobile:** app Expo reaproveitando a lógica.
5. **Fase 4 — IA:** Consultor com Claude API (já há gancho `pfAskAI()` no protótipo) + projeções e alertas inteligentes.

---

## 7. Como rodar o protótipo

Abra `Prosper Finance.html` em um navegador moderno. Os dados ficam salvos no
`localStorage` (chave `prosper.state.v2`). Para resetar: console →
`PFStore.actions.reset()`.
