'use client';

import { useMemo, useState } from 'react';
import { Eyebrow } from '@/components/ui';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { brl } from '@/lib/format';
import type { Transaction } from '@/lib/types';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Visão do mês: um único seletor controla os três indicadores.
// Cada valor considera SOMENTE o mês selecionado (sem acumular meses
// anteriores nem futuros), permitindo planejar mês a mês.
export function MonthOverview({ transactions }: { transactions: Transaction[] }) {
  // Meses com lançamentos + mês atual, em ordem.
  const months = useMemo(() => {
    const set = new Set<string>(transactions.map((t) => t.occurred_on.slice(0, 7)));
    set.add(currentMonthKey());
    return Array.from(set).sort();
  }, [transactions]);

  // Default: mês atual (fallback para o último disponível).
  const [sel, setSel] = useState(() => {
    const cur = currentMonthKey();
    return months.includes(cur) ? cur : months[months.length - 1];
  });
  const idx = months.indexOf(sel);

  const ofMonth = transactions.filter((t) => t.occurred_on.startsWith(sel));
  const income = ofMonth.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = ofMonth.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = income - expense;

  // Saldo já realizado: entradas menos as despesas efetivamente pagas.
  const paidExpense = ofMonth.filter((t) => t.amount < 0 && t.paid).reduce((s, t) => s + Math.abs(t.amount), 0);
  const realized = income - paidExpense;

  // Em aberto: despesas do mês ainda não pagas.
  const pending = ofMonth.filter((t) => t.amount < 0 && !t.paid).reduce((s, t) => s + Math.abs(t.amount), 0);
  const pendingCount = ofMonth.filter((t) => t.amount < 0 && !t.paid).length;

  const [y, m] = sel.split('-').map(Number);
  const isCurrent = sel === currentMonthKey();

  function step(d: number) {
    const ni = idx + d;
    if (ni >= 0 && ni < months.length) setSel(months[ni]);
  }

  return (
    <section style={{ marginBottom: 16 }}>
      {/* Barra de período — controla os 3 cards abaixo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            {MONTHS_FULL[m - 1]} <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>{y}</span>
          </h2>
          {isCurrent && (
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: 999, padding: '3px 9px' }}>
              Mês atual
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isCurrent && (
            <button onClick={() => setSel(currentMonthKey())}
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'transparent', border: 'none', padding: '6px 4px' }}>
              Voltar ao mês atual
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '3px 4px' }}>
            <button onClick={() => step(-1)} disabled={idx <= 0} aria-label="Mês anterior"
              style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--ink-2)', fontSize: 16, opacity: idx <= 0 ? 0.3 : 1 }}>‹</button>
            <select value={sel} onChange={(e) => setSel(e.target.value)} aria-label="Selecionar mês"
              style={{ border: 'none', background: 'transparent', color: 'var(--ink)', fontSize: 12.5, fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0 4px' }}>
              {months.map((k) => {
                const [yy, mm] = k.split('-').map(Number);
                return <option key={k} value={k}>{MONTHS[mm - 1]} {yy}</option>;
              })}
            </select>
            <button onClick={() => step(1)} disabled={idx >= months.length - 1} aria-label="Próximo mês"
              style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--ink-2)', fontSize: 16, opacity: idx >= months.length - 1 ? 0.3 : 1 }}>›</button>
          </div>
        </div>
      </div>

      <div className="grid grid-hero">
        {/* Card principal do mês */}
        <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'clamp(22px, 4vw, 34px)', background: 'var(--surface)', backdropFilter: 'none', WebkitBackdropFilter: 'none', display: 'flex', flexDirection: 'column' }}>
          <Eyebrow>Saldo do mês · BRL</Eyebrow>
          <div className="tnum" style={{ fontSize: 'clamp(36px, 7vw, 58px)', fontWeight: 700, marginTop: 12, letterSpacing: '-0.03em', lineHeight: 1, color: net < 0 ? 'var(--negative)' : 'var(--ink)' }}>
            <AnimatedNumber value={net} signed />
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
            Somente os lançamentos de {MONTHS_FULL[m - 1]}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', gap: 22, flexWrap: 'wrap', borderTop: '1px solid var(--line)' }}>
            <Stat label="Entradas" value={brl(income)} color="var(--positive)" />
            <Stat label="Saídas" value={brl(expense)} color="var(--negative)" />
            <Stat label="Movimentos" value={String(ofMonth.length)} />
          </div>
        </div>

        {/* Indicadores do mês */}
        <div className="grid" style={{ gridAutoRows: '1fr', gap: 16 }}>
          <div className="card card--hover dash-tile">
            <Eyebrow style={{ color: 'var(--positive)' }}>Saldo realizado</Eyebrow>
            <div className="tnum" style={{ fontSize: 'clamp(26px,5vw,32px)', fontWeight: 700, marginTop: 8, color: realized < 0 ? 'var(--negative)' : 'var(--ink)' }}>
              <AnimatedNumber value={realized} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Entradas menos o que já foi pago</div>
          </div>
          <div className="card card--hover dash-tile">
            <Eyebrow style={{ color: 'var(--negative)' }}>Em aberto no mês</Eyebrow>
            <div className="tnum" style={{ fontSize: 'clamp(26px,5vw,32px)', fontWeight: 700, marginTop: 8 }}>
              <AnimatedNumber value={pending} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
              {pendingCount === 0 ? 'Tudo pago neste mês 🎉' : `${pendingCount} despesa${pendingCount > 1 ? 's' : ''} a pagar`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>{label}</div>
      <div className="tnum" style={{ fontSize: 15, fontWeight: 700, marginTop: 3, color: color ?? 'var(--ink)' }}>{value}</div>
    </div>
  );
}
