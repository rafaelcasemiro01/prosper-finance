'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { addTransaction, addCategory, addRecurringExpense } from '@/lib/actions';
import { parseBRL } from '@/lib/format';
import { resolveBank } from '@/lib/banks';
import type { Account } from '@/lib/types';
import {
  buildCategoryMap, slugify, CATEGORY_COLORS,
  DEFAULT_EXPENSE_TYPES, DEFAULT_INCOME_TYPES, type Category,
} from '@/lib/categories';
import { Button, Eyebrow } from '@/components/ui';

const EXPENSE_CATS = ['food', 'home', 'transport', 'leisure', 'health', 'edu'];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function NewTransactionForm({ customCategories = [], cards = [] }: { customCategories?: Category[]; cards?: Account[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>+ Lançar movimento</Button>
      {open && <Modal customCategories={customCategories} cards={cards} onClose={() => setOpen(false)} />}
    </>
  );
}

function Modal({ customCategories, cards, onClose }: { customCategories: Category[]; cards: Account[]; onClose: () => void }) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('food');
  const [occurredOn, setOccurredOn] = useState(todayISO());
  const [hasDue, setHasDue] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [subtype, setSubtype] = useState('');
  const [accountId, setAccountId] = useState<string>('');
  const [paid, setPaid] = useState(false);
  // Recorrência (conta fixa)
  const [recurring, setRecurring] = useState(false);
  const [recDay, setRecDay] = useState('5');
  const [recMode, setRecMode] = useState<'count' | 'forever'>('count');
  const [recMonths, setRecMonths] = useState('12');
  const [pending, start] = useTransition();

  // Categorias: padrão + personalizadas (do perfil) + criação ao vivo
  const [localCats, setLocalCats] = useState<Category[]>(customCategories);
  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);
  const catMap = buildCategoryMap(localCats);
  const expenseCatSlugs = [...EXPENSE_CATS, ...localCats.map((c) => c.slug)];

  // Tipos sugeridos conforme o lado (despesa/receita)
  const typeOptions = type === 'expense' ? DEFAULT_EXPENSE_TYPES : DEFAULT_INCOME_TYPES;

  const num = parseBRL(amount);
  const canSave = num > 0 && name.trim().length > 0;

  function commitNewCategory() {
    const nm = newCatName.trim();
    if (!nm) return;
    const slug = slugify(nm);
    const cat: Category = { slug, name: nm, color: newCatColor };
    setLocalCats((prev) => prev.some((c) => c.slug === slug) ? prev : [...prev, cat]);
    setCategory(slug);
    setCreatingCat(false);
    setNewCatName('');
    // persiste no perfil (não bloqueia a UI)
    start(async () => { await addCategory({ name: nm, slug, color: newCatColor }); });
  }

  function save() {
    if (!canSave) return;
    const signed = type === 'income' ? num : -num;
    start(async () => {
      if (type === 'expense' && recurring) {
        const months = recMode === 'forever' ? 24 : Math.max(1, Math.min(60, Math.round(Number(recMonths) || 1)));
        await addRecurringExpense({
          amount: num, name: name.trim(), category,
          subtype: subtype.trim() || 'Conta fixa',
          dayOfMonth: Math.max(1, Math.min(31, Math.round(Number(recDay) || 1))),
          months,
        });
      } else {
        await addTransaction({
          amount: signed, name: name.trim(), category,
          occurred_on: occurredOn || undefined,
          due_date: type === 'expense' && hasDue ? (dueDate || null) : null,
          subtype: subtype.trim() || null,
          account_id: type === 'expense' ? (accountId || null) : null,
          paid: type === 'expense' ? paid : false,
        });
      }
      onClose();
    });
  }

  return (
    <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,14,22,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-2)', padding: 28, width: 480, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Novo lançamento</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 20 }}>✕</button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'inline-flex', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: 4, marginBottom: 20 }}>
          {(['expense', 'income'] as const).map((t) => (
            <button key={t} onClick={() => { setType(t); setSubtype(''); }}
              style={{ padding: '8px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600, border: 'none',
                background: type === t ? 'var(--ink)' : 'transparent', color: type === t ? 'var(--bg)' : 'var(--ink-2)' }}>
              {t === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <Eyebrow style={{ marginBottom: 8 }}>Valor</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 16 }}>
          <span style={{ color: 'var(--ink-3)', fontSize: 18 }}>R$</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" autoFocus
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 22, fontWeight: 700, color: type === 'income' ? 'var(--positive)' : 'var(--ink)' }} />
        </div>

        {/* Category (expense only) */}
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
                <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nome da categoria (ex.: Pets)" autoFocus
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

        {/* Tipo (subtype) — sugestões + criar */}
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
              {accountId && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>libera limite</span>}
            </button>
          </>
        )}

        {/* Data + vencimento opcional */}
        <Eyebrow style={{ marginBottom: 8 }}>{type === 'expense' ? 'Data da despesa' : 'Data de entrada'}</Eyebrow>
        <input type="date" value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)}
          style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 13, color: 'var(--ink)', marginBottom: type === 'expense' ? 12 : 20 }} />
        {type === 'expense' && (
          <div style={{ marginBottom: 20 }}>
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
          </div>
        )}

        {/* Conta fixa recorrente (só despesa) */}
        {type === 'expense' && (
          <div style={{ marginBottom: 20 }}>
            <button type="button" onClick={() => setRecurring((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface-2)', border: `1px solid ${recurring ? 'var(--accent)' : 'var(--line)'}` }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${recurring ? 'var(--accent)' : 'var(--ink-4)'}`, background: recurring ? 'var(--accent)' : 'transparent', color: 'var(--accent-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {recurring && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>}
              </span>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>É uma conta fixa (repetir todo mês)</span>
            </button>

            {recurring && (
              <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                <Eyebrow style={{ marginBottom: 8 }}>Dia do vencimento</Eyebrow>
                <select value={recDay} onChange={(e) => setRecDay(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--line)', outline: 'none', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 14, cursor: 'pointer' }}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>Todo dia {d}</option>
                  ))}
                </select>

                <Eyebrow style={{ marginBottom: 8 }}>Por quanto tempo</Eyebrow>
                <div style={{ display: 'flex', gap: 8, marginBottom: recMode === 'count' ? 12 : 0 }}>
                  <button type="button" onClick={() => setRecMode('count')}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: recMode === 'count' ? 'var(--ink)' : 'var(--surface)', color: recMode === 'count' ? 'var(--bg)' : 'var(--ink-2)', border: `1px solid ${recMode === 'count' ? 'var(--ink)' : 'var(--line)'}` }}>
                    Por X meses
                  </button>
                  <button type="button" onClick={() => setRecMode('forever')}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: recMode === 'forever' ? 'var(--ink)' : 'var(--surface)', color: recMode === 'forever' ? 'var(--bg)' : 'var(--ink-2)', border: `1px solid ${recMode === 'forever' ? 'var(--ink)' : 'var(--line)'}` }}>
                    Até eu cancelar
                  </button>
                </div>
                {recMode === 'count' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={recMonths} onChange={(e) => setRecMonths(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} inputMode="numeric" placeholder="12"
                      style={{ width: 80, padding: '11px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--line)', outline: 'none', fontSize: 15, fontWeight: 600, color: 'var(--ink)', textAlign: 'center' }} />
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>meses</span>
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    Lançaremos 24 meses à frente. Você pode cancelar os próximos a qualquer momento na lista de movimentos.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <Eyebrow style={{ marginBottom: 8 }}>Descrição</Eyebrow>
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 22 }}>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder={type === 'income' ? 'Ex.: Salário, freelance...' : 'Ex.: Mercado, Uber...'}
            style={{ width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }} />
        </div>

        <Button full onClick={save} style={{ opacity: canSave && !pending ? 1 : 0.45 }}>
          {pending ? 'Salvando...' : type === 'income' ? 'Registrar receita' : 'Registrar despesa'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
