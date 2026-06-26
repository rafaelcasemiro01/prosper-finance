'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { brl } from '@/lib/format';
import { resolveBank } from '@/lib/banks';

interface CardInfo { id: string; bank: string; due: string; used: number; limit: number }

// Lembrete de vencimento de cartões: ícone de sino no dashboard.
// Destaca cartões cujo vencimento está próximo (<= 7 dias).
export function CardReminders({ cards }: { cards: CardInfo[] }) {
  const [open, setOpen] = useState(false);
  if (cards.length === 0) return null;

  const today = new Date().getDate();
  const withDays = cards.map((c) => {
    const day = parseInt(c.due, 10);
    let diff = day - today;
    if (diff < 0) diff += 30; // próximo mês
    return { ...c, day, diff };
  }).sort((a, b) => a.diff - b.diff);

  const soon = withDays.filter((c) => c.diff <= 7);
  const hasUrgent = soon.length > 0;

  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="card"
        style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
          padding: '14px 18px', cursor: 'pointer',
          borderColor: hasUrgent ? 'var(--accent)' : 'var(--line)',
        }}
      >
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 1 1 12 0v4l2 3H4l2-3V8zM10 19a2 2 0 0 0 4 0" />
          </svg>
          {hasUrgent && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{ position: 'absolute', top: -3, right: -3, width: 9, height: 9, borderRadius: '50%', background: 'var(--negative)', border: '2px solid var(--surface)' }}
            />
          )}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {hasUrgent
              ? `${soon.length} fatura${soon.length > 1 ? 's' : ''} vence${soon.length > 1 ? 'm' : ''} em breve`
              : 'Lembretes de cartão'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
            {hasUrgent ? 'Toque para ver e não perder o pagamento' : `${cards.length} cartão${cards.length > 1 ? 'ões' : ''} acompanhado${cards.length > 1 ? 's' : ''}`}
          </div>
        </div>
        <span style={{ color: 'var(--ink-3)', fontSize: 18, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>⌄</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="card" style={{ marginTop: 8, padding: '6px 18px' }}>
              {withDays.map((c, i) => {
                const b = resolveBank(c.bank);
                const urgent = c.diff <= 7;
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < withDays.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: b.color, color: b.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{b.name[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Fatura {brl(c.used)} / {brl(c.limit)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: urgent ? 'var(--negative)' : 'var(--ink)' }}>Vence dia {c.day}</div>
                      <div style={{ fontSize: 11, color: urgent ? 'var(--negative)' : 'var(--ink-3)' }}>
                        {c.diff === 0 ? 'hoje' : c.diff === 1 ? 'amanhã' : `em ${c.diff} dias`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
