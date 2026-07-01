'use client';

import { useState } from 'react';

// Demo interativo da plataforma para a landing: o visitante troca de aba e vê
// telas mockadas (com o visual real) sem precisar de conta.

type Tab = 'dashboard' | 'analises' | 'metas' | 'movimentos';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analises', label: 'Análises' },
  { id: 'metas', label: 'Metas' },
  { id: 'movimentos', label: 'Movimentos' },
];

export function LandingDemo() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-pop)', background: 'var(--surface)' }}>
        {/* Chrome bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)' }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#E0735E' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#E2B25C' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#5FC98A' }} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'var(--ink-3)' }}>app.prosper.finance/{tab}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', minHeight: 400 }}>
          {/* Sidebar navegável */}
          <div style={{ background: 'var(--bg-2)', borderRight: '1px solid var(--line)', padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ padding: '0 6px 14px', fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>Prosper</div>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ textAlign: 'left', padding: '9px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: tab === t.id ? 600 : 400,
                  background: tab === t.id ? 'var(--surface)' : 'transparent', color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
                  border: tab === t.id ? '1px solid var(--line)' : '1px solid transparent', cursor: 'pointer' }}>
                {t.label}
              </button>
            ))}
            <div style={{ marginTop: 'auto', padding: '10px 8px', fontSize: 11, color: 'var(--ink-3)' }}>👆 Clique para navegar</div>
          </div>

          {/* Conteúdo da aba */}
          <div key={tab} className="anim-fade-up" style={{ padding: 18, background: 'var(--bg)' }}>
            {tab === 'dashboard' && <DemoDashboard />}
            {tab === 'analises' && <DemoAnalises />}
            {tab === 'metas' && <DemoMetas />}
            {tab === 'movimentos' && <DemoMovimentos />}
          </div>
        </div>
      </div>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', marginTop: 16 }}>
        Demonstração interativa · clique nas abas para explorar. No app, tudo é real e com seus dados.
      </p>
    </div>
  );
}

const box: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow-1)' };
const eyebrow: React.CSSProperties = { fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600 };

function Bars() {
  const bars = [{ h: 42, e: 30 }, { h: 55, e: 38 }, { h: 40, e: 46 }, { h: 62, e: 34 }, { h: 48, e: 40 }, { h: 70, e: 44 }];
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, height: 110, alignItems: 'end' }}>
      {bars.map((b, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'end', gap: 3, height: 90, width: '100%', justifyContent: 'center' }}>
            <div className="anim-fade-up" style={{ width: '38%', height: `${b.h}%`, background: i === 5 ? 'var(--accent)' : 'var(--ink-4)', borderRadius: '4px 4px 0 0', animationDelay: `${i * 50}ms` }} />
            <div className="anim-fade-up" style={{ width: '38%', height: `${b.e}%`, background: 'var(--surface-2)', border: '1px solid var(--ink-4)', borderRadius: '4px 4px 0 0', animationDelay: `${i * 50 + 25}ms` }} />
          </div>
          <span style={{ fontSize: 9, color: 'var(--ink-3)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Ring({ pct, color = 'var(--accent)', size = 92 }: { pct: number; color?: string; size?: number }) {
  const r = size / 2 - 12, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />
      </svg>
      <span style={{ position: 'absolute', fontSize: size * 0.22, fontWeight: 700, color }}>{pct}%</span>
    </div>
  );
}

function Cat({ color, label, pct }: { color: string; label: string; pct: number }) {
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

function DemoDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
        <div style={box}>
          <div style={eyebrow}>Patrimônio total · BRL</div>
          <div className="tnum" style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>R$ 42.870</div>
          <div style={{ marginTop: 12 }}><Bars /></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={box}>
            <div style={{ ...eyebrow, color: 'var(--positive)' }}>Saldo · contas</div>
            <div className="tnum" style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>R$ 8.412</div>
          </div>
          <div style={box}>
            <div style={{ ...eyebrow, color: 'var(--negative)' }}>Faturas em aberto</div>
            <div className="tnum" style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>R$ 1.240</div>
          </div>
        </div>
      </div>
      <div style={box}>
        <div style={eyebrow}>Gastos por categoria</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginTop: 12 }}>
          <Cat color="var(--accent)" label="Moradia" pct={34} />
          <Cat color="#1F8A5B" label="Alimentação" pct={28} />
          <Cat color="#2E7D9A" label="Transporte" pct={15} />
          <Cat color="#8E5B8A" label="Lazer" pct={10} />
        </div>
      </div>
    </div>
  );
}

function DemoAnalises() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={box}>
        <div style={eyebrow}>Saldo do mês</div>
        <div className="tnum" style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: 'var(--positive)' }}>+ R$ 4.286</div>
        <div style={{ marginTop: 12 }}><Bars /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 12 }}>
        <div style={{ ...box, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ ...eyebrow, alignSelf: 'flex-start' }}>Por categoria</div>
          <Ring pct={62} />
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Moradia lidera</div>
        </div>
        <div style={box}>
          <div style={eyebrow}>Por forma de pagamento</div>
          <div style={{ marginTop: 12 }}>
            <Cat color="#1F8A5B" label="Pix" pct={44} />
            <Cat color="#2E7D9A" label="Débito" pct={31} />
            <Cat color="var(--accent)" label="Crédito" pct={18} />
            <Cat color="#8E5B8A" label="Dinheiro" pct={7} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoMetas() {
  const goals = [
    { name: 'Viagem Europa', pct: 73, val: 'R$ 10.950 / R$ 15.000', color: 'var(--accent)' },
    { name: 'Reserva emergência', pct: 61, val: 'R$ 18.300 / R$ 30.000', color: '#1F8A5B' },
    { name: 'Carro novo', pct: 16, val: 'R$ 12.500 / R$ 80.000', color: '#2E7D9A' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...box, textAlign: 'center' }}>
        <div style={eyebrow}>Progresso total</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--accent)', marginTop: 6 }}>52%</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>R$ 41.750 de R$ 125.000 guardados</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {goals.map((g) => (
          <div key={g.name} style={{ ...box, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Ring pct={g.pct} color={g.color} size={78} />
            <div style={{ fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{g.name}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', textAlign: 'center' }}>{g.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoMovimentos() {
  const rows = [
    { n: 'Mercado Pão de Açúcar', c: 'Alimentação · Pix', v: '−R$ 287,40', pos: false },
    { n: 'Salário', c: 'Receita', v: '+R$ 8.500,00', pos: true },
    { n: 'Uber', c: 'Transporte · Débito', v: '−R$ 32,50', pos: false },
    { n: 'iFood', c: 'Alimentação · Crédito', v: '−R$ 127,80', pos: false },
    { n: 'Freelance', c: 'Receita', v: '+R$ 1.200,00', pos: true },
    { n: 'Aluguel', c: 'Moradia · Pix', v: '−R$ 2.200,00', pos: false },
  ];
  return (
    <div style={box}>
      <div style={eyebrow}>Movimentos recentes</div>
      <div style={{ marginTop: 8 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: r.pos ? 'var(--accent-soft)' : 'var(--surface-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.pos ? 'var(--accent)' : 'var(--ink-2)', fontWeight: 700, fontSize: 13 }}>{r.pos ? '↓' : r.n[0]}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.n}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{r.c}</div>
              </div>
            </div>
            <div className="tnum" style={{ fontSize: 12.5, fontWeight: 600, color: r.pos ? 'var(--positive)' : 'var(--ink)', whiteSpace: 'nowrap' }}>{r.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
