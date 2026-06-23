// store.js — Prosper Finance reactive client store (no backend)
// Single source of truth shared across every artboard (mobile + web).
// Persists to localStorage; exposes PFStore + usePF() + PFSelect.
// Plain script: loads after React UMD and data.js.

(function () {
  const KEY = 'prosper.state.v2';
  const APP_TODAY = '2026-05-22';        // the app's "today"
  const CURRENT_MONTH = APP_TODAY.slice(0, 7); // '2026-05'
  // Opening balance chosen so seed transactions net to the headline total.
  const OPENING_BALANCE = 17384.77;
  const INVESTED = 5435.40;

  const clone = (x) => JSON.parse(JSON.stringify(x));

  function seed() {
    return {
      transactions: clone(window.PF_TRANSACTIONS || []),
      goals: clone(window.PF_GOALS || []),
      accounts: clone(window.PF_ACCOUNTS || []),
      profile: {
        name: 'Lucas', fullName: 'Lucas Mendes', email: 'lucas.mendes@email.com',
        avatar: 'LM', plan: 'Premium',
      },
      settings: { coupleMode: true, biometric: true, notif: true, currency: 'BRL' },
      openingBalance: OPENING_BALANCE,
      invested: INVESTED,
      _v: 2,
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed._v === 2) return parsed;
      }
    } catch (e) {}
    return seed();
  }

  let state = load();
  const subs = new Set();

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function emit() { subs.forEach((f) => f()); }
  function set(updater) {
    state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    persist();
    emit();
  }
  function getState() { return state; }
  function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

  let seq = Date.now();
  const uid = (p) => `${p}${(seq++).toString(36)}`;

  const actions = {
    addTransaction(t) {
      const tx = {
        id: uid('t'),
        date: t.date || APP_TODAY,
        name: t.name || (t.amount > 0 ? 'Receita' : 'Despesa'),
        cat: t.amount > 0 ? 'income' : (t.cat || 'food'),
        amount: t.amount,
        currency: t.currency || 'BRL',
        type: t.amount > 0 ? 'income' : 'expense',
      };
      set((s) => ({ ...s, transactions: [tx, ...s.transactions] }));
      return tx;
    },
    updateTransaction(id, patch) {
      set((s) => ({ ...s, transactions: s.transactions.map((x) => x.id === id ? { ...x, ...patch } : x) }));
    },
    deleteTransaction(id) {
      set((s) => ({ ...s, transactions: s.transactions.filter((x) => x.id !== id) }));
    },
    addGoal(g) {
      const goal = {
        id: uid('g'),
        name: g.name, emoji: g.emoji || '◇',
        target: g.target, current: g.current || 0,
        deadline: g.deadline || '2027-12-01',
        color: g.color || '#1E50E6',
        monthly: g.monthly || Math.max(50, Math.round((g.target - (g.current || 0)) / 18)),
        shared: !!g.shared,
        note: g.note || '',
      };
      set((s) => ({ ...s, goals: [...s.goals, goal] }));
      return goal;
    },
    updateGoal(id, patch) {
      set((s) => ({ ...s, goals: s.goals.map((g) => g.id === id ? { ...g, ...patch } : g) }));
    },
    contributeGoal(id, amount) {
      set((s) => ({
        ...s,
        goals: s.goals.map((g) => g.id === id ? { ...g, current: Math.min(g.target, g.current + amount) } : g),
      }));
    },
    deleteGoal(id) {
      set((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
    },
    addAccount(a) {
      const acc = { id: uid('a'), ...a };
      set((s) => ({ ...s, accounts: [...s.accounts, acc] }));
      return acc;
    },
    deleteAccount(id) {
      set((s) => ({ ...s, accounts: s.accounts.filter((a) => a.id !== id) }));
    },
    updateProfile(patch) {
      set((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
    },
    updateSettings(patch) {
      set((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    },
    reset() { set(seed()); },
  };

  // ── Selectors (pure, computed from state) ───────────────────────────────
  const monthOf = (iso) => (iso || '').slice(0, 7);

  const PFSelect = {
    APP_TODAY, CURRENT_MONTH,
    balanceTotal(s) {
      const sum = s.transactions.reduce((a, t) => a + t.amount, 0);
      return s.openingBalance + sum;
    },
    invested(s) { return s.invested; },
    available(s) { return PFSelect.balanceTotal(s) - s.invested; },
    monthIncome(s, month = CURRENT_MONTH) {
      return s.transactions.filter((t) => t.amount > 0 && monthOf(t.date) === month).reduce((a, t) => a + t.amount, 0);
    },
    monthExpense(s, month = CURRENT_MONTH) {
      return s.transactions.filter((t) => t.amount < 0 && monthOf(t.date) === month).reduce((a, t) => a + Math.abs(t.amount), 0);
    },
    monthNet(s, month = CURRENT_MONTH) {
      return PFSelect.monthIncome(s, month) - PFSelect.monthExpense(s, month);
    },
    // category breakdown for current month expenses
    categoryBreakdown(s, month = CURRENT_MONTH) {
      const cats = window.PF_CATEGORIES || [];
      return cats.map((c) => {
        const amount = s.transactions
          .filter((t) => t.amount < 0 && t.cat === c.id && monthOf(t.date) === month)
          .reduce((a, t) => a + Math.abs(t.amount), 0);
        return { ...c, amount };
      }).filter((c) => c.amount > 0);
    },
    // 6-month series: historical base, current month from live data
    series(s) {
      const base = window.PF_MONTHLY || { incomeSeries: [], expenseSeries: [], monthLabels: [] };
      const income = [...base.incomeSeries];
      const expense = [...base.expenseSeries];
      const last = income.length - 1;
      if (last >= 0) {
        income[last] = PFSelect.monthIncome(s);
        expense[last] = PFSelect.monthExpense(s);
      }
      return { income, expense, labels: base.monthLabels };
    },
    savingsRate(s) {
      const inc = PFSelect.monthIncome(s);
      if (!inc) return 0;
      return (PFSelect.monthNet(s) / inc) * 100;
    },
    recentTransactions(s, n = 6) {
      return [...s.transactions].sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : 0)).slice(0, n);
    },
    goalsProgress(s) {
      const target = s.goals.reduce((a, g) => a + g.target, 0);
      const current = s.goals.reduce((a, g) => a + g.current, 0);
      return { target, current, pct: target ? (current / target) * 100 : 0 };
    },
  };

  function usePF() {
    return React.useSyncExternalStore(subscribe, getState, getState);
  }

  window.PFStore = { getState, subscribe, actions, seed };
  window.PFSelect = PFSelect;
  window.usePF = usePF;
  window.PF_APP_TODAY = APP_TODAY;
})();
