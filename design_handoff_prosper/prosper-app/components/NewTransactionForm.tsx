'use client';

import { useState, useTransition } from 'react';
import { addTransaction } from '@/lib/actions';
import { parseBRL } from '@/lib/format';
import { CATEGORIES } from '@/lib/types';
import { Button, Eyebrow } from '@/components/ui';

const EXPENSE_CATS = ['food', 'home', 'transport', 'leisure', 'health', 'edu'];

export function NewTransactionForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('food');
  const [pending, start] = useTransition();

  const num = parseBRL(amount);
  const canSave = num > 0 && name.trim().length > 0;

  function save() {
    if (!canSave) return;
    const signed = type === 'income' ? num : -num;
    start(async () => {
      await addTransaction({ amount: signed, name: name.trim(), category });
      setAmount('');
      setName('');
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>+ Lançar movimento</Button>
    );
  }

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,14,22,0.5)',
        backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-2)', padding: 28, width: 460, maxWidth: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Novo lançamento</h2>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 20 }}>✕</button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'inline-flex', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: 4, marginBottom: 20 }}>
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                padding: '8px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600, border: 'none',
                background: type === t ? 'var(--ink)' : 'transparent',
                color: type === t ? 'var(--bg)' : 'var(--ink-2)',
              }}
            >
              {t === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <Eyebrow style={{ marginBottom: 8 }}>Valor</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 16 }}>
          <span style={{ color: 'var(--ink-3)', fontSize: 18 }}>R$</span>
          <input
            value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" autoFocus
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 22, fontWeight: 700, color: type === 'income' ? 'var(--positive)' : 'var(--ink)' }}
          />
        </div>

        {/* Category (expense only) */}
        {type === 'expense' && (
          <>
            <Eyebrow style={{ marginBottom: 8 }}>Categoria</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {EXPENSE_CATS.map((c) => (
                <button
                  key={c} onClick={() => setCategory(c)}
                  style={{
                    padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    background: category === c ? 'var(--ink)' : 'var(--surface-2)',
                    color: category === c ? 'var(--bg)' : 'var(--ink-2)',
                    border: `1px solid ${category === c ? 'var(--ink)' : 'var(--line)'}`,
                  }}
                >
                  {CATEGORIES[c].name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Description */}
        <Eyebrow style={{ marginBottom: 8 }}>Descrição</Eyebrow>
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 22 }}>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder={type === 'income' ? 'Ex.: Salário, freelance...' : 'Ex.: Mercado, Uber...'}
            style={{ width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }}
          />
        </div>

        <Button full onClick={save} style={{ opacity: canSave && !pending ? 1 : 0.45 }}>
          {pending ? 'Salvando...' : type === 'income' ? 'Registrar receita' : 'Registrar despesa'}
        </Button>
      </div>
    </div>
  );
}
