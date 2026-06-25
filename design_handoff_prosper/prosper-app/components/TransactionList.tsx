'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { deleteTransaction, updateTransaction, addCategory, setTransactionPaid } from '@/lib/actions';
import { brl, parseBRL } from '@/lib/format';
import type { Transaction, Account } from '@/lib/types';
import { resolveBank } from '@/lib/banks';
import { PAYMENT_METHODS } from '@/lib/payments';
import {
  buildCategoryMap, resolveCategory, slugify, CATEGORY_COLORS,
  DEFAULT_EXPENSE_TYPES, DEFAULT_INCOME_TYPES, type Category,
} from '@/lib/categories';
import { Button, Eyebrow } from '@/components/ui';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const EXPENSE_CATS = ['food', 'home', 'transport', 'leisure', 'health', 'edu'];

// Lista com filtro por mês/ano + exclusão. Recebe transações do servidor.
export function TransactionList({ transactions, customCategories = [], cards = [] }: { transactions: Transaction[]; customCategories?: Category[]; cards?: Account[] }) {
  const catMap = buildCategoryMap(customCategories);

  // Meses disponíveis a partir dos dados (mais recentes primeiro)
  const monthKeys = Array.from(new Set(transactions.map((t) => t.occurred_on.slice(0, 7)))).sort().reverse();
  const [month, setMonth] = useState<string>('all');
  const [kind, setKind] = useState<'all' | 'income' | 'expense'>('all');
  const [cat, setCat] = useState<string>('all');
  const [status, setStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [query, setQuery] = useState('');

  // Categorias presentes nas despesas (para o seletor)
  const usedCats = Array.from(new Set(transactions.filter((t) => t.amount < 0).map((t) => t.category)));

  const q = query.trim().toLowerCase();
  const filtered = transactions.filter((t) => {
    if (month !== 'all' && !t.occurred_on.startsWith(month)) return false;
    if (kind === 'income' && t.amount <= 0) return false;
    if (kind === 'expense' && t.amount >= 0) return false;
    if (cat !== 'all' && t.category !== cat) return false;
    if (status === 'paid' && !t.paid) return false;
    if (status === 'pending' && (t.paid || t.amount > 0)) return false;
    if (q) {
      const hay = `${t.name} ${t.subtype ?? ''} ${resolveCategory(t.category, catMap).name}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const totalIn = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const hasActiveFilter = month !== 'all' || kind !== 'all' || cat !== 'all' || status !== 'all' || !!q;

  const selStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' };

  return (
    <div>
      {/* Busca */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line)', marginBottom: 12 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, tipo ou categoria..."
          style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }} />
        {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 16 }}>✕</button>}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <select value={month} onChange={(e) => setMonth(e.target.value)} style={selStyle} aria-label="Período">
          <option value="all">Todos os períodos</option>
          {monthKeys.map((k) => {
            const [y, m] = k.split('-');
            return <option key={k} value={k}>{MONTHS[Number(m) - 1]} de {y}</option>;
          })}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={selStyle} aria-label="Tipo">
          <option value="all">Receitas e despesas</option>
          <option value="income">Só receitas</option>
          <option value="expense">Só despesas</option>
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={selStyle} aria-label="Categoria">
          <option value="all">Todas as categorias</option>
          {usedCats.map((c) => <option key={c} value={c}>{resolveCategory(c, catMap).name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={selStyle} aria-label="Status">
          <option value="all">Pagos e pendentes</option>
          <option value="pending">Só pendentes</option>
          <option value="paid">Só pagos</option>
        </select>
        {hasActiveFilter && (
          <button onClick={() => { setMonth('all'); setKind('all'); setCat('all'); setStatus('all'); setQuery(''); }}
            style={{ padding: '8px 14px', borderRadius: 999, background: 'transparent', border: '1px solid var(--line)', color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>
            Limpar filtros
          </button>
        )}
      </div>

      {/* Resumo do resultado filtrado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 18, fontSize: 12, color: 'var(--ink-3)' }}>
        <span>{filtered.length} movimento{filtered.length === 1 ? '' : 's'}</span>
        {totalIn > 0 && <span style={{ color: 'var(--positive)', fontWeight: 600 }}>+{brl(totalIn)}</span>}
        {totalOut > 0 && <span style={{ color: 'var(--negative)', fontWeight: 600 }}>−{brl(totalOut)}</span>}
      </div>

      <Groups transactions={filtered} catMap={catMap} customCategories={customCategories} cards={cards} />
    </div>
  );
}

function Groups({ transactions, catMap, customCategories, cards }: { transactions: Transaction[]; catMap: Record<string, { name: string; color: string }>; customCategories: Category[]; cards: Account[] }) {
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
              <Row key={t.id} t={t} last={i === items.length - 1} catMap={catMap} customCategories={customCategories} cards={cards} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ t, last, catMap, customCategories, cards }: { t: Transaction; last: boolean; catMap: Record<string, { name: string; color: string }>; customCategories: Category[]; cards: Account[] }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const inc = t.amount > 0;
  const cat = resolveCategory(t.category, catMap);
  const isPaid = !!t.paid;
  const meta = inc ? (t.subtype || 'Receita') : [cat.name, t.subtype].filter(Boolean).join(' · ');
  return (
    <div className="tx-row" style={{ borderBottom: last ? 'none' : undefined, opacity: pending ? 0.4 : 1 }}>
      <div
        className="tx-avatar"
        style={{
          width: 42, height: 42, borderRadius: '50%',
          background: inc ? 'var(--accent-soft)' : 'var(--surface-2)',
          border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: inc ? 'var(--accent)' : 'var(--ink-2)', fontWeight: 700, fontSize: 16,
        }}
      >
        {inc ? '↓' : (cat.name[0] ?? '·')}
      </div>
      <div className="tx-info">
        <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
          {meta}{t.due_date && !inc ? ` · vence ${formatShort(t.due_date)}` : ''}{isPaid && !inc ? ' · pago' : ''}
        </div>
      </div>
      <div className="tx-amount tnum" style={{ fontSize: 15, fontWeight: 700, color: inc ? 'var(--positive)' : 'var(--ink)' }}>
        {inc ? '+' : '−'}{brl(Math.abs(t.amount)).replace('−', '')}
      </div>
      <div className="tx-actions">
        {!inc && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => { if (isPaid) { start(async () => { await setTransactionPaid(t.id, false); }); } else { setPayOpen((v) => !v); } }} title={isPaid ? 'Pago' : 'Marcar como pago'} aria-label="Marcar como pago"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: isPaid ? 'color-mix(in oklab, var(--positive) 16%, transparent)' : 'var(--surface-2)',
                color: isPaid ? 'var(--positive)' : 'var(--ink-3)', border: `1px solid ${isPaid ? 'var(--positive)' : 'var(--line)'}` }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${isPaid ? 'var(--positive)' : 'var(--ink-4)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {isPaid && <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>}
              </span>
              {isPaid ? 'Pago' : 'Pagar'}
            </button>
            {payOpen && !isPaid && (
              <>
                <div onClick={() => setPayOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
                <div className="anim-pop" style={{ position: 'absolute', top: '110%', right: 0, zIndex: 31, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow-2)', padding: 6, width: 150 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', padding: '4px 8px 6px' }}>Pagar com</div>
                  {PAYMENT_METHODS.map((p) => (
                    <button key={p.id} onClick={() => { setPayOpen(false); start(async () => { await setTransactionPaid(t.id, true, p.id); }); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 8px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--ink)', background: 'transparent', border: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
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
      </div>
      {editing && <EditTransactionModal t={t} customCategories={customCategories} cards={cards} onClose={() => setEditing(false)} />}
    </div>
  );
}

// ── Modal de edição de movimento ─────────────────────────────────────────
function EditTransactionModal({ t, customCategories, cards, onClose }: { t: Transaction; customCategories: Category[]; cards: Account[]; onClose: () => void }) {
  const [type, setType] = useState<'expense' | 'income'>(t.amount > 0 ? 'income' : 'expense');
  const [amount, setAmount] = useState(String(Math.abs(t.amount)).replace('.', ','));
  const [name, setName] = useState(t.name);
  const [category, setCategory] = useState(t.category && t.category !== 'income' ? t.category : 'food');
  const [occurredOn, setOccurredOn] = useState(t.occurred_on);
  const [dueDate, setDueDate] = useState(t.due_date ?? '');
  const [hasDue, setHasDue] = useState(!!t.due_date);
  const [subtype, setSubtype] = useState(t.subtype ?? '');
  const [accountId, setAccountId] = useState<string>(t.account_id ?? '');
  const [paid, setPaid] = useState<boolean>(!!t.paid);
  const [payMethod, setPayMethod] = useState<string>(t.payment_method ?? '');
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
        due_date: type === 'expense' && hasDue ? (dueDate || null) : null,
        subtype: subtype.trim() || null,
        account_id: type === 'expense' ? (accountId || null) : null,
        paid: type === 'expense' ? paid : false,
        payment_method: type === 'expense' ? (payMethod || null) : null,
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

        {/* Cartão vinculado + pago (só despesa) */}
        {type === 'expense' && (
          <div style={{ marginBottom: 16 }}>
            <Eyebrow style={{ marginBottom: 8 }}>Forma de pagamento</Eyebrow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PAYMENT_METHODS.map((p) => (
                <button key={p.id} type="button" onClick={() => setPayMethod(payMethod === p.id ? '' : p.id)}
                  style={{ padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                    background: payMethod === p.id ? 'var(--accent-soft)' : 'var(--surface-2)',
                    color: payMethod === p.id ? 'var(--ink)' : 'var(--ink-2)',
                    border: `1px solid ${payMethod === p.id ? 'var(--accent)' : 'var(--line)'}` }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {type === 'expense' && (
          <>
            <Eyebrow style={{ marginBottom: 8 }}>Cartão (opcional)</Eyebrow>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 13, color: 'var(--ink)', marginBottom: 12 }}>
              <option value="">Sem cartão vinculado</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>{resolveBank(c.bank).name} · {c.label}</option>
              ))}
            </select>
            <button type="button" onClick={() => setPaid((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface-2)', border: `1px solid ${paid ? 'var(--positive)' : 'var(--line)'}`, marginBottom: 16 }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${paid ? 'var(--positive)' : 'var(--ink-4)'}`, background: paid ? 'var(--positive)' : 'transparent', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {paid && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>}
              </span>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Marcar como pago</span>
              {accountId && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>libera limite do cartão</span>}
            </button>
          </>
        )}

        <div style={{ marginBottom: 20 }}>
          <Eyebrow style={{ marginBottom: 8 }}>{type === 'expense' ? 'Data da despesa' : 'Data de entrada'}</Eyebrow>
          <input type="date" value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 13, color: 'var(--ink)', marginBottom: type === 'expense' ? 12 : 0 }} />
          {type === 'expense' && (
            <>
              <button type="button" onClick={() => setHasDue((v) => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface-2)', border: `1px solid ${hasDue ? 'var(--accent)' : 'var(--line)'}` }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${hasDue ? 'var(--accent)' : 'var(--ink-4)'}`, background: hasDue ? 'var(--accent)' : 'transparent', color: 'var(--accent-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {hasDue && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>}
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>É uma conta a pagar (tem vencimento)</span>
              </button>
              {hasDue && (
                <div style={{ marginTop: 12 }}>
                  <Eyebrow style={{ marginBottom: 8 }}>Vencimento</Eyebrow>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 13, color: 'var(--ink)' }} />
                </div>
              )}
            </>
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
