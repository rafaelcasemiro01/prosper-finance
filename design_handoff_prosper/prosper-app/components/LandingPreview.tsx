// LandingPreview — mockups estáticos da plataforma (frame de navegador com
// dashboard, gráfico de barras e anel de meta) usando os tokens reais.
// Sem hooks: seguro em Server Component.

function BarChart() {
  const bars = [
    { h: 42, e: 30 }, { h: 55, e: 38 }, { h: 40, e: 46 },
    { h: 62, e: 34 }, { h: 48, e: 40 }, { h: 70, e: 44 },
  ];
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, height: 120, alignItems: 'end' }}>
      {bars.map((b, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'end', gap: 3, height: 100, width: '100%', justifyContent: 'center' }}>
            <div style={{ width: '38%', height: `${b.h}%`, background: i === 5 ? 'var(--accent)' : 'var(--ink-4)', borderRadius: '4px 4px 0 0' }} />
            <div style={{ width: '38%', height: `${b.e}%`, background: 'var(--surface-2)', border: '1px solid var(--ink-4)', borderRadius: '4px 4px 0 0' }} />
          </div>
          <span style={{ fontSize: 9, color: 'var(--ink-3)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function GoalRing({ pct = 73 }: { pct?: number }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <svg width={92} height={92} viewBox="0 0 92 92" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="46" cy="46" r={r} fill="none" stroke="var(--line)" strokeWidth="9" />
      <circle cx="46" cy="46" r={r} fill="none" stroke="var(--accent)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`} />
    </svg>
  );
}

function MiniCat({ color, label, pct }: { color: string; label: string; pct: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />{label}
        </span>
        <span style={{ color: 'var(--ink-3)' }}>{pct}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: 'var(--line)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: color }} />
      </div>
    </div>
  );
}

export function LandingPreview() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
      {/* Browser frame */}
      <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-pop)', background: 'var(--surface)' }}>
        {/* Chrome bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)' }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#E0735E' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#E2B25C' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#5FC98A' }} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'var(--ink-3)' }}>app.prosper.finance/dashboard</div>
        </div>
        {/* Dashboard body */}
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', minHeight: 380 }}>
          {/* Sidebar */}
          <div style={{ background: 'var(--bg-2)', borderRight: '1px solid var(--line)', padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 14px' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>Prosper</span>
            </div>
            {['Dashboard', 'Movimentos', 'Contas', 'Análises', 'Metas', 'Consultor'].map((n, i) => (
              <div key={n} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12, fontWeight: i === 0 ? 600 : 400,
                background: i === 0 ? 'var(--surface)' : 'transparent', color: i === 0 ? 'var(--ink)' : 'var(--ink-3)',
                border: i === 0 ? '1px solid var(--line)' : '1px solid transparent' }}>{n}</div>
            ))}
          </div>
          {/* Content */}
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
              {/* Balance */}
              <div className="card" style={{ padding: 18, background: 'var(--surface)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
                <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600 }}>Patrimônio total</div>
                <div className="tnum" style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>R$ 42.870</div>
                <div style={{ marginTop: 12 }}><BarChart /></div>
              </div>
              {/* Goal */}
              <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--surface)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
                <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600, alignSelf: 'flex-start' }}>Meta · Europa</div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GoalRing pct={73} />
                  <span style={{ position: 'absolute', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>73%</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>R$ 10.950 / R$ 15.000</div>
              </div>
            </div>
            {/* Categories */}
            <div className="card" style={{ padding: 18, background: 'var(--surface)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
              <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 12 }}>Gastos por categoria</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <MiniCat color="var(--accent)" label="Moradia" pct={34} />
                <MiniCat color="#1F8A5B" label="Alimentação" pct={28} />
                <MiniCat color="#2E7D9A" label="Transporte" pct={15} />
                <MiniCat color="#8E5B8A" label="Lazer" pct={10} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', marginTop: 16 }}>
        Uma prévia do painel — no app tudo é interativo e com seus dados reais.
      </p>
    </div>
  );
}
