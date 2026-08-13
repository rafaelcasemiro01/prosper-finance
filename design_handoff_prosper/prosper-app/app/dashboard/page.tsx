import { AppShell } from '@/components/AppShell';
import { Card, Eyebrow, ProgressBar } from '@/components/ui';
import { NewTransactionForm } from '@/components/NewTransactionForm';
import { Greeting } from '@/components/Greeting';
import { CardReminders } from '@/components/CardReminders';
import { MonthOverview } from '@/components/MonthOverview';
import {
  getProfile, getGoals, getTransactions, getAccounts, getCustomCategories,
} from '@/lib/queries';
import { brl } from '@/lib/format';
import { buildCategoryMap, resolveCategory } from '@/lib/categories';

// Server Component — reads live, RLS-scoped data from Supabase.
export default async function DashboardPage() {
  const [profile, goals, transactions, accounts, customCategories] = await Promise.all([
    getProfile(),
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

  const cartoes = accounts.filter((a) => a.kind === 'cartao' && a.due);

  return (
    <AppShell active="/dashboard" width="wide">
      <div className="page-head">
        <Greeting name={firstName} />
        <NewTransactionForm customCategories={customCategories} cards={accounts.filter((a) => a.kind === 'cartao')} />
      </div>

      {/* Lembretes de vencimento de cartão */}
      <CardReminders cards={cartoes.map((c) => ({ id: c.id, bank: c.bank, due: c.due!, used: c.used ?? 0, limit: c.credit_limit ?? 0 }))} />

      {/* Visão do mês (um seletor controla os 3 indicadores) */}
      <MonthOverview transactions={transactions} />

      <div className="grid grid-split">
        {/* Featured goal */}
        <Card className="card--hover dash-tile">
          <Eyebrow>Meta destacada</Eyebrow>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{featured?.name ?? 'Crie sua meta'}</div>
          <div style={{ fontSize: 'clamp(40px,9vw,52px)', fontWeight: 700, color: 'var(--accent)', marginTop: 12, lineHeight: 1 }}>
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
