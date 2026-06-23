import { Sidebar } from '@/components/Sidebar';
import { Card, Eyebrow } from '@/components/ui';
import { AccountsBoard } from '@/components/AccountsBoard';
import { getAccounts } from '@/lib/queries';
import { brl } from '@/lib/format';

// Server Component — connected accounts, cards and loans.
export default async function AccountsPage() {
  const accounts = await getAccounts();

  const inAccounts = accounts
    .filter((a) => a.kind === 'conta' || a.kind === 'investimento')
    .reduce((s, a) => s + (a.balance ?? 0), 0);
  const cardBills = accounts.filter((a) => a.kind === 'cartao').reduce((s, a) => s + (a.used ?? 0), 0);
  const loans = accounts.filter((a) => a.kind === 'emprestimo').reduce((s, a) => s + (a.outstanding ?? 0), 0);

  return (
    <div style={{ display: 'flex', background: 'var(--bg)', minHeight: '100vh' }}>
      <Sidebar active="/accounts" />

      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1100 }}>
        <Eyebrow>Open Finance</Eyebrow>
        <h1 style={{ fontSize: 44, margin: '6px 0 24px', fontWeight: 700, letterSpacing: '-0.02em' }}>Contas &amp; Cartões</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
          <Card pad={18}>
            <Eyebrow style={{ color: 'var(--positive)' }}>Em contas</Eyebrow>
            <div className="tnum" style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{brl(inAccounts)}</div>
          </Card>
          <Card pad={18}>
            <Eyebrow style={{ color: 'var(--warning)' }}>Faturas em aberto</Eyebrow>
            <div className="tnum" style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{brl(cardBills)}</div>
          </Card>
          <Card pad={18}>
            <Eyebrow style={{ color: 'var(--negative)' }}>Empréstimos</Eyebrow>
            <div className="tnum" style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{brl(loans)}</div>
          </Card>
        </div>

        <AccountsBoard accounts={accounts} />
      </main>
    </div>
  );
}
