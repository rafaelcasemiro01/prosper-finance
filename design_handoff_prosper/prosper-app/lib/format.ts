// BRL formatting — ported from the prototype's PF_FMT.

export function brl(n: number, opts: { sign?: boolean; compact?: boolean } = {}): string {
  const { sign = false, compact = false } = opts;
  const abs = Math.abs(n);
  if (compact && abs >= 1000) {
    if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
    return (n / 1000).toFixed(1).replace('.', ',') + 'k';
  }
  const s = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const prefix = n < 0 ? '−' : sign ? '+' : '';
  return prefix + 'R$ ' + s;
}

// Parse a pt-BR currency string ("1.234,56") into a number.
export function parseBRL(str: string): number {
  const s = (str || '').replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
