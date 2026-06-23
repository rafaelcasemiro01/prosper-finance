-- ============================================================================
-- Prosper Finance — Supabase schema (Phase 0)
-- Postgres + Row-Level Security. Run in the Supabase SQL editor.
-- Every table is scoped to auth.uid(); a user only ever sees their own rows.
-- ============================================================================

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums ---------------------------------------------------------------------
do $$ begin
  create type tx_type        as enum ('income', 'expense');
  create type account_kind   as enum ('conta', 'cartao', 'emprestimo', 'investimento');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- profiles  (1:1 with auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null default '',
  email         text not null default '',
  avatar        text not null default '',
  plan          text not null default 'Free',
  couple_mode   boolean not null default false,
  partner_id    uuid references auth.users(id),
  currency      char(3) not null default 'BRL',
  -- opening balance so total = opening + sum(transactions)
  opening_balance numeric(14,2) not null default 0,
  invested      numeric(14,2) not null default 0,
  biometric     boolean not null default true,
  notif         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- transactions
-- ============================================================================
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  occurred_on date not null default current_date,
  name        text not null,
  category    text not null,           -- 'food','home',... or 'income'
  amount      numeric(14,2) not null,  -- positive=income, negative=expense
  type        tx_type not null,
  currency    char(3) not null default 'BRL',
  created_at  timestamptz not null default now()
);
create index if not exists transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc);

-- ============================================================================
-- goals
-- ============================================================================
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  emoji       text not null default '◇',
  target      numeric(14,2) not null check (target > 0),
  current     numeric(14,2) not null default 0 check (current >= 0),
  deadline    date,
  color       text not null default '#C8A02C',
  monthly     numeric(14,2) not null default 0,
  shared      boolean not null default false,
  note        text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists goals_user_idx on public.goals (user_id);

-- Atomic contribution helper (never exceeds target)
create or replace function public.contribute_to_goal(p_goal uuid, p_amount numeric)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.goals
     set current = least(target, current + p_amount)
   where id = p_goal and user_id = auth.uid();
end; $$;

-- ============================================================================
-- accounts  (contas, cartões, empréstimos, investimentos)
-- ============================================================================
create table if not exists public.accounts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  bank         text not null,           -- 'nubank','itau',...
  kind         account_kind not null,
  label        text not null default '',
  balance      numeric(14,2),           -- conta / investimento
  credit_limit numeric(14,2),           -- cartao
  used         numeric(14,2),           -- cartao
  due          text,                    -- cartao (dd/mm)
  outstanding  numeric(14,2),           -- emprestimo
  installment  numeric(14,2),           -- emprestimo
  paid         int,                     -- emprestimo
  total        int,                     -- emprestimo
  created_at   timestamptz not null default now()
);
create index if not exists accounts_user_idx on public.accounts (user_id);

-- ============================================================================
-- Row-Level Security  — owner-only access on every table
-- ============================================================================
alter table public.profiles     enable row level security;
alter table public.transactions enable row level security;
alter table public.goals        enable row level security;
alter table public.accounts     enable row level security;

-- profiles: a user reads/updates only their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- generic owner policies for the data tables
create policy "tx_all_own" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_all_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "accounts_all_own" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Derived analytics — server-side source of truth (mirrors PFSelect)
-- ============================================================================

-- Monthly income / expense / net for the current user
create or replace function public.month_summary(p_month date default date_trunc('month', current_date)::date)
returns table (income numeric, expense numeric, net numeric)
language sql stable security definer set search_path = public as $$
  select
    coalesce(sum(amount) filter (where amount > 0), 0)            as income,
    coalesce(-sum(amount) filter (where amount < 0), 0)           as expense,
    coalesce(sum(amount), 0)                                      as net
  from public.transactions
  where user_id = auth.uid()
    and date_trunc('month', occurred_on) = date_trunc('month', p_month);
$$;

-- Total patrimônio = opening_balance + sum(all transactions)
create or replace function public.balance_total()
returns numeric language sql stable security definer set search_path = public as $$
  select coalesce((select opening_balance from public.profiles where id = auth.uid()), 0)
       + coalesce((select sum(amount) from public.transactions where user_id = auth.uid()), 0);
$$;

-- Expense breakdown by category for a month
create or replace function public.category_breakdown(p_month date default date_trunc('month', current_date)::date)
returns table (category text, amount numeric)
language sql stable security definer set search_path = public as $$
  select category, -sum(amount) as amount
  from public.transactions
  where user_id = auth.uid()
    and amount < 0
    and date_trunc('month', occurred_on) = date_trunc('month', p_month)
  group by category
  order by amount desc;
$$;

-- ============================================================================
-- Notes
-- ============================================================================
-- • Open Finance (Pluggy/Belvo) deve gravar contas/transações via service role
--   atrás de uma rota server-side; nunca expor chaves no cliente.
-- • Modo casal: para compartilhar metas, criar tabela goal_members(goal_id,
--   user_id) e ajustar a policy de goals para (auth.uid() = user_id OR exists
--   membership). Mantido simples na Fase 0.
-- • Consultor IA: chamar Claude API em rota server-side, enviando month_summary
--   + category_breakdown + goals do usuário como contexto.
