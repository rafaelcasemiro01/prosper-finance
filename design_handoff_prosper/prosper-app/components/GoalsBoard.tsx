'use client';

import { useState, useTransition } from 'react';
import { addGoal, contributeToGoal } from '@/lib/actions';
import { parseBRL, brl } from '@/lib/format';
import { Button, Card, Eyebrow, ProgressBar } from '@/components/ui';
import type { Goal } from '@/lib/types';

const EMOJIS = ['✺', '◐', '◇', '⊙', '✦', '❂'];
const COLORS = ['#C8A02C', '#1F8A5B', '#B5642B', '#2E7D9A', '#8E5B8A', '#14203A'];

export function GoalsBoard({ goals }: { goals: Goal[] }) {
  const [newOpen, setNewOpen] = useState(false);
  const [contribFor, setContribFor] = useState<Goal | null>(null);

  return (
    <>
      <div className="grid grid-3" style={{ gap: 14 }}>
        {goals.map((g) => {
          const pct = g.target ? (g.current / g.target) * 100 : 0;
          return (
            <Card key={g.id} pad={26}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 28, color: g.color }}>{g.emoji}</span>
                {g.shared && <span style={{ fontSize: 11, color: 'var(--ink-3)', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: 999 }}>Casal</span>}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 14, lineHeight: 1.15 }}>{g.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: g.color }}>{Math.round(pct)}%</span>
              </div>
              <div style={{ marginTop: 12 }}><ProgressBar pct={pct} color={g.color} height={4} /></div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-2)' }}>
                <span>{brl(g.current)}</span>
                <span style={{ color: 'var(--ink-3)' }}>de {brl(g.target)}</span>
              </div>
              <Button variant="secondary" full style={{ marginTop: 16, height: 40 }} onClick={() => setContribFor(g)}>
                + Registrar aporte
              </Button>
            </Card>
          );
        })}

        {/* New goal card */}
        <button
          onClick={() => setNewOpen(true)}
          style={{
            border: '1px dashed var(--ink-4)', borderRadius: 'var(--radius-lg)', padding: 26, minHeight: 200,
            background: 'transparent', color: 'var(--ink-3)', display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', justifyContent: 'flex-end', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 28, marginBottom: 'auto' }}>+</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-2)' }}>Criar nova meta</span>
          <span style={{ fontSize: 12, marginTop: 4 }}>Defina um sonho e o caminho até ele</span>
        </button>
      </div>

      {newOpen && <NewGoalModal onClose={() => setNewOpen(false)} />}
      {contribFor && <ContributeModal goal={contribFor} onClose={() => setContribFor(null)} />}
    </>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,14,22,.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-2)', padding: 28, width: 460, maxWidth: '100%' }}>
        {children}
      </div>
    </div>
  );
}

function ContributeModal({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const [value, setValue] = useState(String(goal.monthly || '').replace('.', ','));
  const [pending, start] = useTransition();
  const num = parseBRL(value);
  const after = Math.min(goal.target, goal.current + num);
  const afterPct = goal.target ? (after / goal.target) * 100 : 0;

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: '0 0 18px', fontSize: 22, fontWeight: 700 }}>Registrar aporte</h2>
      <Eyebrow style={{ marginBottom: 8 }}>Quanto você guardou para “{goal.name}”?</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 16 }}>
        <span style={{ color: 'var(--ink-3)', fontSize: 18 }}>R$</span>
        <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" placeholder="0,00" autoFocus style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 20, fontWeight: 700, color: 'var(--ink)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: 'var(--ink-3)' }}>Depois do aporte</span>
        <span style={{ color: goal.color, fontWeight: 600 }}>{Math.round(afterPct)}% · {brl(after)}</span>
      </div>
      <div style={{ marginBottom: 22 }}><ProgressBar pct={afterPct} color={goal.color} /></div>
      <Button full onClick={() => start(async () => { await contributeToGoal(goal.id, num); onClose(); })} style={{ opacity: num > 0 && !pending ? 1 : 0.45 }}>
        {pending ? 'Salvando...' : 'Adicionar à meta'}
      </Button>
    </Modal>
  );
}

function NewGoalModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [shared, setShared] = useState(false);
  const [pending, start] = useTransition();

  const tNum = parseBRL(target);
  const cNum = parseBRL(current);
  const canSave = name.trim() && tNum > 0 && cNum <= tNum;

  const field = (label: string, val: string, set: (v: string) => void, ph: string, money?: boolean) => (
    <div style={{ marginBottom: 14 }}>
      <Eyebrow style={{ marginBottom: 8 }}>{label}</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
        {money && <span style={{ color: 'var(--ink-3)' }}>R$</span>}
        <input value={val} onChange={(e) => set(e.target.value)} inputMode={money ? 'decimal' : 'text'} placeholder={ph} style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 15, color: 'var(--ink)', fontWeight: money ? 600 : 400 }} />
      </div>
    </div>
  );

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: '0 0 18px', fontSize: 22, fontWeight: 700 }}>Nova meta</h2>
      {field('Nome do sonho', name, setName, 'Ex.: Viagem, Reserva, Carro...')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {field('Objetivo', target, setTarget, '0,00', true)}
        {field('Já guardado', current, setCurrent, '0,00', true)}
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>Ícone</Eyebrow>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {EMOJIS.map((e) => (
          <button key={e} onClick={() => setEmoji(e)} style={{ width: 40, height: 40, borderRadius: 10, fontSize: 18, color, background: emoji === e ? 'var(--accent-soft)' : 'var(--surface-2)', border: `1px solid ${emoji === e ? 'var(--accent)' : 'var(--line)'}` }}>{e}</button>
        ))}
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>Cor</Eyebrow>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {COLORS.map((c) => (
          <button key={c} onClick={() => setColor(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: color === c ? '2px solid var(--ink)' : '2px solid transparent', boxShadow: '0 0 0 1px var(--line)' }} />
        ))}
      </div>
      <button onClick={() => setShared(!shared)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', marginBottom: 20, padding: '12px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
        <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 500 }}>Meta do casal</span>
        <span style={{ width: 44, height: 26, borderRadius: 999, position: 'relative', background: shared ? 'var(--accent)' : 'var(--line)' }}>
          <span style={{ position: 'absolute', top: 3, left: shared ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
        </span>
      </button>
      <Button full onClick={() => start(async () => { await addGoal({ name: name.trim(), target: tNum, current: cNum, emoji, color, shared }); onClose(); })} style={{ opacity: canSave && !pending ? 1 : 0.45 }}>
        {pending ? 'Criando...' : 'Criar meta'}
      </Button>
    </Modal>
  );
}
