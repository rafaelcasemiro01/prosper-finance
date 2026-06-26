'use client';

import { useMemo, useState } from 'react';
import { Eyebrow } from '@/components/ui';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { brl } from '@/lib/format';
import type { Transaction } from '@/lib/types';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Card de Patrimônio total com filtro de mês.
// O patrimônio é projetado ACUMULANDO todos os lançamentos até o fim do mês
// escolhido — útil para quem lança contas futuras e quer estimativa anual.
export function BalanceHero({
  openingBalance, invested, transactions,
}: { openingBalance: number; invested: number; transactions: Transaction[] }) {
  // Meses disponíveis (dos lançamentos) + mês atual, ordenados.
  const months = useMemo(() => {
    const set = new Set<string>(transactions.map((t) => t.occurred_on.slice(0, 7)));
    const now = new Date();
    set.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    return Array.from(set).sort();
  }, [transactions]);

  // Default: último mês com dados (mostra a projeção completa).
  const [sel, setSel] = useState(() => months[months.length - 1]);
  const idx = months.indexOf(sel);

  const endOfSel = `${sel}-31`;
  const cumulative = openingBalance + transactions
    .filter((t) => t.occurred_on <= endOfSel)
    .reduce((s, t) => s + t.amount, 0);
  const monthIncome = transactions.filter((t) => t.amount > 0 && t.occurred_on.startsWith(sel)).reduce((s, t) => s + t.amount, 0);
  const monthExpense = transactions.filter((t) => t.amount < 0 && t.occurred_on.startsWith(sel)).reduce((s, t) => s + Math.abs(t.amount), 0);
  const monthNet = monthIncome - monthExpense;

  const [y, m] = sel.split('-').map(Number);
  const label = `${MONTHS[m - 1]} ${y}`;

  function step(d: number) {
    const ni = idx + d;
    if (ni >= 0 && ni < months.length) setSel(months[ni]);
  }

  return (
    <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'clamp(24px, 4vw, 36px)', minHeight: 200, position: 'relative', overflow: 'hidden', background: 'var(--surface)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Eyebrow>Patrimônio total · BRL</Eyebrow>
        {/* Seletor de mês */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '3px 4px' }}>
          <button onClick={() => step(-1)} disabled={idx <= 0} aria-label="Mês anterior"
            style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--ink-2)', fontSize: 15, opacity: idx <= 0 ? 0.35 : 1 }}>‹</button>
          <span style={{ fontSize: 12, fontWeight: 600, minWidth: 64, textAlign: 'center' }}>{label}</span>
          <button onClick={() => step(1)} disabled={idx >= months.length - 1} aria-label="Próximo mês"
            style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--ink-2)', fontSize: 15, opacity: idx >= months.length - 1 ? 0.35 : 1 }}>›</button>
        </div>
      </div>

      <div className="tnum" style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 700, marginTop: 14, letterSpacing: '-0.03em', lineHeight: 1, color: cumulative < 0 ? 'var(--negative)' : 'var(--ink)' }}>
        <AnimatedNumber value={cumulative} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
        Projeção acumulada até {label}
      </div>

      <div style={{ marginTop: 22, paddingTop: 18, display: 'flex', gap: 24, flexWrap: 'wrap', borderTop: '1px solid var(--line)' }}>
        <Stat label="Investido" value={brl(invested)} />
        <Stat label="Entradas do mês" value={brl(monthIncome)} />
        <Stat label="Saldo do mês" value={brl(monthNet, { sign: true })} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>{label}</div>
      <div className="tnum" style={{ fontSize: 15, fontWeight: 700, marginTop: 3, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}
