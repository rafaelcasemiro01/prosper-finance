// components.jsx — shared UI primitives for Prosper Finance
// Card, Button, ProgressBar, Sparkline, BarChart, DonutChart, CategoryAvatar, etc.

// ─────────────────────────────────────────────────────────────
// Amount display — large currency figure with subtle cents/currency
// ─────────────────────────────────────────────────────────────
function Amount({ value, size = 56, currency = 'R$', muted = false, sign = false, weight = 600, color, subColor }) {
  const { sign: s, intPart, centPart } = PF_FMT.amountParts(value);
  const prefix = sign && value > 0 ? '+' : s;
  const mainColor = color || (muted ? 'var(--ink-2)' : 'var(--ink)');
  const sub = subColor || 'var(--ink-3)';
  return (
    <span className="pf-amount" style={{
      fontSize: size, lineHeight: 1,
      fontWeight: weight,
      color: mainColor,
      display: 'inline-flex', alignItems: 'baseline',
    }}>
      <span className="currency" style={{ color: sub }}>{prefix}{currency}</span>
      <span>{intPart}</span>
      <span className="cents" style={{ color: sub }}>,{centPart}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Card — elevated surface
// ─────────────────────────────────────────────────────────────
function Card({ children, pad = 20, radius = 'var(--radius-lg)', bg = 'var(--surface)', border = true, elevate = true, style, onClick, className = '' }) {
  const interactive = !!onClick;
  const cls = [
    className,
    'pf-elevate',
    interactive ? 'pf-elevate-hover' : '',
  ].filter(Boolean).join(' ');
  return (
    <div onClick={onClick} className={cls} style={{
      background: bg,
      borderRadius: radius,
      border: border ? '1px solid var(--line)' : 'none',
      boxShadow: elevate ? 'var(--shadow-1)' : 'none',
      padding: pad,
      cursor: interactive ? 'pointer' : 'default',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────
function Button({ children, variant = 'primary', size = 'md', onClick, icon, full, style, type = 'button' }) {
  const sizes = {
    sm: { h: 32, px: 12, fs: 13, gap: 6 },
    md: { h: 44, px: 18, fs: 14, gap: 8 },
    lg: { h: 56, px: 24, fs: 15, gap: 10 },
  };
  const sz = sizes[size];
  const variants = {
    primary:   { bg: 'var(--ink)',       color: 'var(--bg)',     border: 'transparent' },
    accent:    { bg: 'var(--accent)',    color: 'var(--accent-ink)', border: 'transparent' },
    highlight: { bg: 'var(--highlight)', color: 'var(--highlight-ink)', border: 'transparent' },
    secondary: { bg: 'transparent',      color: 'var(--ink)',    border: 'var(--ink-4)' },
    ghost:     { bg: 'transparent',      color: 'var(--ink)',    border: 'transparent' },
    danger:    { bg: 'transparent',      color: 'var(--negative)', border: 'var(--negative)' },
  };
  const v = variants[variant];
  const elevated = variant === 'primary' || variant === 'accent' || variant === 'highlight';
  return (
    <button type={type} onClick={onClick} className="pf-tap" style={{
      height: sz.h, padding: `0 ${sz.px}px`, fontSize: sz.fs, gap: sz.gap,
      borderRadius: 999, background: v.bg, color: v.color, border: `1px solid ${v.border}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, letterSpacing: '-0.01em',
      boxShadow: elevated ? 'var(--shadow-1)' : 'none',
      width: full ? '100%' : 'auto',
      ...style,
    }}>
      {icon}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Linear progress bar
// ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, height = 6, color = 'var(--accent)', track = 'var(--line)', animate = true }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ height, background: track, borderRadius: 999, overflow: 'hidden', width: '100%' }}>
      <div className={animate ? 'pf-progress-fill' : ''} style={{
        height: '100%',
        width: `${clamped}%`,
        background: `linear-gradient(90deg, color-mix(in oklab, ${color} 82%, #000 0%), ${color})`,
        borderRadius: 999,
        boxShadow: `0 0 0 0.5px ${color}`,
        position: 'relative',
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sparkline — small inline line chart
// ─────────────────────────────────────────────────────────────
function pfSmoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function Sparkline({ data, width = 120, height = 36, color = 'var(--ink)', fill = true, strokeWidth = 2 }) {
  const gid = React.useId().replace(/[:]/g, '');
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - pad - ((v - min) / range) * (height - 2 * pad)]);
  const linePath = pfSmoothPath(pts);
  const areaPath = linePath + ` L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spk-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaPath} fill={`url(#spk-${gid})`} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} />
      <circle cx={last[0]} cy={last[1]} r="6" fill={color} opacity="0.18" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Bar chart — months with two series (income / expense)
// ─────────────────────────────────────────────────────────────
function BarChart({ income, expense, labels, height = 180, current = -1 }) {
  const max = Math.max(...income, ...expense) * 1.15;
  const cols = labels.length;
  const curIdx = current === -1 ? cols - 1 : current;
  const plotH = height - 26;
  const grid = [0, 0.25, 0.5, 0.75, 1];
  const [hover, setHover] = React.useState(-1);
  return (
    <div style={{ position: 'relative', height }}>
      {/* gridlines */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: plotH, pointerEvents: 'none' }}>
        {grid.map((g, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0, bottom: `${g * 100}%`,
            height: 1, background: 'var(--line-soft)',
          }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, height, alignItems: 'end', position: 'relative' }}>
        {labels.map((lab, i) => {
          const ih = (income[i] / max) * plotH;
          const eh = (expense[i] / max) * plotH;
          const isCurrent = i === curIdx;
          const isHover = i === hover;
          const active = isCurrent || isHover;
          return (
            <div key={lab}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'default' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'end', gap: 4, height: plotH, width: '100%', justifyContent: 'center' }}>
                {active && (
                  <div style={{
                    position: 'absolute', top: -2, left: '50%', transform: 'translate(-50%,-100%)',
                    background: 'var(--ink)', color: 'var(--bg)', fontSize: 10.5, fontWeight: 600,
                    padding: '4px 8px', borderRadius: 8, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-1)',
                    fontVariantNumeric: 'tabular-nums', zIndex: 2,
                  }}>
                    {PF_FMT.brl(expense[i], { compact: true })}
                  </div>
                )}
                <div className="pf-bar" style={{
                  width: '34%', height: Math.max(2, ih),
                  background: active ? 'var(--accent)' : 'var(--accent-soft)',
                  borderRadius: '5px 5px 2px 2px',
                  animationDelay: `${i * 60}ms`,
                  transition: 'background 0.18s',
                }} />
                <div className="pf-bar" style={{
                  width: '34%', height: Math.max(2, eh),
                  background: active ? 'var(--ink)' : 'var(--ink-4)',
                  borderRadius: '5px 5px 2px 2px',
                  animationDelay: `${i * 60 + 30}ms`,
                  transition: 'background 0.18s',
                }} />
              </div>
              <div style={{ fontSize: 11, color: active ? 'var(--ink)' : 'var(--ink-3)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: active ? 600 : 400, transition: 'color 0.18s' }}>{lab}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Donut chart — categories
// ─────────────────────────────────────────────────────────────
function Donut({ data, size = 180, thickness = 22, gap = 2, centerLabel, centerValue, onHoverSlice }) {
  const total = data.reduce((a, b) => a + b.amount, 0);
  const radius = size / 2 - thickness / 2 - 4;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const [hovId, setHovId] = React.useState(null);
  const anyHover = hovId !== null;
  let acc = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--line-soft)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.amount / total) * circumference;
          const dash = `${Math.max(0, len - gap)} ${circumference}`;
          const offset = -acc;
          acc += len;
          const isHover = hovId === d.id;
          return (
            <circle key={d.id} cx={cx} cy={cy} r={radius}
              fill="none" stroke={d.color} strokeWidth={isHover ? thickness + 5 : thickness}
              strokeDasharray={dash} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: 'stroke-width 0.2s', cursor: onHoverSlice ? 'pointer' : 'default', opacity: anyHover && !isHover ? 0.55 : 1 }}
              onMouseEnter={() => { setHovId(d.id); onHoverSlice && onHoverSlice(d); }}
              onMouseLeave={() => { setHovId(null); onHoverSlice && onHoverSlice(null); }} />
          );
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{centerLabel || 'Total'}</div>
        <div className="pf-serif" style={{ fontSize: 26 }}>{centerValue || PF_FMT.brl(total)}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Category avatar — small circular icon
// ─────────────────────────────────────────────────────────────
function CategoryAvatar({ cat, size = 40 }) {
  if (cat === 'income') {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--accent-soft)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <I.ArrowDown size={size * 0.45} />
      </div>
    );
  }
  const c = PF_CATEGORIES.find(x => x.id === cat) || PF_CATEGORIES[0];
  const Comp = I[c.icon] || I.Wallet;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--surface-2)', color: 'var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid var(--line)',
      flexShrink: 0,
    }}>
      <Comp size={size * 0.45} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Avatar — initials circle
// ─────────────────────────────────────────────────────────────
function Avatar({ initials, size = 36, bg = 'var(--ink)', color = 'var(--bg)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 500,
      letterSpacing: '-0.02em',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Chip — small inline label/filter
// ─────────────────────────────────────────────────────────────
function Chip({ children, active = false, onClick, icon }) {
  return (
    <button onClick={onClick} className="pf-tap" style={{
      height: 32, padding: '0 12px', borderRadius: 999,
      background: active ? 'var(--ink)' : 'transparent',
      color: active ? 'var(--bg)' : 'var(--ink-2)',
      border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
      fontSize: 13, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      whiteSpace: 'nowrap',
    }}>
      {icon}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Section header (Eyebrow + Title)
// ─────────────────────────────────────────────────────────────
function Eyebrow({ children, style }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--ink-3)', fontWeight: 500,
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Transaction row
// ─────────────────────────────────────────────────────────────
function TransactionRow({ t, dense = false, onClick }) {
  const isIncome = t.amount > 0;
  return (
    <div className="pf-tap pf-rowhover" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: dense ? '10px 10px' : '12px 10px',
      margin: '0 -10px',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <CategoryAvatar cat={isIncome ? 'income' : t.cat} size={dense ? 36 : 42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
          {isIncome ? 'Receita' : (PF_CATEGORIES.find(c => c.id === t.cat)?.name || '—')} · {PF_FMT.shortDate(t.date)}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: isIncome ? 'var(--positive)' : 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.01em',
        }}>
          {isIncome ? '+' : '−'}{PF_FMT.brl(Math.abs(t.amount)).replace('−', '')}
        </div>
      </div>
    </div>
  );
}

// Expose to other scripts
Object.assign(window, {
  Amount, Card, Button, ProgressBar, Sparkline, BarChart, Donut,
  CategoryAvatar, Avatar, Chip, Eyebrow, TransactionRow,
});
