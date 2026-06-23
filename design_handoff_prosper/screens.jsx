// screens.jsx — Onboarding, Dashboard, AddTransaction, Transactions
// All screens accept { frame: 'mobile' | 'web', navigate, onClose } props.

// ─────────────────────────────────────────────────────────────
// ONBOARDING / LOGIN
// ─────────────────────────────────────────────────────────────
function OnboardingScreen({ navigate, frame }) {
  const [email, setEmail] = React.useState('');
  const [step, setStep] = React.useState(0); // 0 = welcome, 1 = email
  const isMobile = frame === 'mobile';

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', color: 'var(--ink)',
      padding: isMobile ? '0 28px' : '0 80px',
      paddingTop: isMobile ? 40 : 80,
      paddingBottom: isMobile ? 40 : 80,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logomark size={28} />
        <span style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>Prosper</span>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 480 }}>
        <Eyebrow style={{ marginBottom: 24 }}>Boas-vindas</Eyebrow>
        <h1 className="pf-serif" style={{
          fontSize: isMobile ? 56 : 88, lineHeight: 0.95, margin: 0,
          letterSpacing: '-0.03em',
        }}>
          Sua grana no controle,{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>sem complicação</em>.
        </h1>
        <p style={{
          marginTop: 28, fontSize: isMobile ? 15 : 17, lineHeight: 1.55,
          color: 'var(--ink-2)', maxWidth: 380,
        }}>
          Contas, metas e gastos em um só lugar, pensado para a sua rotina. Comece em minutos.
        </p>

        {step === 0 && (
          <div className="pf-fade" style={{ marginTop: 40, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
            <Button size="lg" full={isMobile} onClick={() => setStep(1)} icon={<I.ArrowRight size={16} />} variant="primary">
              Começar agora
            </Button>
            <Button size="lg" full={isMobile} variant="ghost" onClick={() => navigate('dashboard')}>
              Já tenho conta
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="pf-fade" style={{ marginTop: 40, maxWidth: 380 }}>
            <label style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                marginTop: 10,
                fontSize: 20,
                padding: '10px 0',
                borderBottom: '1px solid var(--ink-4)',
                color: 'var(--ink)',
              }}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'var(--ink-4)'}
            />
            <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
              <Button size="lg" variant="primary" full onClick={() => navigate('dashboard')} icon={<I.ArrowRight size={16} />}>
                Entrar
              </Button>
            </div>
            <p style={{ marginTop: 24, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              <I.Lock size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
              Criptografia ponta-a-ponta. Nunca vendemos seus dados.
            </p>
          </div>
        )}
      </div>

      {/* Bottom signature */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: 'var(--ink-3)', fontSize: 11, letterSpacing: '0.04em' }}>
        <span>EST. 2026</span>
        <span style={{ textAlign: 'right' }}>
          {isMobile ? <>Versão Beta<br/>privada</> : 'Versão Beta privada · Acesso por convite'}
        </span>
      </div>
    </div>
  );
}

function Logomark({ size = 28, color = 'var(--accent)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="2"/>
      <path d="M12.5 23V9H16a3.5 3.5 0 0 1 0 7h-3.5" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD (Home)
// ─────────────────────────────────────────────────────────────
function DashboardScreen({ navigate, frame }) {
  const isMobile = frame === 'mobile';
  const state = usePF();
  const [hideBalance, setHideBalance] = React.useState(false);
  const total = PFSelect.balanceTotal(state);
  const income = PFSelect.monthIncome(state);
  const expense = PFSelect.monthExpense(state);
  const net = income - expense;
  const available = PFSelect.available(state);
  const invested = state.invested;
  const featuredGoal = state.goals[0];
  const goalPct = featuredGoal ? (featuredGoal.current / featuredGoal.target) * 100 : 0;
  const recentTx = PFSelect.recentTransactions(state, isMobile ? 4 : 6);
  const series = PFSelect.series(state);
  const greetName = state.profile.fullName.split(' ');

  // Mobile layout: vertical scroll
  if (isMobile) {
    return (
      <div className="pf-noscroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
        {/* Header */}
        <div style={{ padding: '8px 22px 0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Boa noite,</div>
            <div style={{ fontSize: 22, marginTop: 2 }} className="pf-serif">{greetName[0]} <em style={{ fontStyle: 'italic' }}>{greetName.slice(1).join(' ')}</em></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="pf-tap" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
              <I.Bell size={18} />
            </button>
            <Avatar initials="LM" size={40} />
          </div>
        </div>

        {/* Hero balance card */}
        <div style={{ padding: '24px 22px 0 22px' }}>
          <div className="pf-sheen" style={{
            background: 'linear-gradient(150deg, var(--ink) 0%, color-mix(in oklab, var(--ink) 88%, var(--accent)) 100%)', color: 'var(--bg)',
            borderRadius: 'var(--radius-xl)', padding: 24, position: 'relative', overflow: 'hidden',
            boxShadow: 'var(--shadow-2)',
          }}>
            <div className="pf-dots" style={{ position: 'absolute', inset: 0, opacity: 0.08 }} />
            <div style={{ position: 'absolute', top: -50, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'var(--accent)', opacity: 0.35, filter: 'blur(48px)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Eyebrow style={{ color: 'var(--ink-3)' }}>Patrimônio total</Eyebrow>
                <button className="pf-tap" onClick={() => setHideBalance(!hideBalance)} style={{ color: 'var(--ink-3)', fontSize: 11, letterSpacing: '0.08em' }}>
                  {hideBalance ? 'MOSTRAR' : 'OCULTAR'}
                </button>
              </div>
              <div style={{ marginTop: 10 }}>
                {hideBalance ? (
                  <div className="pf-serif" style={{ fontSize: 52, lineHeight: 1, color: 'var(--bg)' }}>R$ ••••••</div>
                ) : (
                  <Amount value={total} size={52} color="var(--bg)" subColor="color-mix(in oklab, var(--bg) 55%, var(--ink))" />
                )}
              </div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--highlight)', fontSize: 13, fontWeight: 600, background: 'color-mix(in oklab, var(--bg) 12%, transparent)', padding: '5px 10px', borderRadius: 999 }}>
                  <I.Trend size={14} />
                  {net >= 0 ? '+' : '−'}{PF_FMT.brl(Math.abs(net))} · no mês
                </div>
                <Sparkline data={[22500, 22800, 22400, 23000, 23400, 23200, 23847]} width={92} height={30} color="var(--highlight)" strokeWidth={2} />
              </div>
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid color-mix(in oklab, var(--bg) 16%, transparent)', display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>Disponível</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--bg)', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{PF_FMT.brl(available)}</div>
                </div>
                <div style={{ width: 1, background: 'color-mix(in oklab, var(--bg) 16%, transparent)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>Investido</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--bg)', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{PF_FMT.brl(invested)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ padding: '16px 22px 0 22px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { icon: I.Plus, label: 'Lançar', screen: 'new' },
            { icon: I.Chart, label: 'Análises', screen: 'analytics' },
            { icon: I.Target, label: 'Metas', screen: 'goals' },
            { icon: I.Sparkles, label: 'Consultor', screen: 'ai' },
          ].map(a => {
            const Comp = a.icon;
            return (
              <button key={a.label} onClick={() => navigate(a.screen)} className="pf-tap" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                padding: '14px 4px', borderRadius: 'var(--radius)',
                background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-1)',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Comp size={19} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-2)' }}>{a.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick stats */}
        <div style={{ padding: '16px 22px 0 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Card pad={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--positive)' }}>
              <I.ArrowDown size={14} />
              <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Receita</span>
            </div>
            <div className="pf-serif" style={{ fontSize: 26, marginTop: 8 }}>{'R$ ' + Math.round(income).toLocaleString('pt-BR')}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Maio</div>
          </Card>
          <Card pad={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--negative)' }}>
              <I.ArrowUp size={14} />
              <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Despesa</span>
            </div>
            <div className="pf-serif" style={{ fontSize: 26, marginTop: 8 }}>{'R$ ' + Math.round(expense).toLocaleString('pt-BR')}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Maio</div>
          </Card>
        </div>

        {/* Featured goal */}
        <div style={{ padding: '24px 22px 0 22px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <Eyebrow>Sua jornada</Eyebrow>
            <button className="pf-tap" onClick={() => navigate('goals')} style={{ fontSize: 12, color: 'var(--ink-2)' }}>Ver todas →</button>
          </div>
          <Card pad={20} onClick={() => navigate('goals')}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Meta destacada</div>
                <div className="pf-serif" style={{ fontSize: 24, marginTop: 6, lineHeight: 1.1 }}>
                  {featuredGoal ? featuredGoal.name : 'Crie sua meta'}
                </div>
              </div>
              <div className="pf-serif" style={{ fontSize: 36, fontStyle: 'italic', color: 'var(--accent)' }}>
                {Math.round(goalPct)}<span style={{ fontSize: 18 }}>%</span>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <ProgressBar pct={goalPct} height={4} color="var(--accent)" />
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ink-2)' }}>{featuredGoal ? `${PF_FMT.brl(featuredGoal.current)} de ${PF_FMT.brl(featuredGoal.target)}` : '—'}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Você está {Math.round(goalPct)}% mais perto.</span>
            </div>
          </Card>
        </div>

        {/* AI Insight */}
        <div style={{ padding: '16px 22px 0 22px' }}>
          <Card pad={18} bg="var(--accent-soft)" border={false} onClick={() => navigate('ai')}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <I.Sparkles size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 500 }}>Insight do consultor</div>
                <div style={{ fontSize: 14, marginTop: 6, lineHeight: 1.5, color: 'var(--ink)' }}>
                  Você gastou 12% a menos com Alimentação em maio. Aproveite para acelerar a meta da Europa — basta separar mais R$ 156.
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--accent)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Conversar com o consultor <I.ArrowRight size={12} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent transactions */}
        <div style={{ padding: '24px 22px 100px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <Eyebrow>Movimentos recentes</Eyebrow>
            <button className="pf-tap" onClick={() => navigate('transactions')} style={{ fontSize: 12, color: 'var(--ink-2)' }}>Ver tudo →</button>
          </div>
          {recentTx.map((t, i) => (
            <React.Fragment key={t.id}>
              <TransactionRow t={t} dense onClick={() => navigate('new', { editId: t.id })} />
              {i < recentTx.length - 1 && <hr className="pf-hr" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // ── Web layout: 12-column grid ────────────────────────────
  return (
    <div className="pf-noscroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: '40px 48px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <div>
            <Eyebrow>Boa noite</Eyebrow>
            <h1 className="pf-serif" style={{ fontSize: 48, margin: '6px 0 0 0', lineHeight: 1 }}>
              Olá, {greetName[0]} <em style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>{greetName.slice(1).join(' ')}</em>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Chip>Maio 2026</Chip>
            <Button variant="primary" icon={<I.Plus size={14} />} onClick={() => navigate('new')}>Lançar movimento</Button>
          </div>
        </div>

        {/* Hero row: Balance (8 cols) + 2 stacked cards (4 cols) */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Balance hero */}
          <div className="pf-sheen" style={{
            background: 'linear-gradient(150deg, var(--ink) 0%, color-mix(in oklab, var(--ink) 86%, var(--accent)) 100%)', color: 'var(--bg)',
            borderRadius: 'var(--radius-xl)', padding: 36, position: 'relative', overflow: 'hidden',
            minHeight: 240, boxShadow: 'var(--shadow-2)',
          }}>
            <div className="pf-dots" style={{ position: 'absolute', inset: 0, opacity: 0.07 }} />
            <div style={{ position: 'absolute', top: -60, right: -20, width: 220, height: 220, borderRadius: '50%', background: 'var(--accent)', opacity: 0.3, filter: 'blur(60px)' }} />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Eyebrow style={{ color: 'var(--ink-3)' }}>Patrimônio total · BRL</Eyebrow>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Chip>BRL</Chip>
                  <Chip>USD</Chip>
                  <Chip>EUR</Chip>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <Amount value={total} size={92} color="var(--bg)" subColor="color-mix(in oklab, var(--bg) 55%, var(--ink))" />
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--highlight)', fontSize: 14 }}>
                    <I.Trend size={16} />
                    {net >= 0 ? '+' : '−'}{PF_FMT.brl(Math.abs(net))} <span style={{ color: 'var(--ink-3)', marginLeft: 4 }}>de saldo no mês</span>
                  </div>
                </div>
                <Sparkline data={[22500, 22800, 22400, 23000, 22900, 23400, 23200, 23847]} width={200} height={56} color="var(--highlight)" />
              </div>
            </div>
          </div>

          {/* Mini stats stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card pad={24} style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Eyebrow style={{ color: 'var(--positive)' }}>Receitas · Maio</Eyebrow>
                <I.ArrowDown size={16} style={{ color: 'var(--positive)' }} />
              </div>
              <div className="pf-serif" style={{ fontSize: 40, marginTop: 8 }}>{'R$ ' + Math.round(income).toLocaleString('pt-BR')}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Maio 2026</div>
            </Card>
            <Card pad={24} style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Eyebrow style={{ color: 'var(--negative)' }}>Despesas · Maio</Eyebrow>
                <I.ArrowUp size={16} style={{ color: 'var(--negative)' }} />
              </div>
              <div className="pf-serif" style={{ fontSize: 40, marginTop: 8 }}>{'R$ ' + Math.round(expense).toLocaleString('pt-BR')}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Maio 2026</div>
            </Card>
          </div>
        </div>

        {/* Second row: chart + featured goal */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          <Card pad={28}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
              <div>
                <Eyebrow>Fluxo · últimos 6 meses</Eyebrow>
                <div className="pf-serif" style={{ fontSize: 28, marginTop: 6 }}>{net >= 0 ? '+ ' : '− '}{PF_FMT.brl(Math.abs(net))} <span style={{ color: 'var(--ink-3)', fontSize: 16 }}>{net >= 0 ? 'economizados' : 'a mais'}</span></div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-2)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, background: 'var(--ink-4)', borderRadius: 2 }} /> Receita
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, background: 'var(--ink)', borderRadius: 2 }} /> Despesa
                </span>
              </div>
            </div>
            <BarChart income={series.income} expense={series.expense} labels={series.labels} height={180} />
          </Card>

          <Card pad={24} onClick={() => navigate('goals')}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Eyebrow>Meta destacada</Eyebrow>
              <I.ArrowRight size={14} style={{ color: 'var(--ink-3)' }} />
            </div>
            <div className="pf-serif" style={{ fontSize: 28, marginTop: 8, lineHeight: 1.1 }}>
              {featuredGoal ? featuredGoal.name : 'Crie sua meta'}
            </div>
            <div className="pf-serif" style={{ fontSize: 64, fontStyle: 'italic', color: 'var(--accent)', lineHeight: 1, marginTop: 20 }}>
              {Math.round(goalPct)}<span style={{ fontSize: 28 }}>%</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <ProgressBar pct={goalPct} height={4} color="var(--accent)" />
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-2)' }}>
              {featuredGoal ? `${PF_FMT.brl(featuredGoal.current)} de ${PF_FMT.brl(featuredGoal.target)}` : '—'}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
              Você está {Math.round(goalPct)}% mais perto do seu sonho.
            </div>
          </Card>
        </div>

        {/* Third row: AI insight + recent tx */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
          <Card pad={24} bg="var(--accent-soft)" border={false} onClick={() => navigate('ai')}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <I.Sparkles size={18} />
            </div>
            <Eyebrow style={{ color: 'var(--accent)', marginTop: 16 }}>Insight do consultor</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 22, marginTop: 8, lineHeight: 1.25 }}>
              Você gastou <em style={{ fontStyle: 'italic' }}>12% menos</em> com alimentação em maio.
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.5 }}>
              Aproveite para acelerar a meta da Europa — separe mais R$ 156 e antecipe a viagem em 3 semanas.
            </p>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--accent)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Conversar com o consultor <I.ArrowRight size={14} />
            </div>
          </Card>

          <Card pad={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Eyebrow>Movimentos recentes</Eyebrow>
              <button onClick={() => navigate('transactions')} className="pf-tap" style={{ fontSize: 12, color: 'var(--ink-2)' }}>Ver todos →</button>
            </div>
            {recentTx.slice(0, 5).map((t, i) => (
              <React.Fragment key={t.id}>
                <TransactionRow t={t} dense onClick={() => navigate('new', { editId: t.id })} />
                {i < 4 && <hr className="pf-hr" />}
              </React.Fragment>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADD / EDIT TRANSACTION  (writes to PFStore)
// ─────────────────────────────────────────────────────────────
function parseBRLInput(str) {
  if (typeof str !== 'string') return 0;
  let s = str.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function NewTransactionScreen({ navigate, frame, params = {} }) {
  const isMobile = frame === 'mobile';
  const state = usePF();
  const editing = params.editId ? state.transactions.find(t => t.id === params.editId) : null;

  const [type, setType] = React.useState(editing ? (editing.amount > 0 ? 'income' : 'expense') : 'expense');
  const [amount, setAmount] = React.useState(editing ? PF_FMT.brl(Math.abs(editing.amount)).replace('R$ ', '') : '');
  const [category, setCategory] = React.useState(editing && editing.amount < 0 ? editing.cat : 'food');
  const [note, setNote] = React.useState(editing ? editing.name : '');

  const numericValue = parseBRLInput(amount);
  const canSave = numericValue > 0 && note.trim().length > 0;

  function save() {
    if (!canSave) return;
    const signed = type === 'income' ? numericValue : -numericValue;
    if (editing) {
      PFStore.actions.updateTransaction(editing.id, {
        amount: signed, name: note.trim(),
        cat: type === 'income' ? 'income' : category,
        type,
      });
    } else {
      PFStore.actions.addTransaction({ amount: signed, name: note.trim(), cat: category });
    }
    navigate('transactions');
  }

  const wrapStyle = isMobile
    ? { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }
    : { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', maxWidth: 720, margin: '0 auto', padding: '40px 48px' };

  return (
    <div className="pf-noscroll" style={{ ...wrapStyle, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '8px 22px 0 22px' : '0 0 24px 0',
      }}>
        <button className="pf-tap" onClick={() => navigate(editing ? 'transactions' : 'dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)', fontSize: 14 }}>
          <I.X size={18} /> {!isMobile && <span>Cancelar</span>}
        </button>
        <Eyebrow>{editing ? 'Editar lançamento' : 'Novo lançamento'}</Eyebrow>
        <div style={{ width: isMobile ? 24 : 72 }} />
      </div>

      {/* Type toggle */}
      <div style={{ padding: isMobile ? '32px 22px 0 22px' : '0', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: 'var(--surface-2)', borderRadius: 999, padding: 4,
          display: 'inline-flex', border: '1px solid var(--line)',
        }}>
          {[
            { id: 'expense', label: 'Despesa' },
            { id: 'income',  label: 'Receita' },
          ].map(t => (
            <button key={t.id} onClick={() => setType(t.id)} className="pf-tap" style={{
              padding: '10px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600,
              background: type === t.id ? 'var(--ink)' : 'transparent',
              color: type === t.id ? 'var(--bg)' : 'var(--ink-2)',
              transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Amount input — hero */}
      <div style={{ padding: isMobile ? '40px 22px 0 22px' : '40px 0 0 0', textAlign: 'center' }}>
        <Eyebrow style={{ marginBottom: 12 }}>Valor</Eyebrow>
        <div className="pf-serif" style={{
          fontSize: isMobile ? 60 : 92, lineHeight: 1,
          color: type === 'income' ? 'var(--positive)' : 'var(--ink)',
          letterSpacing: '-0.025em',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '0.42em', color: 'var(--ink-3)', marginRight: 8 }}>R$</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            autoFocus
            style={{
              width: `${Math.max(3, (amount || '0,00').length + 0.5)}ch`,
              maxWidth: '100%',
              font: 'inherit', color: 'inherit', textAlign: 'center',
              background: 'transparent', border: 'none', outline: 'none', padding: 0,
            }}
          />
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-3)' }}>BRL · digite o valor</div>
      </div>

      {/* Category picker (only for expense) */}
      {type === 'expense' && (
        <div style={{ padding: isMobile ? '36px 22px 0 22px' : '40px 0 0 0' }}>
          <Eyebrow style={{ marginBottom: 14 }}>Categoria</Eyebrow>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
            gap: 10,
          }}>
            {PF_CATEGORIES.map(c => {
              const Comp = I[c.icon];
              const active = category === c.id;
              return (
                <button key={c.id} onClick={() => setCategory(c.id)} className="pf-tap" style={{
                  padding: '14px 8px',
                  borderRadius: 'var(--radius)',
                  background: active ? 'var(--ink)' : 'var(--surface)',
                  color: active ? 'var(--bg)' : 'var(--ink)',
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}>
                  <Comp size={20} />
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Note + date */}
      <div style={{ padding: isMobile ? '24px 22px 0 22px' : '32px 0 0 0' }}>
        <Card pad={0}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Descrição</div>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={type === 'income' ? 'Ex.: Salário, freelance...' : 'Ex.: Mercado, Uber...'} style={{ width: '100%', marginTop: 4, fontSize: 14 }} />
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Data</div>
              <div style={{ marginTop: 4, fontSize: 14 }}>Hoje · 22 mai 2026</div>
            </div>
            <I.Calendar size={18} style={{ color: 'var(--ink-3)' }} />
          </div>
        </Card>
      </div>

      {/* CTA */}
      <div style={{
        marginTop: 'auto', padding: isMobile ? '28px 22px 28px 22px' : '32px 0 0 0',
        display: 'flex', gap: 10,
      }}>
        {editing && (
          <Button size="lg" variant="danger" onClick={() => { PFStore.actions.deleteTransaction(editing.id); navigate('transactions'); }} icon={<I.Trash size={16} />}>
            Excluir
          </Button>
        )}
        <Button size="lg" variant="primary" full onClick={save} icon={<I.Check size={16} />} style={{ opacity: canSave ? 1 : 0.45, pointerEvents: canSave ? 'auto' : 'none' }}>
          {editing ? 'Salvar alterações' : (type === 'income' ? 'Registrar receita' : 'Registrar despesa')}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TRANSACTIONS LIST
// ─────────────────────────────────────────────────────────────
function TransactionsScreen({ navigate, frame }) {
  const isMobile = frame === 'mobile';
  const state = usePF();
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const all = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  let filtered = all;
  if (filter === 'income') filtered = filtered.filter(t => t.amount > 0);
  if (filter === 'expense') filtered = filtered.filter(t => t.amount < 0);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(t => {
      const catName = (PF_CATEGORIES.find(c => c.id === t.cat)?.name || '').toLowerCase();
      return t.name.toLowerCase().includes(q) || catName.includes(q);
    });
  }

  // Group by date
  const groups = {};
  filtered.forEach(t => {
    const k = PF_FMT.groupDate(t.date);
    if (!groups[k]) groups[k] = [];
    groups[k].push(t);
  });

  const totalExpense = all.filter(t => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
  const totalIncome  = all.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0);

  return (
    <div className="pf-noscroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: isMobile ? '12px 22px 100px 22px' : '40px 48px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <Eyebrow>Maio · 2026</Eyebrow>
            <h1 className="pf-serif" style={{ fontSize: isMobile ? 36 : 56, margin: '4px 0 0 0', lineHeight: 1 }}>
              <em style={{ fontStyle: 'italic' }}>Movimentos</em>
            </h1>
          </div>
          {!isMobile && (
            <Button variant="primary" icon={<I.Plus size={14} />} onClick={() => navigate('new')}>Lançar movimento</Button>
          )}
        </div>

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <Card pad={16}>
            <Eyebrow style={{ color: 'var(--positive)' }}>Entradas</Eyebrow>
            <div className="pf-serif" style={{ fontSize: isMobile ? 26 : 32, marginTop: 6 }}>+{PF_FMT.brl(totalIncome)}</div>
          </Card>
          <Card pad={16}>
            <Eyebrow style={{ color: 'var(--negative)' }}>Saídas</Eyebrow>
            <div className="pf-serif" style={{ fontSize: isMobile ? 26 : 32, marginTop: 6 }}>−{PF_FMT.brl(totalExpense)}</div>
          </Card>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 999,
          background: 'var(--surface)', border: '1px solid var(--line)',
          marginBottom: 14,
        }}>
          <I.Search size={16} style={{ color: 'var(--ink-3)' }} />
          <input
            placeholder="Buscar por nome, categoria..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 14 }}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }} className="pf-noscroll">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Todas</Chip>
          <Chip active={filter === 'expense'} onClick={() => setFilter('expense')}>Despesas</Chip>
          <Chip active={filter === 'income'} onClick={() => setFilter('income')}>Receitas</Chip>
          <Chip>Por categoria</Chip>
          <Chip>Este mês</Chip>
        </div>

        {/* Groups */}
        {Object.entries(groups).map(([date, items]) => (
          <div key={date} style={{ marginTop: 22 }}>
            <Eyebrow style={{ marginBottom: 6 }}>{date}</Eyebrow>
            <Card pad="0 18px">
              {items.map((t, i) => (
                <React.Fragment key={t.id}>
                  <TransactionRow t={t} onClick={() => navigate('new', { editId: t.id })} />
                  {i < items.length - 1 && <hr className="pf-hr" />}
                </React.Fragment>
              ))}
            </Card>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
            Nenhum movimento encontrado.
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen, DashboardScreen, NewTransactionScreen, TransactionsScreen, Logomark, parseBRLInput });
