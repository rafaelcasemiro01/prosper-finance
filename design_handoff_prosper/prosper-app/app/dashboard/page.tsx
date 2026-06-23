import { Sidebar } from '@/components/Sidebar';
import { Card, Eyebrow, ProgressBar } from '@/components/ui';
import {
  getProfile, getBalanceTotal, getMonthSummary, getGoals, getTransactions,
} from '@/lib/queries';
import { brl } from '@/lib/format';
import { CATEGORIES } from '@/lib/types';

// Server Component — reads live, RLS-scoped data from Supabase.
export default async function DashboardPage() {
  const [profile, total, month, goals, transactions] = await Promise.all([
    getProfile(),
    getBalanceTotal(),
    getMonthSummary(),
    getGoals(),
    getTransactions(),
  ]);

  const featured = goals[0];
  const goalPct = featured ? (featured.current / featured.target) * 100 : 0;
  const recent = transactions.slice(0, 6);
  const available = total - (profile?.invested ?? 0);
  const firstName = (profile?.full_name || 'você').split(' ')[0];

  return (
    <div style={{ display: 'flex', background: 'var(--bg)', minHeight: '100vh' }}>
      <Sidebar active="/dashboard" />

      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1400 }}>
        <Eyebrow>Boa noite</Eyebrow>
        <h1 style={{ fontSize: 44, margin: '6px 0 32px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Olá, {firstName}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Hero balance */}
          <div
            style={{
              background: 'linear-gradient(150deg, var(--ink) 0%, color-mix(in oklab, var(--ink) 86%, var(--accent)) 100%)',
              color: 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: 36,
              minHeight: 220, boxShadow: 'var(--shadow-2)', position: 'relative', overflow: 'hidden',
            }}
          >
            <Eyebrow style={{ color: 'var(--ink-3)' }}>Patrimônio total · BRL</Eyebrow>
            <div className="tnum" style={{ fontSize: 64, fontWeight: 700, marginTop: 16, letterSpacing: '-0.03em' }}>
              {brl(total)}
            </div>
            <div
              style={{
                marginTop: 28, paddingTop: 18, display: 'flex', gap: 28,
                borderTop: '1px solid color-mix(in oklab, var(--bg) 16%, transparent)',
              }}
            >
              <Stat label="Disponível" value={brl(available)} />
              <Stat label="Investido" value={brl(profile?.invested ?? 0)} />
              <Stat label="Saldo do mês" value={brl(month.net, { sign: true })} />
            </div>
          </div>

          {/* Income / expense */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card style={{ flex: 1 }}>
              <Eyebrow style={{ color: 'var(--positive)' }}>Receitas · mês</Eyebrow>
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 8 }}>{brl(month.income)}</div>
            </Card>
            <Card style={{ flex: 1 }}>
              <Eyebrow style={{ color: 'var(--negative)' }}>Despesas · mês</Eyebrow>
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 8 }}>{brl(month.expense)}</div>
            </Card>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
          {/* Featured goal */}
          <Card>
            <Eyebrow>Meta destacada</Eyebrow>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{featured?.name ?? 'Crie sua meta'}</div>
            <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--accent)', marginTop: 16 }}>
              {Math.round(goalPct)}%
            </div>
            <div style={{ marginTop: 12 }}>
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
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 0', borderBottom: '1px solid var(--line-soft)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        {CATEGORIES[t.category]?.name ?? t.category} · {t.occurred_on}
                      </div>
                    </div>
                    <div className="tnum" style={{ fontSize: 14, fontWeight: 600, color: inc ? 'var(--positive)' : 'var(--ink)' }}>
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
      </main>
    </div>
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
