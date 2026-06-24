import { AppShell } from '@/components/AppShell';
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
  const cardAvail = accounts.filter((a) => a.kind === 'cartao').reduce((s, a) => s + Math.max(0, (a.credit_limit ?? 0) - (a.used ?? 0)), 0);
  const loans = accounts.filter((a) => a.kind === 'emprestimo').reduce((s, a) => s + (a.outstanding ?? 0), 0);

  return (
    <AppShell active="/accounts" width="wide">
      <Eyebrow>Open Finance</Eyebrow>
      <h1 className="h-page" style={{ margin: '6px 0 22px' }}>Contas &amp; Cartões</h1>

      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <Card pad={18} className="card--hover">
          <Eyebrow style={{ color: 'var(--positive)' }}>Em contas</Eyebrow>
          <div className="tnum" style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{brl(inAccounts)}</div>
        </Card>
        <Card pad={18} className="card--hover">
          <Eyebrow style={{ color: 'var(--warning)' }}>Faturas em aberto</Eyebrow>
          <div className="tnum" style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{brl(cardBills)}</div>
        </Card>
        <Card pad={18} className="card--hover">
          <Eyebrow style={{ color: 'var(--positive)' }}>Limite disponível</Eyebrow>
          <div className="tnum" style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{brl(cardAvail)}</div>
        </Card>
        <Card pad={18} className="card--hover">
          <Eyebrow style={{ color: 'var(--negative)' }}>Empréstimos</Eyebrow>
          <div className="tnum" style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{brl(loans)}</div>
        </Card>
      </div>

      <AccountsBoard accounts={accounts} />
    </AppShell>
  );
}
