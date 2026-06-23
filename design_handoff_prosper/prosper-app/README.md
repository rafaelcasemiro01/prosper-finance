# Prosper Finance — App (Next.js + Supabase)

Scaffold da **Fase 0**: Next.js (App Router, TypeScript) + Supabase (Auth + Postgres + RLS),
já com os tokens da marca (navy + ouro), login, e um Dashboard lendo dados reais do banco.

## Stack
- **Next.js 15** (App Router, Server Components, Server Actions)
- **Supabase** — Auth + Postgres com **Row-Level Security** (`@supabase/ssr`)
- **Inter** via `next/font`
- Tokens de design portados do protótipo em `app/globals.css`

## Setup

1. **Crie o projeto no Supabase** e rode o schema:
   - Abra `../supabase/schema.sql` no SQL editor do Supabase e execute.
2. **Variáveis de ambiente:**
   ```bash
   cp .env.local.example .env.local
   # preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
3. **Instale e rode:**
   ```bash
   npm install
   npm run dev
   ```
4. Acesse `http://localhost:3000` → você cai em `/login`. Crie uma conta
   (um perfil é criado automaticamente pelo trigger `handle_new_user`).

## Estrutura
```
app/
  globals.css           tokens da marca (light/dark) + base
  layout.tsx            html + fonte Inter
  page.tsx              redireciona para /dashboard
  login/page.tsx        auth (signin/signup) — client component
  dashboard/page.tsx    server component lendo Supabase (saldo, mês, metas, recentes)
  transactions/page.tsx server component + form/lista (client) — lançar, listar, excluir
  analytics/page.tsx    server component + gráficos (donut/barras) por dados reais
  goals/page.tsx        server component + board (criar meta, aporte)
  accounts/page.tsx     server component + board (bancos BR, nova operação)
  ai/page.tsx           consultor (chat client) → /api/advisor
  api/advisor/route.ts  rota server-side: contexto financeiro + Claude API
  settings/page.tsx     server component + form de perfil (client) + sair
components/
  ui.tsx                Card, Button, Eyebrow, ProgressBar
  Sidebar.tsx           navegação + logo (P dourado)
  NewTransactionForm.tsx  modal de lançamento (client)
  TransactionList.tsx     lista agrupada por data + excluir (client)
  Charts.tsx              DonutChart + BarChart (SVG, client)
  GoalsBoard.tsx          board de metas + modais criar/aporte (client)
  AccountsBoard.tsx       contas/cartões/empréstimos + nova operação (client)
  AdvisorChat.tsx         chat do consultor (client)
  SettingsForm.tsx        editar perfil + sair (client)
lib/banks.ts              catálogo de bancos BR (monogramas)
lib/
  supabase/{client,server,middleware}.ts   clients @supabase/ssr
  types.ts              tipos do domínio (espelham o schema)
  format.ts             brl() / parseBRL()  (porta do PF_FMT)
  queries.ts            leituras RLS-scoped + RPCs derivadas
  actions.ts            server actions (add/delete tx, metas, aporte)
middleware.ts           refresh de sessão + guarda de rotas
```

## O que já funciona (todas as 7 telas)
- **Auth** e-mail/senha; sessão via cookies; guarda de rotas no middleware.
- **Dashboard** (`/dashboard`): saldo, mês, meta destacada, movimentos — dados reais.
- **Movimentos** (`/transactions`): lançar (modal), lista agrupada por data, excluir.
- **Análises** (`/analytics`): saldo do mês, taxa de poupança, barras (6m), donut por categoria.
- **Metas** (`/goals`): progresso total, criar meta, registrar aporte (atualiza a barra).
- **Contas & Cartões** (`/accounts`): bancos BR, cartões, empréstimos, nova operação.
- **Consultor** (`/ai`): chat com **IA real** via rota server-side `/api/advisor` (Claude API com contexto financeiro do usuário). Fallback local se a chave não estiver configurada.
- **Configurações** (`/settings`): editar perfil, salvar, sair da conta.

Todas as escritas via **Server Actions** com `revalidatePath` — as telas se mantêm em sincronia.

## Deploy
Ver **`DEPLOY.md`** — guia completo: Supabase (schema + chaves), Anthropic (chave da IA),
Vercel (env vars) e checklist pós-deploy.

## Pendente para produção
- Integração Open Finance (Pluggy/Belvo) para popular contas/transações automaticamente.
- Tema escuro toggle (tokens já prontos via `data-theme`), modo casal (tabela de membros), i18n/moedas.
Reaproveite a lógica de `../store.js` (seletores `PFSelect`) — boa parte já virou SQL no schema.

## Segurança (ver checklist completo em ../HANDOFF.md)
- RLS ativa em todas as tabelas (cada usuário só vê o que é seu).
- Service role e chave da IA **somente server-side**.
- Open Finance (Pluggy/Belvo) atrás de rota server-side; nunca pedir senha de banco.
