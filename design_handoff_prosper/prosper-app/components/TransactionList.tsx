'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { deleteTransaction, updateTransaction, addCategory } from '@/lib/actions';
import { brl, parseBRL } from '@/lib/format';
import type { Transaction } from '@/lib/types';
import {
  buildCategoryMap, resolveCategory, slugify, CATEGORY_COLORS,
  DEFAULT_EXPENSE_TYPES, DEFAULT_INCOME_TYPES, type Category,
} from '@/lib/categories';
import { Button, Eyebrow } from '@/components/ui';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const EXPENSE_CATS = ['food', 'home', 'transport', 'leisure', 'health', 'edu'];

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

      <Groups transactions={filtered} catMap={catMap} customCategories={customCategories} />
    </div>
  );
}

function Groups({ transactions, catMap, customCategories }: { transactions: Transaction[]; catMap: Record<string, { name: string; color: string }>; customCategories: Category[] }) {
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
              <Row key={t.id} t={t} last={i === items.length - 1} catMap={catMap} customCategories={customCategories} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ t, last, catMap, customCategories }: { t: Transaction; last: boolean; catMap: Record<string, { name: string; color: string }>; customCategories: Category[] }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
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
      <button onClick={() => setEditing(true)} aria-label="Editar" title="Editar"
        style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-2)', width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M13.5 6.5l3 3"/></svg>
      </button>
      <button
        onClick={() => start(async () => { await deleteTransaction(t.id); })}
        aria-label="Excluir"
        style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 16, padding: 6 }}
      >
        ✕
      </button>
      {editing && <EditTransactionModal t={t} customCategories={customCategories} onClose={() => setEditing(false)} />}
    </div>
  );
}

// ── Modal de edição de movimento ─────────────────────────────────────────
function EditTransactionModal({ t, customCategories, onClose }: { t: Transaction; customCategories: Category[]; onClose: () => void }) {
  const [type, setType] = useState<'expense' | 'income'>(t.amount > 0 ? 'income' : 'expense');
  const [amount, setAmount] = useState(String(Math.abs(t.amount)).replace('.', ','));
  const [name, setName] = useState(t.name);
  const [category, setCategory] = useState(t.category && t.category !== 'income' ? t.category : 'food');
  const [occurredOn, setOccurredOn] = useState(t.occurred_on);
  const [dueDate, setDueDate] = useState(t.due_date ?? '');
  const [subtype, setSubtype] = useState(t.subtype ?? '');
  const [pending, start] = useTransition();

  const [localCats, setLocalCats] = useState<Category[]>(customCategories);
  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);
  const catMap = buildCategoryMap(localCats);
  const expenseCatSlugs = [...EXPENSE_CATS, ...localCats.map((c) => c.slug)];
  const typeOptions = type === 'expense' ? DEFAULT_EXPENSE_TYPES : DEFAULT_INCOME_TYPES;

  const num = parseBRL(amount);
  const canSave = num > 0 && name.trim().length > 0;

  function commitNewCategory() {
    const nm = newCatName.trim();
    if (!nm) return;
    const slug = slugify(nm);
    setLocalCats((prev) => prev.some((c) => c.slug === slug) ? prev : [...prev, { slug, name: nm, color: newCatColor }]);
    setCategory(slug);
    setCreatingCat(false);
    setNewCatName('');
    start(async () => { await addCategory({ name: nm, slug, color: newCatColor }); });
  }

  function save() {
    if (!canSave) return;
    const signed = type === 'income' ? num : -num;
    start(async () => {
      await updateTransaction(t.id, {
        amount: signed, name: name.trim(), category,
        occurred_on: occurredOn || undefined,
        due_date: type === 'expense' ? (dueDate || null) : null,
        subtype: subtype.trim() || null,
      });
      onClose();
    });
  }

  return (
    <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,14,22,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-2)', padding: 28, width: 480, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Editar movimento</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'inline-flex', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: 4, marginBottom: 20 }}>
          {(['expense', 'income'] as const).map((tp) => (
            <button key={tp} onClick={() => { setType(tp); setSubtype(''); }}
              style={{ padding: '8px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600, border: 'none',
                background: type === tp ? 'var(--ink)' : 'transparent', color: type === tp ? 'var(--bg)' : 'var(--ink-2)' }}>
              {tp === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>

        <Eyebrow style={{ marginBottom: 8 }}>Valor</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 16 }}>
          <span style={{ color: 'var(--ink-3)', fontSize: 18 }}>R$</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00"
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 22, fontWeight: 700, color: type === 'income' ? 'var(--positive)' : 'var(--ink)' }} />
        </div>

        {type === 'expense' && (
          <>
            <Eyebrow style={{ marginBottom: 8 }}>Categoria</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: creatingCat ? 12 : 16 }}>
              {expenseCatSlugs.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: category === c ? 'var(--ink)' : 'var(--surface-2)', color: category === c ? 'var(--bg)' : 'var(--ink-2)',
                    border: `1px solid ${category === c ? 'var(--ink)' : 'var(--line)'}` }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: catMap[c]?.color ?? '#888', flexShrink: 0 }} />
                  {catMap[c]?.name ?? c}
                </button>
              ))}
              <button onClick={() => setCreatingCat((v) => !v)}
                style={{ padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: 'transparent', color: 'var(--accent)', border: '1px dashed var(--accent)' }}>
                + Nova
              </button>
            </div>
            {creatingCat && (
              <div style={{ padding: 14, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 16 }}>
                <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nome da categoria" autoFocus
                  style={{ width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)', marginBottom: 10 }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {CATEGORY_COLORS.map((col) => (
                    <button key={col} onClick={() => setNewCatColor(col)} aria-label={col}
                      style={{ width: 24, height: 24, borderRadius: '50%', background: col, border: newCatColor === col ? '2px solid var(--ink)' : '2px solid transparent', boxShadow: '0 0 0 1px var(--line)' }} />
                  ))}
                  <button onClick={commitNewCategory} disabled={!newCatName.trim()}
                    style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', opacity: newCatName.trim() ? 1 : 0.5 }}>
                    Criar
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <Eyebrow style={{ marginBottom: 8 }}>{type === 'expense' ? 'Tipo de despesa' : 'Tipo de receita'}</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {typeOptions.map((opt) => (
            <button key={opt} onClick={() => setSubtype(opt)}
              style={{ padding: '7px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                background: subtype === opt ? 'var(--accent-soft)' : 'var(--surface-2)',
                color: subtype === opt ? 'var(--ink)' : 'var(--ink-2)',
                border: `1px solid ${subtype === opt ? 'var(--accent)' : 'var(--line)'}` }}>
              {opt}
            </button>
          ))}
        </div>
        <input value={subtype} onChange={(e) => setSubtype(e.target.value)} placeholder="Ou crie um tipo..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 13, color: 'var(--ink)', marginBottom: 16 }} />

        <div style={{ display: 'grid', gridTemplateColumns: type === 'expense' ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <Eyebrow style={{ marginBottom: 8 }}>{type === 'expense' ? 'Data da despesa' : 'Data de entrada'}</Eyebrow>
            <input type="date" value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 13, color: 'var(--ink)' }} />
          </div>
          {type === 'expense' && (
            <div>
              <Eyebrow style={{ marginBottom: 8 }}>Vencimento</Eyebrow>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 13, color: 'var(--ink)' }} />
            </div>
          )}
        </div>

        <Eyebrow style={{ marginBottom: 8 }}>Descrição</Eyebrow>
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 22 }}>
          <input value={name} onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => start(async () => { await deleteTransaction(t.id); onClose(); })} style={{ color: 'var(--negative)', borderColor: 'var(--negative)' }}>Excluir</Button>
          <Button full onClick={save} style={{ opacity: canSave && !pending ? 1 : 0.45 }}>
            {pending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
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
