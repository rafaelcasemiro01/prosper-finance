// data.js — mock financial data for Prosper Finance
// All amounts in BRL cents-precision floats (we display formatted)

const PF_USER = {
  name: 'Lucas',
  fullName: 'Lucas Mendes',
  avatar: 'LM',
  partner: { name: 'Marina', avatar: 'M' },
  coupleMode: true,
};

const PF_BALANCE = {
  total: 23847.50,
  delta30: 1284.30,
  available: 18412.10,
  invested: 5435.40,
};

const PF_MONTHLY = {
  income: 8500.00,
  expense: 4213.87,
  // last 6 months — current is last
  expenseSeries: [3890, 4520, 3210, 4980, 3760, 4213.87],
  incomeSeries:  [7500, 7500, 8000, 8500, 8500, 8500],
  monthLabels: ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
};

const PF_CATEGORIES = [
  { id: 'food',     name: 'Alimentação',  icon: 'cutlery', color: '#C8A02C', amount: 1187.40 },
  { id: 'home',     name: 'Moradia',      icon: 'home',    color: '#1F8A5B', amount: 1450.00 },
  { id: 'transport',name: 'Transporte',   icon: 'car',     color: '#2E7D9A', amount: 612.90  },
  { id: 'leisure',  name: 'Lazer',        icon: 'sparkle', color: '#C2542E', amount: 438.20  },
  { id: 'health',   name: 'Saúde',        icon: 'heart',   color: '#8E5B8A', amount: 295.00  },
  { id: 'edu',      name: 'Educação',     icon: 'book',    color: '#B5862B', amount: 230.37  },
];

const PF_TRANSACTIONS = [
  { id: 1,  date: '2026-05-22', name: 'Mercado Pão de Açúcar', cat: 'food',     amount: -287.40, currency: 'BRL' },
  { id: 2,  date: '2026-05-22', name: 'Spotify Premium',       cat: 'leisure',  amount: -21.90,  currency: 'BRL' },
  { id: 3,  date: '2026-05-21', name: 'Salário — Acme Co.',    cat: 'income',   amount: 8500.00, currency: 'BRL', type: 'income' },
  { id: 4,  date: '2026-05-20', name: 'Uber',                  cat: 'transport',amount: -32.50,  currency: 'BRL' },
  { id: 5,  date: '2026-05-20', name: 'Farmácia Drogasil',     cat: 'health',   amount: -89.30,  currency: 'BRL' },
  { id: 6,  date: '2026-05-19', name: 'iFood — Casa do Sushi', cat: 'food',     amount: -127.80, currency: 'BRL' },
  { id: 7,  date: '2026-05-18', name: 'Aluguel — Maio',        cat: 'home',     amount: -2200.00,currency: 'BRL' },
  { id: 8,  date: '2026-05-17', name: 'Coursera — UX',         cat: 'edu',      amount: -149.00, currency: 'BRL' },
  { id: 9,  date: '2026-05-16', name: 'Posto Shell',           cat: 'transport',amount: -180.00, currency: 'BRL' },
  { id: 10, date: '2026-05-15', name: 'Cinema Iguatemi',       cat: 'leisure',  amount: -68.00,  currency: 'BRL' },
  { id: 11, date: '2026-05-14', name: 'Mercado Livre — Livros',cat: 'edu',      amount: -81.37,  currency: 'BRL' },
  { id: 12, date: '2026-05-12', name: 'Freelance — Studio Nu', cat: 'income',   amount: 1200.00, currency: 'BRL', type: 'income' },
];

const PF_GOALS = [
  {
    id: 'eu',
    name: 'Viagem para Europa',
    emoji: '✺',
    target: 15000,
    current: 10950,
    deadline: '2026-12-15',
    color: '#C8A02C',
    monthly: 580,
    shared: true,
    note: 'Roma → Lisboa → Barcelona, 18 dias.',
  },
  {
    id: 'em',
    name: 'Reserva de emergência',
    emoji: '◐',
    target: 30000,
    current: 18300,
    deadline: '2027-06-01',
    color: '#1F8A5B',
    monthly: 850,
    shared: false,
    note: '6 meses de despesas essenciais.',
  },
  {
    id: 'car',
    name: 'Carro novo',
    emoji: '◇',
    target: 80000,
    current: 12500,
    deadline: '2028-03-01',
    color: '#B5642B',
    monthly: 1200,
    shared: true,
    note: 'Entrada para um SUV híbrido.',
  },
];

// Formatters
const PF_FMT = {
  brl(n, opts = {}) {
    const { sign = false, compact = false } = opts;
    const abs = Math.abs(n);
    if (compact && abs >= 1000) {
      if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
      return (n / 1000).toFixed(1).replace('.', ',') + 'k';
    }
    const s = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const prefix = n < 0 ? '−' : (sign ? '+' : '');
    return prefix + 'R$ ' + s;
  },
  amountParts(n) {
    // returns { sign, intPart, centPart } for the editorial amount display
    const abs = Math.abs(n);
    const intPart = Math.floor(abs).toLocaleString('pt-BR');
    const centPart = abs.toFixed(2).split('.')[1];
    return { sign: n < 0 ? '−' : '', intPart, centPart };
  },
  shortDate(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  },
  groupDate(iso) {
    const d = new Date(iso + 'T12:00:00');
    const today = new Date('2026-05-22T12:00:00');
    const diff = Math.floor((today - d) / 86400000);
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  },
};

// ── Brazilian banks catalog (neutral monogram representation, brand color) ──
const PF_BANKS = [
  { id: 'nubank',   name: 'Nubank',          color: '#820AD1', ink: '#fff' },
  { id: 'itau',     name: 'Itaú',            color: '#EC7000', ink: '#fff' },
  { id: 'bradesco', name: 'Bradesco',        color: '#CC092F', ink: '#fff' },
  { id: 'bb',       name: 'Banco do Brasil', color: '#0038A8', ink: '#FAE128' },
  { id: 'caixa',    name: 'Caixa',           color: '#0070AF', ink: '#F39200' },
  { id: 'santander',name: 'Santander',       color: '#EC0000', ink: '#fff' },
  { id: 'inter',    name: 'Inter',           color: '#FF7A00', ink: '#fff' },
  { id: 'c6',       name: 'C6 Bank',         color: '#1A1A1A', ink: '#fff' },
  { id: 'mercadopago', name: 'Mercado Pago', color: '#00B1EA', ink: '#fff' },
];

// Seed of connected accounts / cards / loans
const PF_ACCOUNTS = [
  { id: 'a1', bank: 'nubank', kind: 'conta',      label: 'Conta corrente',     balance: 8420.30 },
  { id: 'a2', bank: 'nubank', kind: 'cartao',     label: 'Cartão de crédito',  limit: 8000, used: 1240.70, due: '08/06' },
  { id: 'a3', bank: 'itau',   kind: 'conta',      label: 'Conta corrente',     balance: 5991.80 },
  { id: 'a4', bank: 'inter',  kind: 'investimento', label: 'Investimentos',    balance: 5435.40 },
  { id: 'a5', bank: 'caixa',  kind: 'emprestimo', label: 'Empréstimo pessoal', outstanding: 9600.00, installment: 800, paid: 12, total: 24 },
];

Object.assign(window, { PF_USER, PF_BALANCE, PF_MONTHLY, PF_CATEGORIES, PF_TRANSACTIONS, PF_GOALS, PF_FMT, PF_BANKS, PF_ACCOUNTS });
