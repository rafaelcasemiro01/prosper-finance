'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Server actions — writes are RLS-scoped; user_id is set from the session.

export async function addTransaction(input: {
  amount: number; // + income, - expense
  name: string;
  category: string;
  occurred_on?: string;     // data de entrada / da despesa (YYYY-MM-DD)
  due_date?: string | null; // vencimento (despesas)
  subtype?: string | null;  // tipo (ex.: 'Salário', 'Fatura de cartão')
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
    occurred_on: input.occurred_on || undefined,
    due_date: isIncome ? null : (input.due_date || null),
    subtype: input.subtype || null,
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

// Cria uma categoria personalizada no perfil do usuário (JSONB).
export async function addCategory(input: { name: string; slug: string; color: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { data: profile } = await supabase.from('profiles').select('custom_categories').single();
  const list: { slug: string; name: string; color: string }[] = (profile?.custom_categories as any) ?? [];
  if (!list.some((c) => c.slug === input.slug)) {
    list.push({ slug: input.slug, name: input.name, color: input.color });
    const { error } = await supabase.from('profiles').update({ custom_categories: list }).eq('id', user.id);
    if (error) throw error;
  }
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/analytics');
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
  value: number;          // saldo / valor do empréstimo / (cartão: limite total)
  used?: number;          // cartão: limite utilizado
  due?: string | null;    // cartão: vencimento (dd/mm)
  label?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { bank, kind, value, used, due, label } = input;

  // Bloqueia banco duplicado para o mesmo tipo (ex.: duas "contas" no Nubank).
  const { data: existing } = await supabase
    .from('accounts').select('id').eq('bank', bank).eq('kind', kind).limit(1);
  if (existing && existing.length > 0) {
    throw new Error('Já existe um(a) ' + kind + ' nesse banco. Edite o existente.');
  }

  let row: Record<string, unknown> = { user_id: user.id, bank, kind };
  if (kind === 'conta') row = { ...row, label: label || 'Conta corrente', balance: value };
  else if (kind === 'investimento') row = { ...row, label: label || 'Investimentos', balance: value };
  else if (kind === 'cartao') row = { ...row, label: label || 'Cartão de crédito', credit_limit: value, used: used ?? 0, due: due ?? null };
  else if (kind === 'emprestimo') row = { ...row, label: label || 'Empréstimo pessoal', outstanding: value, installment: Math.round(value / 12), paid: 0, total: 12 };

  const { error } = await supabase.from('accounts').insert(row);
  if (error) throw error;
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
}

// Edita uma conta/cartão/empréstimo existente.
export async function updateAccount(id: string, patch: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from('accounts').update(patch).eq('id', id);
  if (error) throw error;
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
}

export async function updateProfile(patch: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
  if (error) throw error;
  revalidatePath('/settings');
}
