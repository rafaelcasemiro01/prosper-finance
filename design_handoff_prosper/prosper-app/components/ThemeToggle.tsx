'use client';

import { useEffect, useState } from 'react';

// Toggle claro/escuro com persistência em localStorage.
// O tema inicial é aplicado pelo script no-flash em layout.tsx.
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('pf-theme', next); } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#0A0E16' : '#FAF8F1');
  }

  // Evita mismatch de hidratação
  const isDark = mounted && theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: compact ? 40 : undefined, height: 40, padding: compact ? 0 : '0 14px',
        borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface)',
        color: 'var(--ink-2)', fontSize: 13, fontWeight: 500,
        transition: 'background .15s ease, color .15s ease',
      }}
    >
      {isDark ? (
        // sol
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // lua
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
      {!compact && <span>{isDark ? 'Claro' : 'Escuro'}</span>}
    </button>
  );
}
