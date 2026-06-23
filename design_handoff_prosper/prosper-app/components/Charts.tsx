'use client';

import { useState } from 'react';
import { brl } from '@/lib/format';
import { CATEGORIES } from '@/lib/types';

interface Slice { category: string; amount: number; }

// Donut chart (SVG) with hover-to-highlight and center label.
export function DonutChart({ data, size = 220, thickness = 26 }: { data: Slice[]; size?: number; thickness?: number }) {
  const [hover, setHover] = useState<Slice | null>(null);
  const total = data.reduce((a, b) => a + b.amount, 0);
  const r = size / 2 - thickness / 2 - 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line-soft)" strokeWidth={thickness} />
        {total > 0 && data.map((d) => {
          const len = (d.amount / total) * circ;
          const offset = -acc;
          acc += len;
          const color = CATEGORIES[d.category]?.color ?? 'var(--ink-3)';
          const dim = hover && hover.category !== d.category;
          return (
            <circle
              key={d.category} cx={c} cy={c} r={r} fill="none" stroke={color}
              strokeWidth={hover?.category === d.category ? thickness + 4 : thickness}
              strokeDasharray={`${Math.max(0, len - 2)} ${circ}`} strokeDashoffset={offset}
              opacity={dim ? 0.35 : 1}
              style={{ transition: 'opacity .15s, stroke-width .15s', cursor: 'pointer' }}
              onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="eyebrow">{hover ? CATEGORIES[hover.category]?.name ?? hover.category : 'Total'}</div>
        <div className="tnum" style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>
          {brl(hover ? hover.amount : total)}
        </div>
      </div>
    </div>
  );
}

// Grouped bar chart: income vs expense per month.
export function BarChart({
  income, expense, labels, height = 180,
}: { income: number[]; expense: number[]; labels: string[]; height?: number }) {
  const max = Math.max(...income, ...expense, 1) * 1.15;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${labels.length}, 1fr)`, gap: 14, height, alignItems: 'end' }}>
      {labels.map((lab, i) => {
        const last = i === labels.length - 1;
        return (
          <div key={lab} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'end', gap: 3, height: height - 24, width: '100%', justifyContent: 'center' }}>
              <div style={{ width: '36%', height: (income[i] / max) * (height - 24), background: last ? 'var(--accent)' : 'var(--ink-4)', borderRadius: '4px 4px 0 0' }} />
              <div style={{ width: '36%', height: (expense[i] / max) * (height - 24), background: last ? 'var(--ink)' : 'var(--line)', border: '1px solid var(--ink-4)', borderRadius: '4px 4px 0 0' }} />
            </div>
            <div style={{ fontSize: 11, color: last ? 'var(--ink)' : 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: last ? 600 : 400 }}>{lab}</div>
          </div>
        );
      })}
    </div>
  );
}
