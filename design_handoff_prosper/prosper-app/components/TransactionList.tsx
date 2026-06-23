'use client';

import { useTransition } from 'react';
import { deleteTransaction } from '@/lib/actions';
import { brl } from '@/lib/format';
import { CATEGORIES, type Transaction } from '@/lib/types';

// Client list with delete. Receives server-fetched transactions as props.
export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
        Nenhum movimento ainda. Lance sua primeira receita ou despesa.
      </div>
    );
  }

  // Group by date (YYYY-MM-DD)
  const groups: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    (groups[t.occurred_on] ??= []).push(t);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {Object.entries(groups).map(([date, items]) => (
        <div key={date}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{formatDate(date)}</div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '2px 18px', boxShadow: 'var(--shadow-1)' }}>
            {items.map((t, i) => (
              <Row key={t.id} t={t} last={i === items.length - 1} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ t, last }: { t: Transaction; last: boolean }) {
  const [pending, start] = useTransition();
  const inc = t.amount > 0;
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
        borderBottom: last ? 'none' : '1px solid var(--line-soft)',
        opacity: pending ? 0.4 : 1,
      }}
    >
      <div
        style={{
          width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
          background: inc ? 'var(--accent-soft)' : 'var(--surface-2)',
          border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: inc ? 'var(--accent)' : 'var(--ink-2)', fontWeight: 700, fontSize: 16,
        }}
      >
        {inc ? '↓' : (CATEGORIES[t.category]?.name?.[0] ?? '·')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
          {inc ? 'Receita' : CATEGORIES[t.category]?.name ?? t.category}
        </div>
      </div>
      <div className="tnum" style={{ fontSize: 14, fontWeight: 600, color: inc ? 'var(--positive)' : 'var(--ink)' }}>
        {inc ? '+' : '−'}{brl(Math.abs(t.amount)).replace('−', '')}
      </div>
      <button
        onClick={() => start(async () => { await deleteTransaction(t.id); })}
        aria-label="Excluir"
        style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 16, padding: 6 }}
      >
        ✕
      </button>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const today = new Date();
  const diff = Math.floor((today.setHours(12, 0, 0, 0) - d.getTime()) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}
