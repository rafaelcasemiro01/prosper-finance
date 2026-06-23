import { AppShell } from '@/components/AppShell';
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
    <AppShell active="/transactions" width="wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <Eyebrow>Maio · 2026</Eyebrow>
          <h1 className="h-page" style={{ margin: '6px 0 0' }}>Movimentos</h1>
        </div>
        <NewTransactionForm />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <Card pad={18} className="card--hover">
          <Eyebrow style={{ color: 'var(--positive)' }}>Entradas</Eyebrow>
          <div className="tnum" style={{ fontSize: 'clamp(24px,5vw,30px)', fontWeight: 700, marginTop: 6 }}>+{brl(income)}</div>
        </Card>
        <Card pad={18} className="card--hover">
          <Eyebrow style={{ color: 'var(--negative)' }}>Saídas</Eyebrow>
          <div className="tnum" style={{ fontSize: 'clamp(24px,5vw,30px)', fontWeight: 700, marginTop: 6 }}>−{brl(expense)}</div>
        </Card>
      </div>

      <TransactionList transactions={transactions} />
    </AppShell>
  );
}
