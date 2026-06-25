import { createClient } from '@/lib/supabase/server';
import type { Transaction, Goal, Account, Profile } from '@/lib/types';
import type { Category } from '@/lib/categories';

// Data access layer — all reads are RLS-scoped to the logged-in user.

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').single();
  return data;
}

// Categorias personalizadas do usuário (JSONB no profile).
export async function getCustomCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('custom_categories').single();
  return ((data?.custom_categories as Category[]) ?? []);
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
  const txs = await getTransactions();
  const month = latestExpenseMonth(txs);
  const totals: Record<string, number> = {};
  for (const t of txs) {
    if (t.amount >= 0) continue;
    if (!t.occurred_on.startsWith(month)) continue;
    const c = t.category || 'outros';
    totals[c] = (totals[c] ?? 0) + Math.abs(t.amount);
  }
  return Object.entries(totals).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

// Mês (YYYY-MM) mais recente que tem despesas; cai no mês atual se não houver.
function latestExpenseMonth(txs: Transaction[]): string {
  const months = txs.filter((t) => t.amount < 0).map((t) => t.occurred_on.slice(0, 7));
  if (months.length === 0) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  return months.sort().reverse()[0];
}

// Despesas agrupadas por forma de pagamento (mês com dados mais recente).
export async function getPaymentBreakdown(): Promise<{ method: string; amount: number }[]> {
  const txs = await getTransactions();
  const month = latestExpenseMonth(txs);
  const totals: Record<string, number> = {};
  for (const t of txs) {
    if (t.amount >= 0) continue;
    if (!t.occurred_on.startsWith(month)) continue;
    const m = t.payment_method || 'outros';
    totals[m] = (totals[m] ?? 0) + Math.abs(t.amount);
  }
  return Object.entries(totals).map(([method, amount]) => ({ method, amount })).sort((a, b) => b.amount - a.amount);
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
