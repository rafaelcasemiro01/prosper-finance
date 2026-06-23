import React from 'react';

// Lightweight UI primitives — port of the prototype's components.jsx.

export function Card({
  children, pad = 20, style, elevate = true,
}: { children: React.ReactNode; pad?: number | string; style?: React.CSSProperties; elevate?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: elevate ? 'var(--shadow-1)' : 'none',
        padding: pad,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="eyebrow" style={style}>{children}</div>;
}

export function ProgressBar({
  pct, height = 6, color = 'var(--accent)', track = 'var(--line)',
}: { pct: number; height?: number; color?: string; track?: string }) {
  const w = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ height, background: track, borderRadius: 999, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 999 }} />
    </div>
  );
}

export function Button({
  children, variant = 'primary', full, type = 'button', onClick, style,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'secondary';
  full?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const v = {
    primary:   { bg: 'var(--ink)', color: 'var(--bg)', border: 'transparent' },
    accent:    { bg: 'var(--accent)', color: 'var(--accent-ink)', border: 'transparent' },
    secondary: { bg: 'transparent', color: 'var(--ink)', border: 'var(--ink-4)' },
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        height: 48, padding: '0 22px', borderRadius: 999, fontSize: 14, fontWeight: 600,
        background: v.bg, color: v.color, border: `1px solid ${v.border}`,
        width: full ? '100%' : 'auto', boxShadow: variant !== 'secondary' ? 'var(--shadow-1)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
