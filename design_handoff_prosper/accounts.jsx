// accounts.jsx — Contas & Cartões (bancos BR, cartões de crédito, empréstimos)
// Reads/writes PFStore. Banks shown as neutral colored monograms (not logos).

function pfBank(id) {
  return (window.PF_BANKS || []).find(b => b.id === id) || { id, name: id, color: '#888', ink: '#fff' };
}

function BankBadge({ bankId, size = 44 }) {
  const b = pfBank(bankId);
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: b.color, color: b.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.42, flexShrink: 0,
      letterSpacing: '-0.02em',
    }}>{b.name[0]}</div>
  );
}

function AccountsScreen({ navigate, frame }) {
  const isMobile = frame === 'mobile';
  const state = usePF();
  const accounts = state.accounts;
  const [sheet, setSheet] = React.useState(false);

  const contas = accounts.filter(a => a.kind === 'conta');
  const invest = accounts.filter(a => a.kind === 'investimento');
  const cartoes = accounts.filter(a => a.kind === 'cartao');
  const emprestimos = accounts.filter(a => a.kind === 'emprestimo');

  const totalContas = [...contas, ...invest].reduce((a, x) => a + (x.balance || 0), 0);
  const faturaCartoes = cartoes.reduce((a, x) => a + (x.used || 0), 0);
  const dividaEmprest = emprestimos.reduce((a, x) => a + (x.outstanding || 0), 0);

  return (
    <div className="pf-noscroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: isMobile ? '12px 22px 110px 22px' : '40px 48px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
          <div>
            <Eyebrow>Open Finance</Eyebrow>
            <h1 className="pf-serif" style={{ fontSize: isMobile ? 34 : 52, margin: '4px 0 0 0', lineHeight: 1 }}>
              Contas & <em style={{ fontStyle: 'italic' }}>Cartões</em>
            </h1>
          </div>
          {!isMobile && (
            <Button variant="primary" icon={<I.Plus size={14} />} onClick={() => setSheet(true)}>Nova operação</Button>
          )}
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
          <Card pad={18}>
            <Eyebrow style={{ color: 'var(--positive)' }}>Em contas</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 28, marginTop: 6 }}>{PF_FMT.brl(totalContas)}</div>
          </Card>
          <Card pad={18}>
            <Eyebrow style={{ color: 'var(--warning)' }}>Faturas em aberto</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 28, marginTop: 6 }}>{PF_FMT.brl(faturaCartoes)}</div>
          </Card>
          <Card pad={18}>
            <Eyebrow style={{ color: 'var(--negative)' }}>Empréstimos</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 28, marginTop: 6 }}>{PF_FMT.brl(dividaEmprest)}</div>
          </Card>
        </div>

        {/* Contas */}
        <Section label="Contas">
          {[...contas, ...invest].map(a => (
            <AccountRow key={a.id} a={a} onDelete={() => PFStore.actions.deleteAccount(a.id)}>
              <div className="pf-serif" style={{ fontSize: 18 }}>{PF_FMT.brl(a.balance || 0)}</div>
            </AccountRow>
          ))}
          {contas.length + invest.length === 0 && <Empty>Nenhuma conta conectada.</Empty>}
        </Section>

        {/* Cartões */}
        <Section label="Cartões de crédito">
          {cartoes.map(a => {
            const pct = a.limit ? (a.used / a.limit) * 100 : 0;
            return (
              <AccountRow key={a.id} a={a} onDelete={() => PFStore.actions.deleteAccount(a.id)} sub={`Vence ${a.due || '—'}`}>
                <div style={{ minWidth: 150 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: 'var(--ink-2)' }}>{PF_FMT.brl(a.used || 0)}</span>
                    <span style={{ color: 'var(--ink-3)' }}>de {PF_FMT.brl(a.limit || 0)}</span>
                  </div>
                  <ProgressBar pct={pct} height={4} color={pct > 80 ? 'var(--negative)' : 'var(--accent)'} animate={false} />
                </div>
              </AccountRow>
            );
          })}
          {cartoes.length === 0 && <Empty>Nenhum cartão cadastrado.</Empty>}
        </Section>

        {/* Empréstimos */}
        <Section label="Empréstimos">
          {emprestimos.map(a => {
            const pct = a.total ? (a.paid / a.total) * 100 : 0;
            return (
              <AccountRow key={a.id} a={a} onDelete={() => PFStore.actions.deleteAccount(a.id)} sub={`Parcela ${PF_FMT.brl(a.installment || 0)}/mês`}>
                <div style={{ minWidth: 150 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: 'var(--ink-2)' }}>{a.paid}/{a.total} pagas</span>
                    <span style={{ color: 'var(--ink-3)' }}>resta {PF_FMT.brl(a.outstanding || 0)}</span>
                  </div>
                  <ProgressBar pct={pct} height={4} color="var(--positive)" animate={false} />
                </div>
              </AccountRow>
            );
          })}
          {emprestimos.length === 0 && <Empty>Nenhum empréstimo ativo.</Empty>}
        </Section>

        {isMobile && (
          <Button variant="primary" full size="lg" icon={<I.Plus size={16} />} onClick={() => setSheet(true)} style={{ marginTop: 8 }}>
            Nova operação
          </Button>
        )}
      </div>

      {sheet && <NewOperationSheet isMobile={isMobile} onClose={() => setSheet(false)} />}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Eyebrow style={{ marginBottom: 10 }}>{label}</Eyebrow>
      <Card pad="2px 18px">{children}</Card>
    </div>
  );
}

function Empty({ children }) {
  return <div style={{ padding: '20px 0', color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>{children}</div>;
}

function AccountRow({ a, children, sub, onDelete }) {
  const b = pfBank(a.bank);
  const [hover, setHover] = React.useState(false);
  return (
    <div className="pf-rowhover" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 10px', margin: '0 -10px' }}>
      <BankBadge bankId={a.bank} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{a.label}{sub ? ` · ${sub}` : ''}</div>
      </div>
      {children}
      <button className="pf-tap" onClick={onDelete} aria-label="Remover" style={{
        color: 'var(--ink-3)', opacity: hover ? 1 : 0.0, transition: 'opacity 0.15s',
        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <I.Trash size={16} />
      </button>
    </div>
  );
}

// ── Nova operação (modal) ───────────────────────────────────────────────────
function NewOperationSheet({ isMobile, onClose }) {
  const KINDS = [
    { id: 'conta',       label: 'Conta' },
    { id: 'cartao',      label: 'Cartão' },
    { id: 'emprestimo',  label: 'Empréstimo' },
    { id: 'investimento',label: 'Investimento' },
  ];
  const [kind, setKind] = React.useState('conta');
  const [bank, setBank] = React.useState('nubank');
  const [value, setValue] = React.useState('');

  const num = parseBRLInput(value);
  const canSave = num > 0;

  function save() {
    if (!canSave) return;
    let acc = { bank, kind };
    if (kind === 'conta') acc = { ...acc, label: 'Conta corrente', balance: num };
    else if (kind === 'investimento') acc = { ...acc, label: 'Investimentos', balance: num };
    else if (kind === 'cartao') acc = { ...acc, label: 'Cartão de crédito', limit: num, used: 0, due: '10/06' };
    else if (kind === 'emprestimo') acc = { ...acc, label: 'Empréstimo pessoal', outstanding: num, installment: Math.round(num / 12), paid: 0, total: 12 };
    PFStore.actions.addAccount(acc);
    onClose();
  }

  const valueLabel = kind === 'cartao' ? 'Limite do cartão'
    : kind === 'emprestimo' ? 'Valor do empréstimo'
    : 'Saldo atual';

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(10,14,22,0.5)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
      padding: isMobile ? 0 : 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="pf-fade" style={{
        background: 'var(--surface)', width: isMobile ? '100%' : 460, maxWidth: '100%',
        borderRadius: isMobile ? '24px 24px 0 0' : 'var(--radius-xl)',
        border: '1px solid var(--line)', boxShadow: 'var(--shadow-pop)',
        padding: 24, maxHeight: '92%', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div className="pf-serif" style={{ fontSize: 24 }}>Nova <em style={{ fontStyle: 'italic' }}>operação</em></div>
          <button className="pf-tap" onClick={onClose} style={{ color: 'var(--ink-3)' }}><I.X size={20} /></button>
        </div>

        {/* kind */}
        <Eyebrow style={{ marginBottom: 8 }}>Tipo</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 18 }}>
          {KINDS.map(k => (
            <button key={k.id} onClick={() => setKind(k.id)} className="pf-tap" style={{
              padding: '10px 4px', borderRadius: 10, fontSize: 12, fontWeight: 600,
              background: kind === k.id ? 'var(--ink)' : 'var(--surface-2)',
              color: kind === k.id ? 'var(--bg)' : 'var(--ink-2)',
              border: '1px solid ' + (kind === k.id ? 'var(--ink)' : 'var(--line)'),
            }}>{k.label}</button>
          ))}
        </div>

        {/* bank */}
        <Eyebrow style={{ marginBottom: 8 }}>Banco</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
          {(window.PF_BANKS || []).map(b => (
            <button key={b.id} onClick={() => setBank(b.id)} className="pf-tap" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10,
              background: bank === b.id ? 'var(--accent-soft)' : 'var(--surface-2)',
              border: '1px solid ' + (bank === b.id ? 'var(--accent)' : 'var(--line)'),
            }}>
              <BankBadge bankId={b.id} size={26} />
              <span style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</span>
            </button>
          ))}
        </div>

        {/* value */}
        <Eyebrow style={{ marginBottom: 8 }}>{valueLabel}</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 22 }}>
          <span style={{ color: 'var(--ink-3)', fontSize: 16 }}>R$</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" placeholder="0,00" autoFocus style={{ flex: 1, fontSize: 18, fontWeight: 600 }} />
        </div>

        <Button variant="primary" full size="lg" onClick={save} icon={<I.Check size={16} />} style={{ opacity: canSave ? 1 : 0.45, pointerEvents: canSave ? 'auto' : 'none' }}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}

Object.assign(window, { AccountsScreen, BankBadge });
