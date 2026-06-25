// Formas de pagamento de despesas — para comparar tipos de gasto.
export const PAYMENT_METHODS: { id: string; label: string }[] = [
  { id: 'debito',   label: 'Débito' },
  { id: 'pix',      label: 'Pix' },
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'credito',  label: 'Crédito' },
];

export const PAYMENT_COLORS: Record<string, string> = {
  debito:   '#2E7D9A',
  pix:      '#1F8A5B',
  dinheiro: '#C9711A',
  credito:  '#8E5B8A',
};

export function paymentLabel(id?: string | null): string {
  return PAYMENT_METHODS.find((p) => p.id === id)?.label ?? '—';
}
