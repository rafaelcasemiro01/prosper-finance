import React from 'react';

// Lightweight UI primitives — port of the prototype's components.jsx.

export function Card({
  children, pad = 20, style, elevate = true, className = '',
}: { children: React.ReactNode; pad?: number | string; style?: React.CSSProperties; elevate?: boolean; className?: string }) {
  return (
    <div
      className={className}
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
  children, variant = 'primary', full, type = 'button', onClick, style, disabled, className = '',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost';
  full?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn--${variant}${full ? ' btn--block' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </button>
  );
}
