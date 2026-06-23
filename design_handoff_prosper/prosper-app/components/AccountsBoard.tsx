'use client';

import { useState, useTransition } from 'react';
import { addAccount, deleteAccount } from '@/lib/actions';
import { parseBRL, brl } from '@/lib/format';
import { BANKS, BANK_IDS } from '@/lib/banks';
import { Button, Card, Eyebrow, ProgressBar } from '@/components/ui';
import type { Account, AccountKind } from '@/lib/types';

export function BankBadge({ bank, size = 44 }: { bank: string; size?: number }) {
  const b = BANKS[bank] ?? { name: bank, color: '#888', ink: '#fff' };
  return (
    <div style={{ width: size, height: size, borderRadius: 12, background: b.color, color: b.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.42, flexShrink: 0 }}>
      {b.name[0]}
    </div>
  );
}

export function AccountsBoard({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(false);
  const contas = accounts.filter((a) => a.kind === 'conta' || a.kind === 'investimento');
  const cartoes = accounts.filter((a) => a.kind === 'cartao');
  const emprestimos = accounts.filter((a) => a.kind === 'emprestimo');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <Button onClick={() => setOpen(true)}>+ Nova operação</Button>
      </div>

      <ListSection label="Contas">
        {contas.map((a) => (
          <AccountRow key={a.id} a={a}>
            <span className="tnum" style={{ fontSize: 18, fontWeight: 600 }}>{brl(a.balance ?? 0)}</span>
          </AccountRow>
        ))}
        {contas.length === 0 && <Empty />}
      </ListSection>

      <ListSection label="Cartões de crédito">
        {cartoes.map((a) => {
          const pct = a.credit_limit ? ((a.used ?? 0) / a.credit_limit) * 100 : 0;
          return (
            <AccountRow key={a.id} a={a} sub={`Vence ${a.due ?? '—'}`}>
              <div style={{ minWidth: 150 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--ink-2)' }}>{brl(a.used ?? 0)}</span>
                  <span style={{ color: 'var(--ink-3)' }}>de {brl(a.credit_limit ?? 0)}</span>
                </div>
                <ProgressBar pct={pct} height={4} color={pct > 80 ? 'var(--negative)' : 'var(--accent)'} />
              </div>
            </AccountRow>
          );
        })}
        {cartoes.length === 0 && <Empty />}
      </ListSection>

      <ListSection label="Empréstimos">
        {emprestimos.map((a) => {
          const pct = a.total ? ((a.paid ?? 0) / a.total) * 100 : 0;
          return (
            <AccountRow key={a.id} a={a} sub={`Parcela ${brl(a.installment ?? 0)}/mês`}>
              <div style={{ minWidth: 150 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--ink-2)' }}>{a.paid ?? 0}/{a.total ?? 0} pagas</span>
                  <span style={{ color: 'var(--ink-3)' }}>resta {brl(a.outstanding ?? 0)}</span>
                </div>
                <ProgressBar pct={pct} height={4} color="var(--positive)" />
              </div>
            </AccountRow>
          );
        })}
        {emprestimos.length === 0 && <Empty />}
      </ListSection>

      {open && <NewOperationModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ListSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <Eyebrow style={{ marginBottom: 10 }}>{label}</Eyebrow>
      <Card pad="2px 18px">{children}</Card>
    </div>
  );
}

function Empty() {
  return <div style={{ padding: '20px 0', color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>Nada por aqui ainda.</div>;
}

function AccountRow({ a, sub, children }: { a: Account; sub?: string; children: React.ReactNode }) {
  const [pending, start] = useTransition();
  const b = BANKS[a.bank];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--line-soft)', opacity: pending ? 0.4 : 1 }}>
      <BankBadge bank={a.bank} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{b?.name ?? a.bank}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{a.label}{sub ? ` · ${sub}` : ''}</div>
      </div>
      {children}
      <button onClick={() => start(async () => { await deleteAccount(a.id); })} aria-label="Remover" style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 15, padding: 6 }}>✕</button>
    </div>
  );
}

const KINDS: { id: AccountKind; label: string }[] = [
  { id: 'conta', label: 'Conta' },
  { id: 'cartao', label: 'Cartão' },
  { id: 'emprestimo', label: 'Empréstimo' },
  { id: 'investimento', label: 'Investimento' },
];

function NewOperationModal({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<AccountKind>('conta');
  const [bank, setBank] = useState('nubank');
  const [value, setValue] = useState('');
  const [pending, start] = useTransition();
  const num = parseBRL(value);

  const valueLabel = kind === 'cartao' ? 'Limite do cartão' : kind === 'emprestimo' ? 'Valor do empréstimo' : 'Saldo atual';

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,14,22,.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-2)', padding: 28, width: 460, maxWidth: '100%' }}>
        <h2 style={{ margin: '0 0 18px', fontSize: 22, fontWeight: 700 }}>Nova operação</h2>

        <Eyebrow style={{ marginBottom: 8 }}>Tipo</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 18 }}>
          {KINDS.map((k) => (
            <button key={k.id} onClick={() => setKind(k.id)} style={{ padding: '10px 4px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: kind === k.id ? 'var(--ink)' : 'var(--surface-2)', color: kind === k.id ? 'var(--bg)' : 'var(--ink-2)', border: `1px solid ${kind === k.id ? 'var(--ink)' : 'var(--line)'}` }}>{k.label}</button>
          ))}
        </div>

        <Eyebrow style={{ marginBottom: 8 }}>Banco</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
          {BANK_IDS.map((id) => (
            <button key={id} onClick={() => setBank(id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: bank === id ? 'var(--accent-soft)' : 'var(--surface-2)', border: `1px solid ${bank === id ? 'var(--accent)' : 'var(--line)'}` }}>
              <BankBadge bank={id} size={26} />
              <span style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{BANKS[id].name}</span>
            </button>
          ))}
        </div>

        <Eyebrow style={{ marginBottom: 8 }}>{valueLabel}</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 22 }}>
          <span style={{ color: 'var(--ink-3)' }}>R$</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" placeholder="0,00" autoFocus style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }} />
        </div>

        <Button full onClick={() => start(async () => { await addAccount({ bank, kind, value: num }); onClose(); })} style={{ opacity: num > 0 && !pending ? 1 : 0.45 }}>
          {pending ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </div>
    </div>
  );
}
