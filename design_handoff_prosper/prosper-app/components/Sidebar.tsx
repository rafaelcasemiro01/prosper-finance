import Link from 'next/link';

function Logomark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14.5" stroke="var(--accent)" strokeWidth="2" />
      <path
        d="M12.5 23V9H16a3.5 3.5 0 0 1 0 7h-3.5"
        stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Movimentos' },
  { href: '/accounts', label: 'Contas & Cartões' },
  { href: '/analytics', label: 'Análises' },
  { href: '/goals', label: 'Metas' },
  { href: '/ai', label: 'Consultor IA' },
  { href: '/settings', label: 'Configurações' },
];

export function Sidebar({ active }: { active: string }) {
  return (
    <aside
      style={{
        width: 240, flexShrink: 0, background: 'var(--bg-2)',
        borderRight: '1px solid var(--line)', padding: '24px 16px',
        display: 'flex', flexDirection: 'column', gap: 6, height: '100vh', position: 'sticky', top: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px 20px' }}>
        <Logomark />
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>Prosper</span>
      </div>
      {NAV.map((n) => {
        const on = active === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            style={{
              display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: 10,
              fontSize: 13.5, fontWeight: on ? 600 : 500,
              color: on ? 'var(--ink)' : 'var(--ink-2)',
              background: on ? 'var(--surface)' : 'transparent',
              border: `1px solid ${on ? 'var(--line)' : 'transparent'}`,
              boxShadow: on ? 'var(--shadow-1)' : 'none',
            }}
          >
            {n.label}
          </Link>
        );
      })}
    </aside>
  );
}
