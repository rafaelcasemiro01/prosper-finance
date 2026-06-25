import { AppShell } from '@/components/AppShell';
import { Card, Eyebrow, ProgressBar } from '@/components/ui';
import { DonutChart, BarChart } from '@/components/Charts';
import { getMonthSummary, getCategoryBreakdown, getSixMonthSeries, getPaymentBreakdown } from '@/lib/queries';
import { brl } from '@/lib/format';
import { CATEGORIES } from '@/lib/types';
import { paymentLabel, PAYMENT_COLORS } from '@/lib/payments';

// Server Component — derived analytics from SQL functions + transactions.
export default async function AnalyticsPage() {
  const [month, breakdown, series, payments] = await Promise.all([
    getMonthSummary(),
    getCategoryBreakdown(),
    getSixMonthSeries(),
    getPaymentBreakdown(),
  ]);

  const totalSpend = breakdown.reduce((a, b) => a + b.amount, 0);
  const totalPay = payments.reduce((a, b) => a + b.amount, 0);
  const savingsRate = month.income > 0 ? (month.net / month.income) * 100 : 0;

  return (
    <AppShell active="/analytics" width="wide">
      <Eyebrow>Visão geral</Eyebrow>
      <h1 className="h-page" style={{ margin: '6px 0 24px' }}>Análises</h1>

      {/* Hero: net + bar chart */}
      <Card pad="clamp(20px,4vw,32px)" style={{ marginBottom: 16 }}>
        <Eyebrow>Saldo do mês</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
          <div>
            <div className="tnum" style={{ fontSize: 'clamp(40px,8vw,64px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: month.net >= 0 ? 'var(--ink)' : 'var(--negative)' }}>
              {brl(month.net, { sign: true })}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
              {savingsRate.toFixed(1).replace('.', ',')}% de taxa de poupança
            </div>
          </div>
          <div style={{ flex: '1 1 320px', maxWidth: 520, width: '100%' }}>
            <BarChart income={series.income} expense={series.expense} labels={series.labels} />
          </div>
        </div>
      </Card>

      {/* Donut + category list */}
      <div className="grid grid-split">
        <Card pad="clamp(20px,4vw,28px)">
          <Eyebrow>Por categoria · mês</Eyebrow>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            {breakdown.length > 0 ? (
              <DonutChart data={breakdown} />
            ) : (
              <div style={{ padding: '60px 0', color: 'var(--ink-3)', fontSize: 14 }}>Sem despesas neste mês.</div>
            )}
          </div>
        </Card>

        <Card pad="clamp(20px,4vw,28px)">
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

      {/* Comparativo por forma de pagamento */}
      <Card pad="clamp(20px,4vw,28px)" style={{ marginTop: 16 }}>
        <Eyebrow>Por forma de pagamento · mês</Eyebrow>
        {payments.length > 0 ? (
          <>
            <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', marginTop: 16, marginBottom: 18, background: 'var(--surface-2)' }}>
              {payments.map((p) => (
                <div key={p.method} title={paymentLabel(p.method)}
                  style={{ width: `${(p.amount / totalPay) * 100}%`, background: PAYMENT_COLORS[p.method] ?? 'var(--ink-4)' }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {payments.map((p) => {
                const pct = totalPay ? (p.amount / totalPay) * 100 : 0;
                const color = PAYMENT_COLORS[p.method] ?? 'var(--ink-4)';
                return (
                  <div key={p.method} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{paymentLabel(p.method)}</div>
                      <div className="tnum" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{brl(p.amount)} · {pct.toFixed(0)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ padding: '24px 0', color: 'var(--ink-3)', fontSize: 13 }}>
            Informe a forma de pagamento ao lançar despesas para comparar débito, pix, dinheiro e crédito.
          </div>
        )}
      </Card>
    </AppShell>
  );
}
