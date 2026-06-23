// Brazilian banks — neutral colored monograms (not official logos).
export const BANKS: Record<string, { name: string; color: string; ink: string }> = {
  nubank:      { name: 'Nubank',          color: '#820AD1', ink: '#fff' },
  itau:        { name: 'Itaú',            color: '#EC7000', ink: '#fff' },
  bradesco:    { name: 'Bradesco',        color: '#CC092F', ink: '#fff' },
  bb:          { name: 'Banco do Brasil', color: '#0038A8', ink: '#FAE128' },
  caixa:       { name: 'Caixa',           color: '#0070AF', ink: '#F39200' },
  santander:   { name: 'Santander',       color: '#EC0000', ink: '#fff' },
  inter:       { name: 'Inter',           color: '#FF7A00', ink: '#fff' },
  c6:          { name: 'C6 Bank',         color: '#1A1A1A', ink: '#fff' },
  mercadopago: { name: 'Mercado Pago',    color: '#00B1EA', ink: '#fff' },
};

export const BANK_IDS = Object.keys(BANKS);
