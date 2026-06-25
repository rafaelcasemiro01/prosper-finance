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
  custom_categories?: { slug: string; name: string; color: string }[];
}

export interface Transaction {
  id: string;
  user_id: string;
  occurred_on: string; // YYYY-MM-DD
  due_date?: string | null; // YYYY-MM-DD (despesas: vencimento)
  name: string;
  category: string; // 'food' | 'home' | ... | 'income' | slug custom
  subtype?: string | null; // ex.: 'Salário', 'Fatura de cartão de crédito'
  amount: number;   // + income, - expense
  type: TxType;
  currency: string;
  paid?: boolean;           // despesa paga?
  account_id?: string | null; // cartão vinculado (para abater limite ao pagar)
  payment_method?: string | null; // débito | pix | dinheiro | credito
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

// Categorias padrão (mantidas por compatibilidade). Para o mapa completo
// com as personalizadas, use buildCategoryMap() em lib/categories.ts.
export { DEFAULT_CATEGORIES as CATEGORIES } from '@/lib/categories';
