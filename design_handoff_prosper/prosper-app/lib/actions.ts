'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Server actions — writes are RLS-scoped; user_id is set from the session.

export async function addTransaction(input: {
  amount: number; // + income, - expense
  name: string;
  category: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const isIncome = input.amount > 0;
  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    amount: input.amount,
    name: input.name,
    category: isIncome ? 'income' : input.category,
    type: isIncome ? 'income' : 'expense',
  });
  if (error) throw error;
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

export async function addGoal(input: {
  name: string; target: number; current?: number; emoji?: string; color?: string; shared?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { error } = await supabase.from('goals').insert({ user_id: user.id, ...input });
  if (error) throw error;
  revalidatePath('/goals');
}

// Atualiza campos de uma meta (nome, valor, data, etc.) — RLS garante o dono.
export async function updateGoal(
  id: string,
  patch: { name?: string; target?: number; current?: number; deadline?: string | null; emoji?: string; color?: string; shared?: boolean; note?: string },
) {
  const supabase = await createClient();
  const { error } = await supabase.from('goals').update(patch).eq('id', id);
  if (error) throw error;
  revalidatePath('/goals');
  revalidatePath('/dashboard');
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/goals');
  revalidatePath('/dashboard');
}

// Atomic contribution via the SQL function contribute_to_goal().
export async function contributeToGoal(goalId: string, amount: number) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('contribute_to_goal', { p_goal: goalId, p_amount: amount });
  if (error) throw error;
  revalidatePath('/goals');
}

export async function addAccount(input: {
  bank: string;
  kind: 'conta' | 'cartao' | 'emprestimo' | 'investimento';
  value: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { bank, kind, value } = input;
  let row: Record<string, unknown> = { user_id: user.id, bank, kind };
  if (kind === 'conta') row = { ...row, label: 'Conta corrente', balance: value };
  else if (kind === 'investimento') row = { ...row, label: 'Investimentos', balance: value };
  else if (kind === 'cartao') row = { ...row, label: 'Cartão de crédito', credit_limit: value, used: 0, due: '10/06' };
  else if (kind === 'emprestimo') row = { ...row, label: 'Empréstimo pessoal', outstanding: value, installment: Math.round(value / 12), paid: 0, total: 12 };

  const { error } = await supabase.from('accounts').insert(row);
  if (error) throw error;
  revalidatePath('/accounts');
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/accounts');
}

export async function updateProfile(patch: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
  if (error) throw error;
  revalidatePath('/settings');
}
