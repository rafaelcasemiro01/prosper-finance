// screens-2.jsx — Analytics, Goals, Settings

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────
function AnalyticsScreen({ navigate, frame }) {
  const isMobile = frame === 'mobile';
  const state = usePF();
  const [period, setPeriod] = React.useState('6m');
  const [hoverCat, setHoverCat] = React.useState(null);

  const cats = PFSelect.categoryBreakdown(state);
  const totalSpend = cats.reduce((a, b) => a + b.amount, 0);
  const topCats = [...cats].sort((a, b) => b.amount - a.amount);
  const income = PFSelect.monthIncome(state);
  const expense = PFSelect.monthExpense(state);
  const net = income - expense;
  const savingsRate = PFSelect.savingsRate(state);
  const series = PFSelect.series(state);

  return (
    <div className="pf-noscroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: isMobile ? '12px 22px 100px 22px' : '40px 48px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
          <div>
            <Eyebrow>Visão geral</Eyebrow>
            <h1 className="pf-serif" style={{ fontSize: isMobile ? 36 : 56, margin: '4px 0 0 0', lineHeight: 1 }}>
              <em style={{ fontStyle: 'italic' }}>Análises</em>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: '1m', label: '1M' },
              { id: '6m', label: '6M' },
              { id: '1y', label: '1A' },
              { id: 'all', label: 'Tudo' },
            ].map(p => (
              <Chip key={p.id} active={period === p.id} onClick={() => setPeriod(p.id)}>{p.label}</Chip>
            ))}
          </div>
        </div>

        {/* Hero: net savings */}
        <Card pad={isMobile ? 22 : 32} style={{ marginBottom: 16 }}>
          <Eyebrow>Você economizou em maio</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
            <div>
              <Amount value={net} size={isMobile ? 64 : 96} />
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--accent)' }}>
                <I.Trend size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                {savingsRate.toFixed(1).replace('.', ',')}% de taxa de poupança — acima da média de 22%
              </div>
            </div>
            <div style={{ flex: '1 1 280px', maxWidth: 480 }}>
              <BarChart income={series.income} expense={series.expense} labels={series.labels} height={isMobile ? 140 : 180} />
            </div>
          </div>
        </Card>

        {/* Categories: donut + list */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.4fr', gap: 16, marginBottom: 16 }}>
          <Card pad={isMobile ? 22 : 28}>
            <Eyebrow>Por categoria · Maio</Eyebrow>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
              <Donut
                data={cats}
                size={isMobile ? 200 : 220}
                thickness={isMobile ? 22 : 26}
                centerLabel={hoverCat ? hoverCat.name : 'Total'}
                centerValue={hoverCat ? PF_FMT.brl(hoverCat.amount) : PF_FMT.brl(totalSpend)}
                onHoverSlice={setHoverCat}
              />
            </div>
          </Card>

          <Card pad={isMobile ? 22 : 28}>
            <Eyebrow>Detalhe</Eyebrow>
            <div style={{ marginTop: 12 }}>
              {topCats.map((c, i) => {
                const pct = totalSpend ? (c.amount / totalSpend) * 100 : 0;
                const Comp = I[c.icon] || I.Wallet;
                return (
                  <div key={c.id} style={{ padding: '14px 0', borderBottom: i < topCats.length - 1 ? '1px solid var(--line)' : 'none' }}
                    onMouseEnter={() => setHoverCat(c)}
                    onMouseLeave={() => setHoverCat(null)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                        <Comp size={16} style={{ color: 'var(--ink-2)' }} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="pf-mono" style={{ fontSize: 13, fontWeight: 600 }}>{PF_FMT.brl(c.amount)}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{pct.toFixed(1).replace('.', ',')}%</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <ProgressBar pct={pct} height={3} color={c.color} animate={false} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Comparison row */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
          <Card pad={20}>
            <Eyebrow>Vs. abril</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 32, fontStyle: 'italic', marginTop: 6, color: 'var(--positive)' }}>
              −12%
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>
              R$ 567 a menos em despesas
            </div>
          </Card>
          <Card pad={20}>
            <Eyebrow>Maior despesa</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 6 }}>
              Aluguel
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>
              R$ 2.200 · 52% das despesas
            </div>
          </Card>
          <Card pad={20}>
            <Eyebrow>Categoria em alta</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 6 }}>
              Educação
            </div>
            <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>
              +R$ 80 vs abril
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GOALS
// ─────────────────────────────────────────────────────────────
function GoalsScreen({ navigate, frame, params = {} }) {
  const isMobile = frame === 'mobile';
  const state = usePF();
  const goals = state.goals;
  const [selectedId, setSelectedId] = React.useState(params.openGoal || null);
  const [sheet, setSheet] = React.useState(false);

  const totalGoals = goals.reduce((a, b) => a + b.target, 0);
  const totalSaved = goals.reduce((a, b) => a + b.current, 0);
  const overallPct = totalGoals ? (totalSaved / totalGoals) * 100 : 0;

  const selectedGoal = selectedId ? goals.find(g => g.id === selectedId) : null;
  if (selectedGoal) {
    return <GoalDetail goal={selectedGoal} back={() => setSelectedId(null)} frame={frame} />;
  }

  return (
    <div className="pf-noscroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: isMobile ? '12px 22px 100px 22px' : '40px 48px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <Eyebrow>Sua jornada</Eyebrow>
            <h1 className="pf-serif" style={{ fontSize: isMobile ? 36 : 56, margin: '4px 0 0 0', lineHeight: 1 }}>
              <em style={{ fontStyle: 'italic' }}>Metas</em> e sonhos
            </h1>
          </div>
          {!isMobile && (
            <Button variant="primary" icon={<I.Plus size={14} />} onClick={() => setSheet(true)}>Nova meta</Button>
          )}
        </div>

        {/* Hero progress */}
        <Card pad={isMobile ? 24 : 36} style={{ marginBottom: 18, background: 'linear-gradient(150deg, var(--ink) 0%, color-mix(in oklab, var(--ink) 86%, var(--accent)) 100%)', color: 'var(--bg)', border: 'none', boxShadow: 'var(--shadow-2)', position: 'relative', overflow: 'hidden' }} elevate={false}>
          <div className="pf-dots" style={{ position: 'absolute', inset: 0, opacity: 0.07 }} />
          <div style={{ position: 'absolute', top: -50, right: -20, width: 200, height: 200, borderRadius: '50%', background: 'var(--highlight)', opacity: 0.22, filter: 'blur(56px)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <Eyebrow style={{ color: 'var(--ink-3)' }}>Progresso total</Eyebrow>
                <div className="pf-serif" style={{ fontSize: isMobile ? 48 : 72, fontStyle: 'italic', marginTop: 8, color: 'var(--highlight)', lineHeight: 1 }}>
                  {overallPct.toFixed(0)}%
                </div>
                <div style={{ marginTop: 8, fontSize: 14, color: 'var(--ink-3)' }}>
                  <span style={{ color: 'var(--bg)' }}>{PF_FMT.brl(totalSaved)}</span> de {PF_FMT.brl(totalGoals)} guardados
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                <div>
                  <div style={{ color: 'var(--ink-3)' }}>Metas ativas</div>
                  <div className="pf-serif" style={{ fontSize: 32, fontStyle: 'italic', color: 'var(--bg)', marginTop: 4 }}>{goals.length}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--ink-3)' }}>Modo casal</div>
                  <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar initials="LM" size={28} bg="var(--bg)" color="var(--ink)" />
                    <Avatar initials="M" size={28} bg="var(--highlight)" color="var(--highlight-ink)" />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <ProgressBar pct={overallPct} height={4} color="var(--highlight)" track="rgba(255,255,255,0.08)" />
            </div>
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--highlight)', fontStyle: 'italic' }} className="pf-serif">
              "Cada real guardado é um passo na direção certa."
            </div>
          </div>
        </Card>

        {/* Goal list */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
          {goals.map((g) => {
            const pct = g.target ? (g.current / g.target) * 100 : 0;
            const months = Math.max(0, Math.ceil((g.target - g.current) / (g.monthly || 1)));
            return (
              <Card key={g.id} pad={isMobile ? 22 : 26} onClick={() => setSelectedId(g.id)} className="pf-tap">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28, color: g.color }}>{g.emoji}</div>
                  {g.shared && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-3)', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: 999 }}>
                      <I.Users size={12} /> Casal
                    </div>
                  )}
                </div>
                <div className="pf-serif" style={{ fontSize: 24, marginTop: 14, lineHeight: 1.15 }}>{g.name}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-3)' }}>{g.note}</div>

                <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div className="pf-serif" style={{ fontSize: 42, fontStyle: 'italic', color: g.color, lineHeight: 1 }}>
                    {pct.toFixed(0)}<span style={{ fontSize: 20 }}>%</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--ink-3)' }}>
                    em {months} meses
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <ProgressBar pct={pct} height={4} color={g.color} />
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--ink-2)' }}>{PF_FMT.brl(g.current)}</span>
                  <span style={{ color: 'var(--ink-3)' }}>de {PF_FMT.brl(g.target)}</span>
                </div>
              </Card>
            );
          })}
          {/* Add new goal */}
          <button onClick={() => setSheet(true)} className="pf-tap" style={{
            background: 'transparent', border: '1px dashed var(--ink-4)',
            borderRadius: 'var(--radius-lg)', padding: isMobile ? 22 : 26,
            color: 'var(--ink-3)', display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', minHeight: 180,
            cursor: 'pointer',
          }}>
            <I.Plus size={28} />
            <div className="pf-serif" style={{ fontSize: 22, marginTop: 'auto', fontStyle: 'italic', textAlign: 'left' }}>
              Criar nova meta
            </div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Defina um sonho e o caminho até ele</div>
          </button>
        </div>
      </div>
      {sheet && <NewGoalSheet isMobile={isMobile} onClose={() => setSheet(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GOAL DETAIL
// ─────────────────────────────────────────────────────────────
function GoalDetail({ goal, back, frame }) {
  const isMobile = frame === 'mobile';
  const [aporte, setAporte] = React.useState(false);
  const pct = goal.target ? (goal.current / goal.target) * 100 : 0;
  const months = Math.max(0, Math.ceil((goal.target - goal.current) / (goal.monthly || 1)));
  const milestones = [
    { pct: 25,  label: 'Início da jornada', achieved: pct >= 25 },
    { pct: 50,  label: 'Metade do caminho', achieved: pct >= 50 },
    { pct: 75,  label: 'Reta final',         achieved: pct >= 75 },
    { pct: 100, label: 'Sonho realizado',    achieved: pct >= 100 },
  ];

  return (
    <div className="pf-noscroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: isMobile ? '12px 22px 100px 22px' : '40px 48px', maxWidth: 900, margin: '0 auto' }}>
        {/* Back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={back} className="pf-tap" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)', fontSize: 13 }}>
            <I.ArrowLeft size={16} /> Voltar para metas
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="secondary" icon={<I.Plus size={14} />} onClick={() => setAporte(true)}>Registrar aporte</Button>
            <button className="pf-tap" onClick={() => { if (confirm('Excluir esta meta?')) { PFStore.actions.deleteGoal(goal.id); back(); } }} aria-label="Excluir meta" style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>
              <I.Trash size={15} />
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 56, color: goal.color }}>{goal.emoji}</div>
          <h1 className="pf-serif" style={{ fontSize: isMobile ? 48 : 72, margin: '14px 0 0 0', lineHeight: 0.95 }}>
            {goal.name.split(' ').slice(0, -1).join(' ')}{' '}
            <em style={{ fontStyle: 'italic', color: goal.color }}>{goal.name.split(' ').slice(-1)}</em>
          </h1>
          <p style={{ marginTop: 12, fontSize: 16, color: 'var(--ink-2)' }}>{goal.note}</p>
        </div>

        {/* Big progress */}
        <Card pad={isMobile ? 24 : 36} style={{ marginBottom: 14, background: goal.color, color: '#fff', border: 'none' }}>
          <Eyebrow style={{ color: 'rgba(255,255,255,0.6)' }}>Você está</Eyebrow>
          <div className="pf-serif" style={{ fontSize: isMobile ? 88 : 144, fontStyle: 'italic', marginTop: 4, lineHeight: 0.9, color: '#fff' }}>
            {pct.toFixed(0)}%
          </div>
          <div className="pf-serif" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 6, color: 'rgba(255,255,255,0.85)' }}>
            mais perto do seu sonho.
          </div>
          <div style={{ marginTop: 28 }}>
            <ProgressBar pct={pct} height={6} color="#fff" track="rgba(255,255,255,0.15)" />
          </div>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
            <span><span style={{ color: '#fff' }}>{PF_FMT.brl(goal.current)}</span> guardados</span>
            <span>Faltam {PF_FMT.brl(goal.target - goal.current)}</span>
          </div>
        </Card>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <Card pad={16}>
            <Eyebrow>Mensal</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 6 }}>{PF_FMT.brl(goal.monthly)}</div>
          </Card>
          <Card pad={16}>
            <Eyebrow>Tempo</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 6 }}>{months} <span style={{ fontSize: 14, fontStyle: 'normal' }}>meses</span></div>
          </Card>
          <Card pad={16}>
            <Eyebrow>Meta em</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 6 }}>Dez 26</div>
          </Card>
          <Card pad={16}>
            <Eyebrow>Modo</Eyebrow>
            <div className="pf-serif" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 6 }}>{goal.shared ? 'Casal' : 'Individual'}</div>
          </Card>
        </div>

        {/* Milestones */}
        <Card pad={isMobile ? 22 : 28}>
          <Eyebrow>Marcos da jornada</Eyebrow>
          <div style={{ marginTop: 18, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 11, top: 8, bottom: 8, width: 1, background: 'var(--line)' }} />
            {milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', position: 'relative' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: m.achieved ? goal.color : 'var(--surface)',
                  border: m.achieved ? 'none' : '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0, zIndex: 1,
                }}>
                  {m.achieved && <I.Check size={12} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: m.achieved ? 500 : 400, color: m.achieved ? 'var(--ink)' : 'var(--ink-2)' }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{m.pct}% · {PF_FMT.brl(goal.target * m.pct / 100)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {aporte && <ContributeSheet goal={goal} isMobile={isMobile} onClose={() => setAporte(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────
function SettingsScreen({ navigate, frame, theme, setTheme }) {
  const isMobile = frame === 'mobile';
  const state = usePF();
  const profile = state.profile;
  const settings = state.settings;
  const couple = settings.coupleMode;
  const notif = settings.notif;
  const biometric = settings.biometric;
  const setCouple = (v) => PFStore.actions.updateSettings({ coupleMode: v });
  const setNotif = (v) => PFStore.actions.updateSettings({ notif: v });
  const setBiometric = (v) => PFStore.actions.updateSettings({ biometric: v });
  const [editing, setEditing] = React.useState(false);

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <Eyebrow style={{ marginBottom: 10 }}>{title}</Eyebrow>
      <Card pad={0}>{children}</Card>
    </div>
  );

  const Row = ({ icon, label, hint, right, onClick, last }) => (
    <div onClick={onClick} className={onClick ? 'pf-tap' : ''} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 18px',
      borderBottom: last ? 'none' : '1px solid var(--line-soft)',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      {icon && <div style={{ color: 'var(--ink-2)' }}>{icon}</div>}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{hint}</div>}
      </div>
      {right}
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 26, borderRadius: 999,
      background: value ? 'var(--accent)' : 'var(--line)',
      position: 'relative', transition: 'background 0.2s',
      cursor: 'pointer',
    }}>
      <span style={{
        position: 'absolute', top: 3, left: value ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );

  return (
    <div className="pf-noscroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: isMobile ? '12px 22px 100px 22px' : '40px 48px', maxWidth: 760, margin: '0 auto' }}>
        <Eyebrow>Sua conta</Eyebrow>
        <h1 className="pf-serif" style={{ fontSize: isMobile ? 36 : 56, margin: '4px 0 30px 0', lineHeight: 1 }}>
          <em style={{ fontStyle: 'italic' }}>Configurações</em>
        </h1>

        {/* Profile card */}
        <Card pad={isMobile ? 22 : 28} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar initials={profile.avatar} size={isMobile ? 56 : 72} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pf-serif" style={{ fontSize: isMobile ? 22 : 28, lineHeight: 1.1 }}>{profile.fullName}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.email} · Plano {profile.plan}</div>
            </div>
            <button className="pf-tap" onClick={() => setEditing(true)} style={{ color: 'var(--ink-2)', fontSize: 13, padding: '6px 12px', borderRadius: 999, border: '1px solid var(--line)' }}>Editar</button>
          </div>
        </Card>

        <Section title="Aparência">
          <Row
            icon={<I.Spark size={18} />}
            label="Tema"
            hint={theme === 'dark' ? 'Modo escuro ativo' : 'Modo claro ativo'}
            right={
              <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 999, padding: 3, border: '1px solid var(--line)' }}>
                {['light', 'dark'].map(t => (
                  <button key={t} onClick={() => setTheme && setTheme(t)} style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                    background: theme === t ? 'var(--ink)' : 'transparent',
                    color: theme === t ? 'var(--bg)' : 'var(--ink-2)',
                    cursor: 'pointer',
                  }}>{t === 'light' ? 'Claro' : 'Escuro'}</button>
                ))}
              </div>
            }
            last
          />
        </Section>

        <Section title="Finanças">
          <Row
            icon={<I.Users size={18} />}
            label="Modo casal"
            hint={couple ? 'Compartilhando finanças com Marina' : 'Apenas você'}
            right={<Toggle value={couple} onChange={setCouple} />}
          />
          <Row
            icon={<I.Globe size={18} />}
            label="Moeda principal"
            hint="Brasil · Real (R$)"
            right={<I.ArrowRight size={16} style={{ color: 'var(--ink-3)' }} />}
            onClick={() => {}}
          />
          <Row
            icon={<I.Card size={18} />}
            label="Contas conectadas"
            hint={`${state.accounts.filter(a => a.kind === 'conta' || a.kind === 'investimento').length} contas · ${state.accounts.filter(a => a.kind === 'cartao').length} cartões · ${state.accounts.filter(a => a.kind === 'emprestimo').length} empréstimos`}
            right={<I.ArrowRight size={16} style={{ color: 'var(--ink-3)' }} />}
            onClick={() => navigate('accounts')}
            last
          />
        </Section>

        <Section title="Segurança">
          <Row
            icon={<I.Lock size={18} />}
            label="Biometria"
            hint="Face ID para acessar o app"
            right={<Toggle value={biometric} onChange={setBiometric} />}
          />
          <Row
            icon={<I.Bell size={18} />}
            label="Notificações"
            hint="Alertas de gastos, metas e dicas"
            right={<Toggle value={notif} onChange={setNotif} />}
            last
          />
        </Section>

        <Section title="Sobre">
          <Row icon={<I.Sparkles size={18} />} label="Consultor IA Prosper" hint="Conversas ilimitadas com IA" right={<I.ArrowRight size={16} style={{ color: 'var(--ink-3)' }} />} onClick={() => navigate('ai')} last />
        </Section>

        <button className="pf-tap" style={{
          width: '100%', padding: 18, color: 'var(--negative)', fontSize: 14, fontWeight: 500,
          border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
        }}>
          Sair da conta
        </button>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          PROSPER FINANCE · v0.9 BETA · 2026
        </div>
      </div>
      {editing && <EditProfileSheet isMobile={isMobile} profile={profile} onClose={() => setEditing(false)} />}
    </div>
  );
}

function EditProfileSheet({ isMobile, profile, onClose }) {
  const [fullName, setFullName] = React.useState(profile.fullName);
  const [email, setEmail] = React.useState(profile.email);
  function save() {
    const fn = fullName.trim() || profile.fullName;
    const initials = fn.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    PFStore.actions.updateProfile({ fullName: fn, name: fn.split(' ')[0], email: email.trim(), avatar: initials });
    onClose();
  }
  return (
    <PFModalShell isMobile={isMobile} onClose={onClose} title={<>Editar <em style={{ fontStyle: 'italic' }}>perfil</em></>}>
      <Eyebrow style={{ marginBottom: 8 }}>Nome completo</Eyebrow>
      <div style={{ padding: '11px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 14 }}>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', fontSize: 15 }} />
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>E-mail</Eyebrow>
      <div style={{ padding: '11px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 22 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={{ width: '100%', fontSize: 15 }} />
      </div>
      <Button variant="primary" full size="lg" onClick={save} icon={<I.Check size={16} />}>Salvar</Button>
    </PFModalShell>
  );
}

// ── Goal modals ─────────────────────────────────────────────────────────────
function PFModalShell({ isMobile, onClose, title, children }) {
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
          <div className="pf-serif" style={{ fontSize: 24 }}>{title}</div>
          <button className="pf-tap" onClick={onClose} style={{ color: 'var(--ink-3)' }}><I.X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ContributeSheet({ goal, isMobile, onClose }) {
  const [value, setValue] = React.useState(String(goal.monthly || '').replace('.', ','));
  const num = parseBRLInput(value);
  const canSave = num > 0;
  const after = Math.min(goal.target, goal.current + num);
  const afterPct = goal.target ? (after / goal.target) * 100 : 0;
  return (
    <PFModalShell isMobile={isMobile} onClose={onClose} title={<>Registrar <em style={{ fontStyle: 'italic' }}>aporte</em></>}>
      <Eyebrow style={{ marginBottom: 8 }}>Quanto você guardou para “{goal.name}”?</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 16 }}>
        <span style={{ color: 'var(--ink-3)', fontSize: 16 }}>R$</span>
        <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" placeholder="0,00" autoFocus style={{ flex: 1, fontSize: 20, fontWeight: 600 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[100, 250, 500, goal.monthly].filter(Boolean).map((v, i) => (
          <button key={i} className="pf-tap" onClick={() => setValue(String(v).replace('.', ','))} style={{
            flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 12, fontWeight: 600,
            background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--ink-2)',
          }}>+{PF_FMT.brl(v, { compact: true })}</button>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: 'var(--ink-3)' }}>Depois do aporte</span>
          <span style={{ color: goal.color, fontWeight: 600 }}>{Math.round(afterPct)}% · {PF_FMT.brl(after)}</span>
        </div>
        <ProgressBar pct={afterPct} height={6} color={goal.color} animate={false} />
      </div>
      <Button variant="primary" full size="lg" onClick={() => { PFStore.actions.contributeGoal(goal.id, num); onClose(); }} icon={<I.Check size={16} />} style={{ opacity: canSave ? 1 : 0.45, pointerEvents: canSave ? 'auto' : 'none' }}>
        Adicionar à meta
      </Button>
    </PFModalShell>
  );
}

function NewGoalSheet({ isMobile, onClose }) {
  const EMOJIS = ['✺', '◐', '◇', '⊙', '✦', '❂', '✈', '⌂'];
  const COLORS = ['#C8A02C', '#1F8A5B', '#B5642B', '#2E7D9A', '#8E5B8A', '#14203A'];
  const [name, setName] = React.useState('');
  const [target, setTarget] = React.useState('');
  const [current, setCurrent] = React.useState('');
  const [emoji, setEmoji] = React.useState(EMOJIS[0]);
  const [color, setColor] = React.useState(COLORS[0]);
  const [shared, setShared] = React.useState(false);

  const tNum = parseBRLInput(target);
  const cNum = parseBRLInput(current);
  const canSave = name.trim().length > 0 && tNum > 0 && cNum <= tNum;

  function save() {
    if (!canSave) return;
    PFStore.actions.addGoal({ name: name.trim(), target: tNum, current: cNum, emoji, color, shared, note: 'Meta criada por você.' });
    onClose();
  }

  const field = (label, val, setVal, ph, money) => (
    <div style={{ marginBottom: 14 }}>
      <Eyebrow style={{ marginBottom: 8 }}>{label}</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
        {money && <span style={{ color: 'var(--ink-3)', fontSize: 15 }}>R$</span>}
        <input value={val} onChange={(e) => setVal(e.target.value)} inputMode={money ? 'decimal' : 'text'} placeholder={ph} style={{ flex: 1, fontSize: 15, fontWeight: money ? 600 : 400 }} />
      </div>
    </div>
  );

  return (
    <PFModalShell isMobile={isMobile} onClose={onClose} title={<>Nova <em style={{ fontStyle: 'italic' }}>meta</em></>}>
      {field('Nome do sonho', name, setName, 'Ex.: Viagem, Reserva, Carro...')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {field('Objetivo', target, setTarget, '0,00', true)}
        {field('Já guardado', current, setCurrent, '0,00', true)}
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>Ícone</Eyebrow>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {EMOJIS.map(e => (
          <button key={e} onClick={() => setEmoji(e)} className="pf-tap" style={{
            width: 40, height: 40, borderRadius: 10, fontSize: 18,
            background: emoji === e ? 'var(--accent-soft)' : 'var(--surface-2)',
            border: '1px solid ' + (emoji === e ? 'var(--accent)' : 'var(--line)'),
            color: color,
          }}>{e}</button>
        ))}
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>Cor</Eyebrow>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} className="pf-tap" style={{
            width: 32, height: 32, borderRadius: '50%', background: c,
            border: color === c ? '2px solid var(--ink)' : '2px solid transparent',
            boxShadow: '0 0 0 1px var(--line)',
          }} />
        ))}
      </div>
      <button onClick={() => setShared(!shared)} className="pf-tap" style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', marginBottom: 20,
        padding: '12px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)',
      }}>
        <I.Users size={18} style={{ color: 'var(--ink-2)' }} />
        <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 500 }}>Meta do casal</span>
        <span style={{
          width: 44, height: 26, borderRadius: 999, position: 'relative',
          background: shared ? 'var(--accent)' : 'var(--line)', transition: 'background 0.2s',
        }}>
          <span style={{ position: 'absolute', top: 3, left: shared ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
        </span>
      </button>
      <Button variant="primary" full size="lg" onClick={save} icon={<I.Check size={16} />} style={{ opacity: canSave ? 1 : 0.45, pointerEvents: canSave ? 'auto' : 'none' }}>
        Criar meta
      </Button>
    </PFModalShell>
  );
}

Object.assign(window, { AnalyticsScreen, GoalsScreen, GoalDetail, SettingsScreen, NewGoalSheet, ContributeSheet });
