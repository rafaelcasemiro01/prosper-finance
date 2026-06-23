import { createClient } from '@/lib/supabase/server';
import type { Transaction, Goal, Account, Profile } from '@/lib/types';

// Data access layer — all reads are RLS-scoped to the logged-in user.

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').single();
  return data;
}

export async function getTransactions(): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .order('occurred_on', { ascending: false });
  return data ?? [];
}

export async function getGoals(): Promise<Goal[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('goals').select('*').order('created_at');
  return data ?? [];
}

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('accounts').select('*').order('created_at');
  return data ?? [];
}

// Derived values via Postgres functions (server-side source of truth).
export async function getBalanceTotal(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('balance_total');
  return Number(data ?? 0);
}

export async function getMonthSummary(): Promise<{ income: number; expense: number; net: number }> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('month_summary').single();
  return {
    income: Number((data as any)?.income ?? 0),
    expense: Number((data as any)?.expense ?? 0),
    net: Number((data as any)?.net ?? 0),
  };
}

export async function getCategoryBreakdown(): Promise<{ category: string; amount: number }[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('category_breakdown');
  return (data ?? []) as { category: string; amount: number }[];
}

// Last 6 months income/expense series, computed from transactions.
export async function getSixMonthSeries(): Promise<{ labels: string[]; income: number[]; expense: number[] }> {
  const txs = await getTransactions();
  const labels: string[] = [];
  const income: number[] = [];
  const expense: number[] = [];
  const now = new Date();
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  for (let k = 5; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    labels.push(MONTHS[d.getMonth()]);
    const inMonth = txs.filter((t) => t.occurred_on.startsWith(key));
    income.push(inMonth.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0));
    expense.push(inMonth.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0));
  }
  return { labels, income, expense };
}
