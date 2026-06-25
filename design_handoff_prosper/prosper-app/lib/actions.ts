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
  paid?: boolean;
  account_id?: string | null; // cartão vinculado
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
    paid: !!input.paid,
    account_id: input.account_id || null,
  });
  if (error) throw error;
  // Se já entra como paga e vinculada a um cartão, abate o limite usado.
  if (input.paid && input.account_id && !isIncome) {
    await adjustCardUsed(supabase, input.account_id, -Math.abs(input.amount));
  }
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
}

// Abate (delta negativo) ou devolve (positivo) o "used" de um cartão, sem
// passar de 0. Usado ao marcar/desmarcar uma fatura como paga.
async function adjustCardUsed(supabase: any, accountId: string, delta: number) {
  const { data: acc } = await supabase.from('accounts').select('used, kind').eq('id', accountId).single();
  if (!acc || acc.kind !== 'cartao') return;
  const next = Math.max(0, Number(acc.used ?? 0) + delta);
  await supabase.from('accounts').update({ used: next }).eq('id', accountId);
}

// Marca/desmarca um movimento como pago. Se vinculado a um cartão, atualiza
// o limite utilizado (pagar fatura libera limite; desfazer devolve).
export async function setTransactionPaid(id: string, paid: boolean) {
  const supabase = await createClient();
  const { data: t } = await supabase.from('transactions').select('amount, paid, account_id, type').eq('id', id).single();
  if (!t) throw new Error('Movimento não encontrado');
  if (t.paid === paid) return;

  const { error } = await supabase.from('transactions').update({ paid }).eq('id', id);
  if (error) throw error;

  if (t.account_id && t.type === 'expense') {
    // pagar => libera limite (used cai); desfazer => used volta a subir
    await adjustCardUsed(supabase, t.account_id, paid ? -Math.abs(t.amount) : Math.abs(t.amount));
  }
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

// Lança uma despesa fixa recorrente: gera uma transação por mês, no dia
// escolhido, por `months` meses (ex.: "todo mês até cancelar" = janela longa).
// Cada parcela compartilha um recurrence_group para poder cancelar as futuras.
export async function addRecurringExpense(input: {
  amount: number;       // valor positivo (será lançado como despesa)
  name: string;
  category: string;
  subtype?: string | null;
  dayOfMonth: number;   // 1..31
  months: number;       // quantidade de meses a gerar
  startFrom?: string;   // YYYY-MM (mês inicial); default: mês atual
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const group = (globalThis.crypto?.randomUUID?.() ?? `rec-${Date.now()}`);
  const day = Math.max(1, Math.min(31, Math.round(input.dayOfMonth)));
  const count = Math.max(1, Math.min(60, Math.round(input.months)));

  const now = new Date();
  let baseYear = now.getFullYear();
  let baseMonth = now.getMonth(); // 0-based
  if (input.startFrom) {
    const [y, m] = input.startFrom.split('-').map(Number);
    if (y && m) { baseYear = y; baseMonth = m - 1; }
  }

  const rows = Array.from({ length: count }, (_, i) => {
    const d = new Date(baseYear, baseMonth + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate(); // último dia do mês
    const dd = Math.min(day, lastDay);
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    return {
      user_id: user.id,
      amount: -Math.abs(input.amount),
      name: input.name,
      category: input.category,
      type: 'expense' as const,
      occurred_on: iso,
      due_date: iso,
      subtype: input.subtype || 'Conta fixa',
      paid: false,
      recurrence_group: group,
    };
  });

  const { error } = await supabase.from('transactions').insert(rows);
  if (error) throw error;
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

// Cancela as parcelas FUTURAS de uma recorrência (mantém as já lançadas/pagas).
export async function cancelRecurrence(group: string, fromDate: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('transactions').delete()
    .eq('recurrence_group', group).gte('occurred_on', fromDate).eq('paid', false);
  if (error) throw error;
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

// Edita um movimento existente (valor, nome, categoria, datas, tipo).
export async function updateTransaction(id: string, input: {
  amount: number; name: string; category: string;
  occurred_on?: string; due_date?: string | null; subtype?: string | null;
  paid?: boolean; account_id?: string | null;
}) {
  const supabase = await createClient();
  const isIncome = input.amount > 0;

  // Estado anterior, para acertar o limite do cartão se algo mudou.
  const { data: old } = await supabase.from('transactions').select('amount, paid, account_id, type').eq('id', id).single();

  const { error } = await supabase.from('transactions').update({
    amount: input.amount,
    name: input.name,
    category: isIncome ? 'income' : input.category,
    type: isIncome ? 'income' : 'expense',
    occurred_on: input.occurred_on || undefined,
    due_date: isIncome ? null : (input.due_date || null),
    subtype: input.subtype || null,
    paid: !!input.paid,
    account_id: input.account_id || null,
  }).eq('id', id);
  if (error) throw error;

  // Reconcilia o limite do cartão: desfaz o efeito antigo e aplica o novo.
  if (old?.account_id && old.type === 'expense' && old.paid) {
    await adjustCardUsed(supabase, old.account_id, Math.abs(old.amount)); // devolve o antigo
  }
  if (input.account_id && !isIncome && input.paid) {
    await adjustCardUsed(supabase, input.account_id, -Math.abs(input.amount)); // aplica o novo
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
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
  total?: number;         // empréstimo: total de parcelas
  paid?: number;          // empréstimo: parcelas pagas
  installment?: number;   // empréstimo: valor da parcela
  label?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { bank, kind, value, used, due, total, paid, installment, label } = input;

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
  else if (kind === 'emprestimo') {
    const totalN = total && total > 0 ? total : 12;
    row = { ...row, label: label || 'Empréstimo pessoal', outstanding: value, installment: installment && installment > 0 ? installment : Math.round((value / totalN) * 100) / 100, paid: paid ?? 0, total: totalN };
  }

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
