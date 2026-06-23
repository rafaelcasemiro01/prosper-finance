// Domain types — mirror the Postgres schema (supabase/schema.sql).

export type TxType = 'income' | 'expense';
export type AccountKind = 'conta' | 'cartao' | 'emprestimo' | 'investimento';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar: string;
  plan: string;
  couple_mode: boolean;
  currency: string;
  opening_balance: number;
  invested: number;
  biometric: boolean;
  notif: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  occurred_on: string; // YYYY-MM-DD
  name: string;
  category: string; // 'food' | 'home' | ... | 'income'
  amount: number;   // + income, - expense
  type: TxType;
  currency: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  target: number;
  current: number;
  deadline: string | null;
  color: string;
  monthly: number;
  shared: boolean;
  note: string;
}

export interface Account {
  id: string;
  user_id: string;
  bank: string;
  kind: AccountKind;
  label: string;
  balance?: number | null;
  credit_limit?: number | null;
  used?: number | null;
  due?: string | null;
  outstanding?: number | null;
  installment?: number | null;
  paid?: number | null;
  total?: number | null;
}

export const CATEGORIES: Record<string, { name: string; color: string }> = {
  food:      { name: 'Alimentação', color: '#C8A02C' },
  home:      { name: 'Moradia',     color: '#1F8A5B' },
  transport: { name: 'Transporte',  color: '#2E7D9A' },
  leisure:   { name: 'Lazer',       color: '#C2542E' },
  health:    { name: 'Saúde',       color: '#8E5B8A' },
  edu:       { name: 'Educação',    color: '#B5862B' },
  income:    { name: 'Receita',     color: '#1F8A5B' },
};
