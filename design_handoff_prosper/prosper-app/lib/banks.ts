// Brazilian banks & credit cooperatives — neutral colored monograms (not logos).
export const BANKS: Record<string, { name: string; color: string; ink: string }> = {
  // Bancos
  nubank:      { name: 'Nubank',          color: '#820AD1', ink: '#fff' },
  itau:        { name: 'Itaú',            color: '#EC7000', ink: '#fff' },
  bradesco:    { name: 'Bradesco',        color: '#CC092F', ink: '#fff' },
  bb:          { name: 'Banco do Brasil', color: '#0038A8', ink: '#FAE128' },
  caixa:       { name: 'Caixa',           color: '#0070AF', ink: '#F39200' },
  santander:   { name: 'Santander',       color: '#EC0000', ink: '#fff' },
  inter:       { name: 'Inter',           color: '#FF7A00', ink: '#fff' },
  c6:          { name: 'C6 Bank',         color: '#1A1A1A', ink: '#fff' },
  mercadopago: { name: 'Mercado Pago',    color: '#00B1EA', ink: '#fff' },
  // Cooperativas de crédito
  sicoob:      { name: 'Sicoob',          color: '#003641', ink: '#7DB61C' },
  sicredi:     { name: 'Sicredi',         color: '#3A7A2F', ink: '#fff' },
  cresol:      { name: 'Cresol',          color: '#00833E', ink: '#fff' },
  ailos:       { name: 'Ailos',           color: '#00AEEF', ink: '#fff' },
  unicred:     { name: 'Unicred',         color: '#0B2C5C', ink: '#fff' },
};

export const BANK_IDS = Object.keys(BANKS);

// Cor neutra (dourada) usada para um banco "Outro" digitado pelo usuário.
export const OTHER_BANK = { color: '#B3901E', ink: '#1A1500' };

// Resolve nome/cores de um banco — inclusive de bancos customizados (custom:Nome).
export function resolveBank(bank: string): { name: string; color: string; ink: string } {
  if (BANKS[bank]) return BANKS[bank];
  if (bank?.startsWith('custom:')) {
    return { name: bank.slice(7), color: OTHER_BANK.color, ink: OTHER_BANK.ink };
  }
  return { name: bank || '—', color: '#888', ink: '#fff' };
}
