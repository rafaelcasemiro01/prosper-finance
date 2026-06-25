'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { Calculator } from './Calculator';

// Marca
function Logomark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14.5" stroke="var(--accent)" strokeWidth="2" />
      <path d="M12.5 23V9H16a3.5 3.5 0 0 1 0 7h-3.5" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Ícones de navegação (stroke 1.7)
const Icons: Record<string, ReactNode> = {
  dashboard: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  transactions: <><path d="M8 4v13M8 4 5 7M8 4l3 3M16 20V7M16 20l-3-3M16 20l3-3" /></>,
  accounts: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 9.5h19M6 15h4" /></>,
  analytics: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  goals: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>,
  ai: <path d="M5 3v4M3 5h4M19 13v6M16 16h6M11 3l1.6 4.4L17 9l-4.4 1.6L11 15l-1.6-4.4L5 9l4.4-1.6z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8 2 2 0 1 1-2.8 2.8 1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0 1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3 2 2 0 1 1-2.8-2.8 1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8 2 2 0 1 1 2.8-2.8 1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0 1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3 2 2 0 1 1 2.8 2.8 1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4z" /></>,
};

function NavIcon({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {Icons[id]}
    </svg>
  );
}

const NAV = [
  { href: '/dashboard', id: 'dashboard', label: 'Dashboard', short: 'Início' },
  { href: '/transactions', id: 'transactions', label: 'Movimentos', short: 'Movim.' },
  { href: '/accounts', id: 'accounts', label: 'Contas & Cartões', short: 'Contas' },
  { href: '/analytics', id: 'analytics', label: 'Análises', short: 'Análises' },
  { href: '/goals', id: 'goals', label: 'Metas', short: 'Metas' },
  { href: '/ai', id: 'ai', label: 'Consultor IA', short: 'IA' },
  { href: '/settings', id: 'settings', label: 'Configurações', short: 'Config.' },
];

// Itens da barra inferior no mobile (5 principais)
const BOTTOM = ['/dashboard', '/transactions', '/accounts', '/goals', '/ai'];

export function AppShell({
  active, children, width = 'wide',
}: { active: string; children: ReactNode; width?: 'wide' | 'narrow' }) {
  const bottomItems = NAV.filter((n) => BOTTOM.includes(n.href));

  return (
    <div className="app">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <Logomark />
          <span className="sidebar__brandname">Prosper</span>
        </div>
        {NAV.map((n, i) => {
          const isActive = active === n.href;
          return (
            <motion.div
              key={n.href}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={n.href} className={`nav-link${isActive ? ' is-active' : ''}`} style={{ position: 'relative' }}>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 3, borderRadius: 999, background: 'var(--accent)' }}
                  />
                )}
                <NavIcon id={n.id} />
                <span>{n.label}</span>
              </Link>
            </motion.div>
          );
        })}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="mobile-topbar">
        <Link href="/dashboard" className="mobile-topbar__brand">
          <Logomark size={24} />
          <span className="mobile-topbar__brandname">Prosper</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeToggle compact />
          <Link href="/settings" aria-label="Configurações" className={`nav-link${active === '/settings' ? ' is-active' : ''}`} style={{ width: 40, height: 40, padding: 0, justifyContent: 'center' }}>
            <NavIcon id="settings" />
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className={`app-main app-main--${width}`}>{children}</main>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottomnav">
        {bottomItems.map((n) => {
          const isActive = active === n.href;
          return (
            <Link key={n.href} href={n.href} className={`mnav${isActive ? ' is-active' : ''}`} style={{ position: 'relative' }}>
              <NavIcon id={n.id} />
              <span>{n.short}</span>
            </Link>
          );
        })}
      </nav>
      {/* Calculadora flutuante (em todas as telas) */}
      <Calculator />
    </div>
  );
}
