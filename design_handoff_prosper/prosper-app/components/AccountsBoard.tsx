'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { addAccount, updateAccount, deleteAccount } from '@/lib/actions';
import { parseBRL, brl } from '@/lib/format';
import { BANKS, BANK_IDS, resolveBank } from '@/lib/banks';
import { Button, Card, Eyebrow, ProgressBar } from '@/components/ui';
import type { Account, AccountKind } from '@/lib/types';

export function BankBadge({ bank, size = 44 }: { bank: string; size?: number }) {
  const b = resolveBank(bank);
  return (
    <div style={{ width: size, height: size, borderRadius: 12, background: b.color, color: b.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.42, flexShrink: 0 }}>
      {b.name[0]}
    </div>
  );
}

export function AccountsBoard({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Account | null>(null);
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
          <AccountRow key={a.id} a={a} onEdit={() => setEdit(a)}>
            <span className="tnum" style={{ fontSize: 18, fontWeight: 600 }}>{brl(a.balance ?? 0)}</span>
          </AccountRow>
        ))}
        {contas.length === 0 && <Empty />}
        {contas.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 12px', borderTop: '1px solid var(--line)', marginTop: 2 }}>
            <span className="eyebrow">Total em contas</span>
            <TotalItem label="Saldo" value={brl(contas.reduce((s, a) => s + (a.balance ?? 0), 0))} color="var(--positive)" />
          </div>
        )}
      </ListSection>

      <ListSection label="Cartões de crédito">
        {cartoes.map((a) => {
          const limit = a.credit_limit ?? 0;
          const usedV = a.used ?? 0;
          const avail = Math.max(0, limit - usedV);
          const pct = limit ? (usedV / limit) * 100 : 0;
          return (
            <AccountRow key={a.id} a={a} onEdit={() => setEdit(a)} sub={`Vence dia ${a.due ?? '—'}`}>
              <div style={{ minWidth: 180 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--ink-2)' }}>Usado {brl(usedV)}</span>
                  <span style={{ color: 'var(--ink-3)' }}>de {brl(limit)}</span>
                </div>
                <ProgressBar pct={pct} height={4} color={pct > 80 ? 'var(--negative)' : 'var(--accent)'} />
                <div style={{ fontSize: 12, color: 'var(--positive)', marginTop: 5, fontWeight: 600 }}>
                  Disponível {brl(avail)}
                </div>
              </div>
            </AccountRow>
          );
        })}
        {cartoes.length === 0 && <Empty />}
        {cartoes.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 12px', borderTop: '1px solid var(--line)', marginTop: 2 }}>
            <span className="eyebrow">Total dos cartões</span>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <TotalItem label="Limite" value={brl(cartoes.reduce((s, a) => s + (a.credit_limit ?? 0), 0))} />
              <TotalItem label="Usado" value={brl(cartoes.reduce((s, a) => s + (a.used ?? 0), 0))} color="var(--negative)" />
              <TotalItem label="Disponível" value={brl(cartoes.reduce((s, a) => s + Math.max(0, (a.credit_limit ?? 0) - (a.used ?? 0)), 0))} color="var(--positive)" />
            </div>
          </div>
        )}
      </ListSection>

      <ListSection label="Empréstimos">
        {emprestimos.map((a) => (
          <LoanRow key={a.id} a={a} onEdit={() => setEdit(a)} />
        ))}
        {emprestimos.length === 0 && <Empty />}
        {emprestimos.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 12px', borderTop: '1px solid var(--line)', marginTop: 2 }}>
            <span className="eyebrow">Total dos empréstimos</span>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <TotalItem label="Parcela/mês" value={brl(emprestimos.reduce((s, a) => s + (a.installment ?? 0), 0))} />
              <TotalItem label="Saldo devedor" value={brl(emprestimos.reduce((s, a) => s + (a.outstanding ?? 0), 0))} color="var(--negative)" />
            </div>
          </div>
        )}
      </ListSection>

      {open && <OperationModal onClose={() => setOpen(false)} />}
      {edit && <OperationModal account={edit} onClose={() => setEdit(null)} />}
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

function TotalItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{label}</div>
      <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: color ?? 'var(--ink)', marginTop: 2 }}>{value}</div>
    </div>
  );
}

function AccountRow({ a, sub, children, onEdit }: { a: Account; sub?: string; children: React.ReactNode; onEdit: () => void }) {
  const [pending, start] = useTransition();
  const b = resolveBank(a.bank);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--line-soft)', opacity: pending ? 0.4 : 1 }}>
      <BankBadge bank={a.bank} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{a.label}{sub ? ` · ${sub}` : ''}</div>
      </div>
      {children}
      <button onClick={onEdit} aria-label="Editar" title="Editar" style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-2)', width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M13.5 6.5l3 3"/></svg>
      </button>
      <button onClick={() => start(async () => { await deleteAccount(a.id); })} aria-label="Remover" style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 15, padding: 6 }}>✕</button>
    </div>
  );
}

// Linha de empréstimo com progresso de parcelas + ações (pagar parcela / amortizar).
function LoanRow({ a, onEdit }: { a: Account; onEdit: () => void }) {
  const [pending, start] = useTransition();
  const [amortizing, setAmortizing] = useState(false);
  const b = resolveBank(a.bank);
  const total = a.total ?? 0;
  const paidCount = a.paid ?? 0;
  const installment = a.installment ?? 0;
  const outstanding = a.outstanding ?? 0;
  const pct = total ? (paidCount / total) * 100 : 0;

  function payInstallment() {
    if (paidCount >= total && total > 0) return;
    start(async () => {
      await updateAccount(a.id, {
        paid: Math.min(total || paidCount + 1, paidCount + 1),
        outstanding: Math.max(0, outstanding - installment),
      });
    });
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--line-soft)', opacity: pending ? 0.5 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <BankBadge bank={a.bank} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{a.label} · Parcela {brl(installment)}/mês</div>
        </div>
        <div style={{ minWidth: 150 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
            <span style={{ color: 'var(--ink-2)' }}>{paidCount}/{total} pagas</span>
            <span style={{ color: 'var(--ink-3)' }}>resta {brl(outstanding)}</span>
          </div>
          <ProgressBar pct={pct} height={4} color="var(--positive)" />
        </div>
        <button onClick={onEdit} aria-label="Editar" title="Editar" style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-2)', width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M13.5 6.5l3 3"/></svg>
        </button>
        <button onClick={() => start(async () => { await deleteAccount(a.id); })} aria-label="Remover" style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 15, padding: 6 }}>✕</button>
      </div>
      {/* Ações */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingLeft: 58, flexWrap: 'wrap' }}>
        <button onClick={payInstallment} disabled={outstanding <= 0}
          style={{ padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'var(--ink)', color: 'var(--bg)', border: 'none', opacity: outstanding <= 0 ? 0.4 : 1 }}>
          Pagar parcela
        </button>
        <button onClick={() => setAmortizing(true)} disabled={outstanding <= 0}
          style={{ padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--line)', opacity: outstanding <= 0 ? 0.4 : 1 }}>
          Amortizar
        </button>
        {outstanding <= 0 && <span style={{ fontSize: 12, color: 'var(--positive)', fontWeight: 600, alignSelf: 'center' }}>Quitado 🎉</span>}
      </div>
      {amortizing && <AmortizeModal a={a} onClose={() => setAmortizing(false)} />}
    </div>
  );
}

// Amortização: abate um valor extra do saldo devedor.
function AmortizeModal({ a, onClose }: { a: Account; onClose: () => void }) {
  const [value, setValue] = useState('');
  const [pending, start] = useTransition();
  const outstanding = a.outstanding ?? 0;
  const num = parseBRL(value);
  const after = Math.max(0, outstanding - num);
  const canSave = num > 0 && num <= outstanding;

  return (
    <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,14,22,.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-2)', padding: 28, width: 420, maxWidth: '100%' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Amortizar empréstimo</h2>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--ink-3)' }}>Abata um valor extra do saldo devedor de {resolveBank(a.bank).name}.</p>

        <Eyebrow style={{ marginBottom: 8 }}>Valor da amortização</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 16 }}>
          <span style={{ color: 'var(--ink-3)', fontSize: 18 }}>R$</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" placeholder="0,00" autoFocus
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 20, fontWeight: 700, color: 'var(--ink)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 22 }}>
          <span style={{ color: 'var(--ink-3)' }}>Saldo devedor após</span>
          <span className="tnum" style={{ color: 'var(--positive)', fontWeight: 700 }}>{brl(after)}</span>
        </div>

        <Button full onClick={() => start(async () => { await updateAccount(a.id, { outstanding: after }); onClose(); })} style={{ opacity: canSave && !pending ? 1 : 0.45 }}>
          {pending ? 'Amortizando...' : 'Confirmar amortização'}
        </Button>
      </motion.div>
    </motion.div>
  );
}

const KINDS: { id: AccountKind; label: string }[] = [
  { id: 'conta', label: 'Conta' },
  { id: 'cartao', label: 'Cartão' },
  { id: 'emprestimo', label: 'Empréstimo' },
  { id: 'investimento', label: 'Investimento' },
];

const LOAN_TYPES = [
  'Empréstimo pessoal',
  'Financiamento de imóvel',
  'Financiamento de automóvel',
  'Consórcio de automóvel',
  'Consórcio de moto',
  'Consórcio de imóvel',
  'Crédito consignado',
  'Outros',
];

function fieldBox(): React.CSSProperties {
  return { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)' };
}

// Modal usado tanto para criar quanto para editar (quando account é passado).
function OperationModal({ account, onClose }: { account?: Account; onClose: () => void }) {
  const editing = !!account;
  const [kind, setKind] = useState<AccountKind>(account?.kind ?? 'conta');
  const initialBankIsCustom = account ? !BANKS[account.bank] : false;
  const [bank, setBank] = useState<string>(initialBankIsCustom ? '__other__' : (account?.bank ?? 'nubank'));
  const [otherBank, setOtherBank] = useState(initialBankIsCustom ? resolveBank(account!.bank).name : '');

  const baseValue = account
    ? (account.kind === 'cartao' ? account.credit_limit : account.kind === 'emprestimo' ? account.outstanding : account.balance)
    : undefined;
  const [value, setValue] = useState(baseValue != null ? String(baseValue).replace('.', ',') : '');
  const [used, setUsed] = useState(account?.used != null ? String(account.used).replace('.', ',') : '');
  const [due, setDue] = useState(account?.due ?? '');
  const [total, setTotal] = useState(account?.total != null ? String(account.total) : '');
  const [paidCount, setPaidCount] = useState(account?.paid != null ? String(account.paid) : '0');
  const [installment, setInstallment] = useState(account?.installment != null ? String(account.installment).replace('.', ',') : '');
  const [loanType, setLoanType] = useState(account?.kind === 'emprestimo' && account.label ? account.label : 'Empréstimo pessoal');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const num = parseBRL(value);
  const usedNum = parseBRL(used);
  const totalNum = Math.max(0, Math.round(Number(total) || 0));
  const paidNum = Math.max(0, Math.min(totalNum || 999, Math.round(Number(paidCount) || 0)));
  // Parcela: usa o valor digitado, ou calcula (saldo / nº de parcelas).
  const installmentNum = parseBRL(installment) || (totalNum ? Math.round((num / totalNum) * 100) / 100 : 0);
  const resolvedBank = bank === '__other__' ? (otherBank.trim() ? `custom:${otherBank.trim()}` : '') : bank;
  const canSave = num > 0 && !!resolvedBank;

  const valueLabel = kind === 'cartao' ? 'Limite total do cartão' : kind === 'emprestimo' ? 'Valor do empréstimo' : 'Saldo atual';

  function submit() {
    if (!canSave) return;
    setError(null);
    start(async () => {
      try {
        if (editing) {
          const patch: Record<string, unknown> = {};
          if (kind === 'cartao') { patch.credit_limit = num; patch.used = usedNum; patch.due = due || null; }
          else if (kind === 'emprestimo') { patch.outstanding = num; patch.total = totalNum; patch.paid = paidNum; patch.installment = installmentNum; patch.label = loanType; }
          else { patch.balance = num; }
          await updateAccount(account!.id, patch);
        } else {
          await addAccount({ bank: resolvedBank, kind, value: num, used: usedNum, due: due || null, total: totalNum || undefined, paid: paidNum, installment: installmentNum || undefined, label: kind === 'emprestimo' ? loanType : undefined });
        }
        onClose();
      } catch (e: any) {
        setError(e?.message ?? 'Não foi possível salvar.');
      }
    });
  }

  return (
    <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,14,22,.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-2)', padding: 28, width: 480, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 18px', fontSize: 22, fontWeight: 700 }}>{editing ? 'Editar' : 'Nova operação'}</h2>

        {/* Tipo (bloqueado ao editar) */}
        <Eyebrow style={{ marginBottom: 8 }}>Tipo</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 18 }}>
          {KINDS.map((k) => (
            <button key={k.id} onClick={() => !editing && setKind(k.id)} disabled={editing && k.id !== kind}
              style={{ padding: '10px 4px', borderRadius: 10, fontSize: 12, fontWeight: 600, opacity: editing && k.id !== kind ? 0.4 : 1,
                background: kind === k.id ? 'var(--ink)' : 'var(--surface-2)', color: kind === k.id ? 'var(--bg)' : 'var(--ink-2)',
                border: `1px solid ${kind === k.id ? 'var(--ink)' : 'var(--line)'}`, cursor: editing ? 'default' : 'pointer' }}>{k.label}</button>
          ))}
        </div>

        {/* Banco (bloqueado ao editar) */}
        {!editing && (
          <>
            <Eyebrow style={{ marginBottom: 8 }}>Banco / cooperativa</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {BANK_IDS.map((id) => (
                <button key={id} onClick={() => setBank(id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: bank === id ? 'var(--accent-soft)' : 'var(--surface-2)', border: `1px solid ${bank === id ? 'var(--accent)' : 'var(--line)'}` }}>
                  <BankBadge bank={id} size={26} />
                  <span style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{BANKS[id].name}</span>
                </button>
              ))}
              <button onClick={() => setBank('__other__')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: bank === '__other__' ? 'var(--accent-soft)' : 'transparent', color: bank === '__other__' ? 'var(--ink)' : 'var(--accent)', border: `1px dashed ${bank === '__other__' ? 'var(--accent)' : 'var(--accent)'}` }}>
                + Outro
              </button>
            </div>
            {bank === '__other__' && (
              <input value={otherBank} onChange={(e) => setOtherBank(e.target.value)} placeholder="Nome do banco/cooperativa" autoFocus
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 14, color: 'var(--ink)', marginBottom: 18 }} />
            )}
            {bank !== '__other__' && <div style={{ height: 6 }} />}
          </>
        )}

        {/* Valor principal */}
        <Eyebrow style={{ marginBottom: 8 }}>{valueLabel}</Eyebrow>
        <div style={{ ...fieldBox(), marginBottom: (kind === 'conta' || kind === 'investimento') ? 22 : 14 }}>
          <span style={{ color: 'var(--ink-3)' }}>R$</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" placeholder="0,00" autoFocus={editing}
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }} />
        </div>

        {/* Campos extras do empréstimo */}
        {kind === 'emprestimo' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <Eyebrow style={{ marginBottom: 8 }}>Tipo de empréstimo</Eyebrow>
              <select value={loanType} onChange={(e) => setLoanType(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 14, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>
                {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div style={{ minWidth: 0 }}>
                <Eyebrow style={{ marginBottom: 8 }}>Total de parcelas</Eyebrow>
                <input value={total} onChange={(e) => setTotal(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))} inputMode="numeric" placeholder="12"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <Eyebrow style={{ marginBottom: 8 }}>Parcelas pagas</Eyebrow>
                <input value={paidCount} onChange={(e) => setPaidCount(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))} inputMode="numeric" placeholder="0"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }} />
              </div>
            </div>
            <div style={{ marginBottom: 22 }}>
              <Eyebrow style={{ marginBottom: 8 }}>Valor da parcela <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--ink-3)', fontWeight: 400 }}>(opcional — calcula sozinho)</span></Eyebrow>
              <div style={fieldBox()}>
                <span style={{ color: 'var(--ink-3)' }}>R$</span>
                <input value={installment} onChange={(e) => setInstallment(e.target.value)} inputMode="decimal" placeholder={totalNum ? brl(num / totalNum).replace('R$ ', '') : '0,00'}
                  style={{ flex: 1, minWidth: 0, width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }} />
              </div>
            </div>
          </>
        )}

        {/* Campos extras do cartão */}
        {kind === 'cartao' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
            <div style={{ minWidth: 0 }}>
              <Eyebrow style={{ marginBottom: 8 }}>Limite utilizado</Eyebrow>
              <div style={fieldBox()}>
                <span style={{ color: 'var(--ink-3)' }}>R$</span>
                <input value={used} onChange={(e) => setUsed(e.target.value)} inputMode="decimal" placeholder="0,00"
                  style={{ flex: 1, minWidth: 0, width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }} />
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <Eyebrow style={{ marginBottom: 8 }}>Vence dia</Eyebrow>
              <input value={due} onChange={(e) => setDue(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} inputMode="numeric" placeholder="10"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', outline: 'none', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }} />
            </div>
          </div>
        )}

        {error && <div style={{ color: 'var(--negative)', fontSize: 13, marginBottom: 14, background: 'color-mix(in oklab, var(--negative) 10%, transparent)', borderRadius: 10, padding: '10px 12px' }}>{error}</div>}

        <Button full onClick={submit} style={{ opacity: canSave && !pending ? 1 : 0.45 }}>
          {pending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
