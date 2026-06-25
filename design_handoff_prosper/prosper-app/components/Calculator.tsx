'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Calculadora Prosper — FAB flutuante disponível em todo o app.
// Faz contas rápidas sem o usuário sair do Prosper.
export function Calculator() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="calc-fab" aria-label="Calculadora" title="Calculadora" onClick={() => setOpen(true)}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2.5" />
          <path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14v4M8 18h4" />
        </svg>
      </button>
      <AnimatePresence>{open && <CalcPanel onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function CalcPanel({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('0');

  function press(k: string) {
    if (k === 'C') { setExpr(''); setResult('0'); return; }
    if (k === '⌫') { setExpr((e) => e.slice(0, -1)); return; }
    if (k === '=') {
      try {
        const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/[^0-9+\-*/.()%]/g, '');
        if (!sanitized) return;
        // % vira /100
        const evaluable = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
        // eslint-disable-next-line no-new-func
        const val = Function(`"use strict"; return (${evaluable})`)();
        if (val === undefined || val === null || Number.isNaN(val) || !Number.isFinite(val)) { setResult('Erro'); return; }
        const out = Math.round(val * 100) / 100;
        setResult(out.toLocaleString('pt-BR', { maximumFractionDigits: 2 }));
        setExpr(String(out).replace('.', ','));
      } catch { setResult('Erro'); }
      return;
    }
    setExpr((e) => e + k);
  }

  const keys: { k: string; cls?: string }[] = [
    { k: 'C', cls: 'calc-key--fn' }, { k: '(', cls: 'calc-key--fn' }, { k: ')', cls: 'calc-key--fn' }, { k: '÷', cls: 'calc-key--op' },
    { k: '7' }, { k: '8' }, { k: '9' }, { k: '×', cls: 'calc-key--op' },
    { k: '4' }, { k: '5' }, { k: '6' }, { k: '-', cls: 'calc-key--op' },
    { k: '1' }, { k: '2' }, { k: '3' }, { k: '+', cls: 'calc-key--op' },
    { k: '%', cls: 'calc-key--fn' }, { k: '0' }, { k: '.', }, { k: '=', cls: 'calc-key--eq' },
  ];

  return (
    <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(10,14,22,.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        style={{ background: 'var(--surface)', borderRadius: '24px 24px 0 0', border: '1px solid var(--line)', boxShadow: 'var(--shadow-pop)', padding: 22, width: '100%', maxWidth: 380, marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>Calculadora</span>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 22 }}>✕</button>
        </div>

        {/* Visor */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 16, padding: '16px 18px', marginBottom: 16, textAlign: 'right', minHeight: 86, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', minHeight: 18, wordBreak: 'break-all' }}>{expr || ' '}</div>
          <div className="tnum" style={{ fontSize: 34, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>{result}</div>
        </div>

        {/* Teclado */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {keys.map((key) => (
            <button key={key.k} className={`calc-key ${key.cls ?? ''}`.trim()} onClick={() => press(key.k)}>{key.k}</button>
          ))}
        </div>
        <button className="calc-key calc-key--fn" onClick={() => press('⌫')} style={{ width: '100%', marginTop: 8, height: 44 }}>⌫ Apagar</button>
      </motion.div>
    </motion.div>
  );
}
