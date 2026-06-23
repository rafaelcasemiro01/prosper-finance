import { Sidebar } from '@/components/Sidebar';
import { Card, Eyebrow } from '@/components/ui';
import { NewTransactionForm } from '@/components/NewTransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { getTransactions } from '@/lib/queries';
import { brl } from '@/lib/format';

// Server Component — fetches RLS-scoped transactions, renders summary + list.
export default async function TransactionsPage() {
  const transactions = await getTransactions();

  const income = transactions.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const expense = transactions.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);

  return (
    <div style={{ display: 'flex', background: 'var(--bg)', minHeight: '100vh' }}>
      <Sidebar active="/transactions" />

      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <Eyebrow>Maio · 2026</Eyebrow>
            <h1 style={{ fontSize: 44, margin: '6px 0 0', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Movimentos
            </h1>
          </div>
          <NewTransactionForm />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <Card pad={18}>
            <Eyebrow style={{ color: 'var(--positive)' }}>Entradas</Eyebrow>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>+{brl(income)}</div>
          </Card>
          <Card pad={18}>
            <Eyebrow style={{ color: 'var(--negative)' }}>Saídas</Eyebrow>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>−{brl(expense)}</div>
          </Card>
        </div>

        <TransactionList transactions={transactions} />
      </main>
    </div>
  );
}
