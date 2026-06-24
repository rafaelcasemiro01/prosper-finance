'use client';

import { useState, useTransition } from 'react';
import { deleteTransaction } from '@/lib/actions';
import { brl } from '@/lib/format';
import type { Transaction } from '@/lib/types';
import { buildCategoryMap, resolveCategory, type Category } from '@/lib/categories';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Lista com filtro por mês/ano + exclusão. Recebe transações do servidor.
export function TransactionList({ transactions, customCategories = [] }: { transactions: Transaction[]; customCategories?: Category[] }) {
  const catMap = buildCategoryMap(customCategories);

  // Meses disponíveis a partir dos dados (mais recentes primeiro)
  const monthKeys = Array.from(new Set(transactions.map((t) => t.occurred_on.slice(0, 7)))).sort().reverse();
  const [month, setMonth] = useState<string>('all');

  const filtered = month === 'all' ? transactions : transactions.filter((t) => t.occurred_on.startsWith(month));

  return (
    <div>
      {/* Filtro de mês/ano */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <span className="eyebrow">Filtrar por período</span>
        <select value={month} onChange={(e) => setMonth(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
          <option value="all">Todos os períodos</option>
          {monthKeys.map((k) => {
            const [y, m] = k.split('-');
            return <option key={k} value={k}>{MONTHS[Number(m) - 1]} de {y}</option>;
          })}
        </select>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{filtered.length} movimento{filtered.length === 1 ? '' : 's'}</span>
      </div>

      <Groups transactions={filtered} catMap={catMap} />
    </div>
  );
}

function Groups({ transactions, catMap }: { transactions: Transaction[]; catMap: Record<string, { name: string; color: string }> }) {
  if (transactions.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
        Nenhum movimento neste período.
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
              <Row key={t.id} t={t} last={i === items.length - 1} catMap={catMap} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ t, last, catMap }: { t: Transaction; last: boolean; catMap: Record<string, { name: string; color: string }> }) {
  const [pending, start] = useTransition();
  const inc = t.amount > 0;
  const cat = resolveCategory(t.category, catMap);
  const meta = inc ? (t.subtype || 'Receita') : [cat.name, t.subtype].filter(Boolean).join(' · ');
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
        {inc ? '↓' : (cat.name[0] ?? '·')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
          {meta}{t.due_date && !inc ? ` · vence ${formatShort(t.due_date)}` : ''}
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

function formatShort(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const today = new Date();
  const diff = Math.floor((today.setHours(12, 0, 0, 0) - d.getTime()) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}
