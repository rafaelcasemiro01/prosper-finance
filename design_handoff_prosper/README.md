# Handoff: Prosper Finance — App de Finanças Pessoais

## Overview
Prosper Finance é um app de **finanças pessoais (mobile + web)**: lançamento de receitas/despesas,
dashboard com saldo e visão geral, análises com gráficos, metas com barra de progresso, contas/cartões/
empréstimos de bancos brasileiros e um consultor (IA na fase futura). Marca: **navy + ouro** (prosperidade).

## Sobre os arquivos deste pacote
Os arquivos `.html / .jsx / .css / .js` deste bundle são **referências de design + protótipo funcional**,
construídos em HTML/React (via Babel no browser). **Não são código de produção para copiar e colar.**
A tarefa é **recriar estes designs no ambiente do codebase alvo** (Next.js/React, React Native, etc.),
seguindo os padrões e bibliotecas desse projeto. Se ainda não existe ambiente, use a stack recomendada
em `HANDOFF.md` (Next.js + Supabase + Expo).

> **Diferencial deste handoff:** o protótipo já tem **lógica de negócio real** isolada em `store.js`
> (ações + seletores `PFSelect`) e dados/formatos em `data.js`. Essa lógica (cálculo de saldo, receita/
> despesa do mês, breakdown por categoria, taxa de poupança, série de 6 meses) pode ser **portada quase
> 1:1** para o back-end/serviço. Trate-a como especificação executável das regras de negócio.

## Fidelidade
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, sombras, estados e interações são finais.
Recriar pixel-a-pixel usando as libs do codebase. Tokens exatos abaixo e em `styles.css`.

---

## Telas / Views

Todas as telas existem em **duas formas**: `frame="mobile"` (iOS, navegação por tab bar) e
`frame="web"` (desktop, sidebar). Mesma fonte de dados.

### 1. Onboarding / Login  — `OnboardingScreen` (screens.jsx)
- **Propósito:** boas-vindas + entrada.
- **Layout:** coluna centralizada; logo no topo, título display, subtítulo, CTAs.
- **Copy:** título "Sua grana no controle, **sem complicação**." / sub "Contas, metas e gastos em um só
  lugar, pensado para a sua rotina. Comece em minutos."
- **Componentes:** Logomark (círculo + P, dourado), `Button` primário "Começar agora" → step e-mail →
  "Entrar" navega para `dashboard`.

### 2. Dashboard — `DashboardScreen` (screens.jsx)
- **Propósito:** visão geral. **Tudo derivado dos dados** (não hardcoded).
- **Hero de saldo:** card gradiente navy→navy+ouro, glow dourado, brilho (sheen). Mostra **Patrimônio
  total** (`PFSelect.balanceTotal`), variação do mês, sparkline, e split **Disponível / Investido**.
  Texto claro sobre card escuro (e vice-versa no dark) via `color-mix`.
- **Ações rápidas (mobile):** Lançar / Análises / Metas / Consultor.
- **Quick stats:** Receita e Despesa do mês.
- **Meta destacada:** primeira meta com % e barra.
- **Insight do consultor:** card âmbar → navega para `ai`.
- **Movimentos recentes:** lista; tocar abre edição.

### 3. Lançar receita/despesa — `NewTransactionScreen` (screens.jsx)
- **Propósito:** criar/editar transação. **Grava no store.**
- **Layout:** toggle Despesa/Receita; input de valor grande (parser pt-BR `parseBRLInput`); grid de
  categorias (só despesa); descrição; data; CTA. Em edição, botão **Excluir**.
- **Regras:** valor > 0 e descrição obrigatória habilitam salvar. Receita força categoria `income`.

### 4. Movimentos — `TransactionsScreen` (screens.jsx)
- Lista agrupada por data (Hoje/Ontem/…); **busca** (nome+categoria); **filtros** (Todas/Despesas/
  Receitas); somatórios de entradas/saídas; tocar numa linha → editar.

### 5. Análises — `AnalyticsScreen` (screens-2.jsx)
- Economia do mês (líquido), taxa de poupança; **gráfico de barras** 6 meses (gridlines, rótulo no mês
  ativo); **donut por categoria** com hover; lista de categorias com %.

### 6. Metas — `GoalsScreen` / `GoalDetail` (screens-2.jsx)
- Hero de progresso total; cards de meta (emoji, %, barra, valores, modo casal). **Criar meta**
  (`NewGoalSheet`: nome, objetivo, já guardado, ícone, cor, modo casal). **Detalhe:** % gigante,
  marcos da jornada, e **Registrar aporte** (`ContributeSheet`) que atualiza a barra. Excluir meta.

### 7. Contas & Cartões — `AccountsScreen` (accounts.jsx)
- Resumo (em contas / faturas / empréstimos). Seções: Contas, Cartões (uso do limite), Empréstimos
  (parcelas pagas). Bancos BR como **monograma colorido** (não logo da marca). **Nova operação**
  (`NewOperationSheet`): tipo (Conta/Cartão/Empréstimo/Investimento) + banco + valor.

### 8. Consultor — `AIChatScreen` (ai-chat.jsx)
- Chat. **Atualmente sem API**: respostas de exemplo curadas por palavra-chave (`pfCannedReply`).
  Gancho `pfAskAI()` comentado, pronto para Claude API server-side. Header indica "Prévia".

### 9. Configurações — `SettingsScreen` (screens-2.jsx)
- Perfil (editar nome/e-mail → `EditProfileSheet`); tema claro/escuro; modo casal; moeda; **Contas
  conectadas** → `accounts`; biometria; notificações. Toggles persistem no store.

---

## Interações & comportamento
- **Navegação:** `navigate(screen, params?)`. Mobile = tab bar flutuante; Web = sidebar com indicador
  dourado no item ativo. `params` carrega ex. `{ editId }` (editar transação) e `{ openGoal }`.
- **Animações:** entrada `pf-fade` (fade-up 0.4s), barras `pf-bar` (grow), progresso `pf-progress-fill`,
  hover-lift em cards (`pf-elevate-hover`), hover em linhas (`pf-rowhover`), donut destaca fatia.
- **Modais:** sheets sobem de baixo no mobile, centralizados no web; fundo com blur.
- **Estados:** botões desabilitados (opacity 0.45) quando inválidos; foco com anel (`:focus-visible`).
- **Tema:** atributo `data-theme="light|dark"` no container raiz `.pf`.

## Gerência de estado (ver `store.js`)
- Store reativo via `React.useSyncExternalStore`; persistência em `localStorage` (`prosper.state.v2`).
- **Entidades:** `transactions, goals, accounts, profile, settings, openingBalance, invested`.
- **Ações:** add/update/deleteTransaction, addGoal/updateGoal/contributeGoal/deleteGoal,
  addAccount/deleteAccount, updateProfile, updateSettings, reset.
- **Seletores (`PFSelect`):** balanceTotal, available, monthIncome, monthExpense, monthNet,
  categoryBreakdown, series (6m), savingsRate, recentTransactions, goalsProgress.
- No produto real, esses cálculos devem viver no back-end (fonte da verdade).

## Design tokens (ver `styles.css` para todos)
| Token | Light | Dark |
|-------|-------|------|
| `--accent` (ouro) | `#C8A02C` | `#E7B53C` |
| `--ink` (navy) | `#14203A` | `#F4EFE2` |
| `--bg` | `#FAF8F1` | `#0A0E16` |
| `--surface` | `#FFFFFF` | `#131A26` |
| `--positive` | `#1F8A5B` | `#4FB985` |
| `--negative` | `#C2412D` | `#E0735E` |
| `--line` | `#E9E3D4` | `#232C3A` |
- **Tipografia:** Inter (300–800) em tudo; números em `tabular-nums`.
- **Raios:** sm 8 · base 14 · lg 22 · xl 28 · pill 999.
- **Sombras:** `--shadow-1/2/pop` e `--glow-accent` (brilho dourado).
- **Logo:** círculo + "P" em traço (stroke 2 / 2.6), cor `--accent`, "P" centralizado.

## Assets
Sem imagens externas. Ícones são SVG inline (`icons.jsx`, stroke 1.5). Bancos = monograma colorido
(cor de marca aproximada), **nunca o logotipo oficial** — evitar reproduzir marcas registradas.

## Arquivos (referência)
- `Prosper Finance.html` — entrypoint (monta canvas mobile+web; presentation-only: device frames e
  design-canvas são scaffolding de apresentação, **não** fazem parte do produto).
- `styles.css` · `data.js` · `store.js` · `icons.jsx` · `components.jsx`
- `screens.jsx` · `screens-2.jsx` · `accounts.jsx` · `ai-chat.jsx` · `shells.jsx`
- `HANDOFF.md` — arquitetura, **stack recomendada**, modelo de dados, checklist de segurança/LGPD, roadmap.

## Próximos passos (resumo — detalhe em HANDOFF.md)
1. Next.js + Supabase (Auth + Postgres + **RLS** por `user_id`).
2. Portar tokens (`styles.css`) e regras de negócio (`store.js` → serviços/SQL).
3. Recriar telas pixel-a-pixel com as libs do projeto.
4. Open Finance (Pluggy/Belvo) para bancos/Pix; Claude API server-side para o consultor.
