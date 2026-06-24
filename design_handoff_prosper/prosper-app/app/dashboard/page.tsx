import { AppShell } from '@/components/AppShell';
import { Card, Eyebrow, ProgressBar } from '@/components/ui';
import { NewTransactionForm } from '@/components/NewTransactionForm';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { CardReminders } from '@/components/CardReminders';
import {
  getProfile, getBalanceTotal, getMonthSummary, getGoals, getTransactions, getAccounts, getCustomCategories,
} from '@/lib/queries';
import { brl } from '@/lib/format';
import { buildCategoryMap, resolveCategory } from '@/lib/categories';

// Server Component — reads live, RLS-scoped data from Supabase.
export default async function DashboardPage() {
  const [profile, total, month, goals, transactions, accounts, customCategories] = await Promise.all([
    getProfile(),
    getBalanceTotal(),
    getMonthSummary(),
    getGoals(),
    getTransactions(),
    getAccounts(),
    getCustomCategories(),
  ]);

  const featured = goals[0];
  const goalPct = featured ? (featured.current / featured.target) * 100 : 0;
  const recent = transactions.slice(0, 6);
  const catMap = buildCategoryMap(customCategories);
  const firstName = (profile?.full_name || 'você').split(' ')[0];

  // Derivados das Contas & Cartões
  const saldoEmContas = accounts
    .filter((a) => a.kind === 'conta' || a.kind === 'investimento')
    .reduce((s, a) => s + (a.balance ?? 0), 0);
  const faturasAbertas = accounts
    .filter((a) => a.kind === 'cartao')
    .reduce((s, a) => s + (a.used ?? 0), 0);
  const cartoes = accounts.filter((a) => a.kind === 'cartao' && a.due);

  return (
    <AppShell active="/dashboard" width="wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', margin: '0 0 28px' }}>
        <div>
          <Eyebrow>Boa noite</Eyebrow>
          <h1 className="h-page" style={{ margin: '6px 0 0' }}>Olá, {firstName}</h1>
        </div>
        <NewTransactionForm customCategories={customCategories} cards={accounts.filter((a) => a.kind === 'cartao')} />
      </div>

      {/* Lembretes de vencimento de cartão */}
      <CardReminders cards={cartoes.map((c) => ({ id: c.id, bank: c.bank, due: c.due!, used: c.used ?? 0 }))} />

      <div className="grid grid-hero" style={{ marginBottom: 16 }}>
        {/* Hero balance */}
        <div
          style={{
            background: 'linear-gradient(150deg, var(--ink) 0%, color-mix(in oklab, var(--ink) 86%, var(--accent)) 100%)',
            color: 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: 'clamp(24px, 4vw, 36px)',
            minHeight: 200, boxShadow: 'var(--shadow-2)', position: 'relative', overflow: 'hidden',
          }}
        >
          <Eyebrow style={{ color: 'var(--ink-3)' }}>Patrimônio total · BRL</Eyebrow>
          <div className="tnum" style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 700, marginTop: 14, letterSpacing: '-0.03em', lineHeight: 1 }}>
            <AnimatedNumber value={total} />
          </div>
          <div
            style={{
              marginTop: 24, paddingTop: 18, display: 'flex', gap: 24, flexWrap: 'wrap',
              borderTop: '1px solid color-mix(in oklab, var(--bg) 16%, transparent)',
            }}
          >
            <Stat label="Saldo atual em contas" value={brl(saldoEmContas)} />
            <Stat label="Investido" value={brl(profile?.invested ?? 0)} />
            <Stat label="Saldo do mês" value={brl(month.net, { sign: true })} />
          </div>
        </div>

        {/* Income / expense */}
        <div className="grid" style={{ gridAutoRows: '1fr', gap: 16 }}>
          <Card className="card--hover">
            <Eyebrow style={{ color: 'var(--positive)' }}>Saldo atual · contas</Eyebrow>
            <div className="tnum" style={{ fontSize: 'clamp(28px,5vw,34px)', fontWeight: 700, marginTop: 8 }}><AnimatedNumber value={saldoEmContas} /></div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Receita disponível nas suas contas</div>
          </Card>
          <Card className="card--hover">
            <Eyebrow style={{ color: 'var(--negative)' }}>Faturas em aberto</Eyebrow>
            <div className="tnum" style={{ fontSize: 'clamp(28px,5vw,34px)', fontWeight: 700, marginTop: 8 }}><AnimatedNumber value={faturasAbertas} /></div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Despesa a pagar nos cartões</div>
          </Card>
        </div>
      </div>

      <div className="grid grid-split">
        {/* Featured goal */}
        <Card className="card--hover">
          <Eyebrow>Meta destacada</Eyebrow>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{featured?.name ?? 'Crie sua meta'}</div>
          <div style={{ fontSize: 52, fontWeight: 700, color: 'var(--accent)', marginTop: 14, lineHeight: 1 }}>
            {Math.round(goalPct)}%
          </div>
          <div style={{ marginTop: 14 }}>
            <ProgressBar pct={goalPct} />
          </div>
          {featured && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-2)' }}>
              {brl(featured.current)} de {brl(featured.target)}
            </div>
          )}
        </Card>

        {/* Recent transactions */}
        <Card>
          <Eyebrow>Movimentos recentes</Eyebrow>
          <div style={{ marginTop: 10 }}>
            {recent.map((t) => {
              const inc = t.amount > 0;
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '12px 0', borderBottom: '1px solid var(--line-soft)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                      {inc ? (t.subtype || 'Receita') : resolveCategory(t.category, catMap).name} · {t.occurred_on}
                    </div>
                  </div>
                  <div className="tnum" style={{ fontSize: 14, fontWeight: 600, color: inc ? 'var(--positive)' : 'var(--ink)', whiteSpace: 'nowrap' }}>
                    {inc ? '+' : '−'}{brl(Math.abs(t.amount)).replace('−', '')}
                  </div>
                </div>
              );
            })}
            {recent.length === 0 && (
              <div style={{ padding: '24px 0', color: 'var(--ink-3)', fontSize: 13 }}>
                Nenhum movimento ainda. Lance sua primeira receita ou despesa.
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{label}</div>
      <div className="tnum" style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{value}</div>
    </div>
  );
}
