import { Sidebar } from '@/components/Sidebar';
import { Card, Eyebrow, ProgressBar } from '@/components/ui';
import { DonutChart, BarChart } from '@/components/Charts';
import { getMonthSummary, getCategoryBreakdown, getSixMonthSeries } from '@/lib/queries';
import { brl } from '@/lib/format';
import { CATEGORIES } from '@/lib/types';

// Server Component — derived analytics from SQL functions + transactions.
export default async function AnalyticsPage() {
  const [month, breakdown, series] = await Promise.all([
    getMonthSummary(),
    getCategoryBreakdown(),
    getSixMonthSeries(),
  ]);

  const totalSpend = breakdown.reduce((a, b) => a + b.amount, 0);
  const savingsRate = month.income > 0 ? (month.net / month.income) * 100 : 0;

  return (
    <div style={{ display: 'flex', background: 'var(--bg)', minHeight: '100vh' }}>
      <Sidebar active="/analytics" />

      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1200 }}>
        <Eyebrow>Visão geral</Eyebrow>
        <h1 style={{ fontSize: 44, margin: '6px 0 28px', fontWeight: 700, letterSpacing: '-0.02em' }}>Análises</h1>

        {/* Hero: net + bar chart */}
        <Card pad={32} style={{ marginBottom: 16 }}>
          <Eyebrow>Saldo do mês</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
            <div>
              <div className="tnum" style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.03em', color: month.net >= 0 ? 'var(--ink)' : 'var(--negative)' }}>
                {brl(month.net, { sign: true })}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
                {savingsRate.toFixed(1).replace('.', ',')}% de taxa de poupança
              </div>
            </div>
            <div style={{ flex: '1 1 320px', maxWidth: 520 }}>
              <BarChart income={series.income} expense={series.expense} labels={series.labels} />
            </div>
          </div>
        </Card>

        {/* Donut + category list */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
          <Card pad={28}>
            <Eyebrow>Por categoria · mês</Eyebrow>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
              {breakdown.length > 0 ? (
                <DonutChart data={breakdown} />
              ) : (
                <div style={{ padding: '60px 0', color: 'var(--ink-3)', fontSize: 14 }}>Sem despesas neste mês.</div>
              )}
            </div>
          </Card>

          <Card pad={28}>
            <Eyebrow>Detalhe</Eyebrow>
            <div style={{ marginTop: 12 }}>
              {breakdown.map((c, i) => {
                const pct = totalSpend ? (c.amount / totalSpend) * 100 : 0;
                const color = CATEGORIES[c.category]?.color ?? 'var(--ink-3)';
                return (
                  <div key={c.category} style={{ padding: '14px 0', borderBottom: i < breakdown.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{CATEGORIES[c.category]?.name ?? c.category}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="tnum" style={{ fontSize: 13, fontWeight: 600 }}>{brl(c.amount)}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{pct.toFixed(1).replace('.', ',')}%</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <ProgressBar pct={pct} height={3} color={color} />
                    </div>
                  </div>
                );
              })}
              {breakdown.length === 0 && (
                <div style={{ padding: '24px 0', color: 'var(--ink-3)', fontSize: 13 }}>Lance despesas para ver o detalhamento.</div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
