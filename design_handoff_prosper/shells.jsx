// shells.jsx — Mobile shell (bottom nav) + Web shell (sidebar nav)

// ─────────────────────────────────────────────────────────────
// MOBILE SHELL — bottom tab bar + push-style modal nav
// ─────────────────────────────────────────────────────────────
function MobileShell({ theme, setTheme }) {
  const [nav, setNav] = React.useState({ screen: 'onboarding', params: {} });
  const screen = nav.screen;
  const params = nav.params || {};
  const navigate = (s, p = {}) => setNav({ screen: s, params: p });

  // Map screen → bottom-tab id for highlighting
  const tabFor = (s) => {
    if (s === 'dashboard') return 'home';
    if (s === 'transactions') return 'tx';
    if (s === 'analytics') return 'analytics';
    if (s === 'goals') return 'goals';
    if (s === 'settings') return 'settings';
    if (s === 'ai') return 'ai';
    return null;
  };

  const showTabBar = !['onboarding', 'new'].includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case 'onboarding':   return <OnboardingScreen navigate={navigate} frame="mobile" />;
      case 'dashboard':    return <DashboardScreen navigate={navigate} frame="mobile" />;
      case 'new':          return <NewTransactionScreen navigate={navigate} frame="mobile" params={params} />;
      case 'transactions': return <TransactionsScreen navigate={navigate} frame="mobile" />;
      case 'analytics':    return <AnalyticsScreen navigate={navigate} frame="mobile" />;
      case 'goals':        return <GoalsScreen navigate={navigate} frame="mobile" params={params} />;
      case 'accounts':     return <AccountsScreen navigate={navigate} frame="mobile" />;
      case 'ai':           return <AIChatScreen navigate={navigate} frame="mobile" />;
      case 'settings':     return <SettingsScreen navigate={navigate} frame="mobile" theme={theme} setTheme={setTheme} />;
      default:             return <DashboardScreen navigate={navigate} frame="mobile" />;
    }
  };

  return (
    <div className="pf" data-theme={theme} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <div key={screen} className="pf-fade" style={{ height: '100%' }}>
          {renderScreen()}
        </div>
      </div>
      {showTabBar && <MobileTabBar active={tabFor(screen)} navigate={navigate} />}
    </div>
  );
}

function MobileTabBar({ active, navigate }) {
  const tabs = [
    { id: 'home',      label: 'Início',    icon: I.Home,   screen: 'dashboard' },
    { id: 'analytics', label: 'Análises',  icon: I.Chart,  screen: 'analytics' },
    { id: 'new',       label: '',          icon: I.Plus,   screen: 'new', primary: true },
    { id: 'goals',     label: 'Metas',     icon: I.Target, screen: 'goals' },
    { id: 'ai',        label: 'IA',        icon: I.Sparkles, screen: 'ai' },
  ];

  return (
    <div style={{
      flexShrink: 0,
      padding: '10px 16px 14px 16px',
      background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
      position: 'relative', zIndex: 30,
    }}>
      <div className="pf-floatnav" style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2,
        alignItems: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 22,
        padding: '6px 8px',
      }}>
        {tabs.map(t => {
          const Comp = t.icon;
          const isActive = active === t.id;
          if (t.primary) {
            return (
              <button key={t.id} onClick={() => navigate(t.screen)} className="pf-tap" style={{
                width: 50, height: 50, borderRadius: 16,
                background: 'var(--accent)', color: 'var(--accent-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', boxShadow: 'var(--glow-accent)',
              }}>
                <Comp size={24} />
              </button>
            );
          }
          return (
            <button key={t.id} onClick={() => navigate(t.screen)} className="pf-tap" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 4px', borderRadius: 14,
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--ink-3)',
              transition: 'background 0.15s, color 0.15s',
            }}>
              <Comp size={20} stroke={isActive ? 2.2 : 1.6} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, letterSpacing: '0.01em' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WEB SHELL — sidebar nav + top header
// ─────────────────────────────────────────────────────────────
function WebShell({ theme, setTheme, initialScreen = 'dashboard' }) {
  const [nav, setNav] = React.useState({ screen: initialScreen, params: {} });
  const screen = nav.screen;
  const params = nav.params || {};
  const navigate = (s, p = {}) => setNav({ screen: s, params: p });

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':    return <DashboardScreen navigate={navigate} frame="web" />;
      case 'new':          return <NewTransactionScreen navigate={navigate} frame="web" params={params} />;
      case 'transactions': return <TransactionsScreen navigate={navigate} frame="web" />;
      case 'analytics':    return <AnalyticsScreen navigate={navigate} frame="web" />;
      case 'goals':        return <GoalsScreen navigate={navigate} frame="web" params={params} />;
      case 'accounts':     return <AccountsScreen navigate={navigate} frame="web" />;
      case 'ai':           return <AIChatScreen navigate={navigate} frame="web" />;
      case 'settings':     return <SettingsScreen navigate={navigate} frame="web" theme={theme} setTheme={setTheme} />;
      default:             return <DashboardScreen navigate={navigate} frame="web" />;
    }
  };

  return (
    <div className="pf" data-theme={theme} style={{
      height: '100%', display: 'flex', background: 'var(--bg)',
    }}>
      {/* Sidebar */}
      <WebSidebar active={screen} navigate={navigate} />

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div key={screen} className="pf-fade" style={{ flex: 1, minHeight: 0 }}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}

function WebSidebar({ active, navigate }) {
  const groups = [
    {
      label: 'Geral',
      items: [
        { id: 'dashboard',    label: 'Dashboard',    icon: I.Home },
        { id: 'transactions', label: 'Movimentos',   icon: I.Wallet },
        { id: 'accounts',     label: 'Contas & Cartões', icon: I.Card },
        { id: 'analytics',    label: 'Análises',     icon: I.Chart },
      ],
    },
    {
      label: 'Jornada',
      items: [
        { id: 'goals', label: 'Metas',          icon: I.Target },
        { id: 'ai',    label: 'Consultor IA',   icon: I.Sparkles, badge: 'Novo' },
      ],
    },
    {
      label: 'Conta',
      items: [
        { id: 'settings', label: 'Configurações', icon: I.Cog },
      ],
    },
  ];

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 16px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px 24px 10px' }}>
        <Logomark size={28} />
        <div className="pf-serif" style={{ fontSize: 22, lineHeight: 1, color: 'var(--accent)' }}>
          Prosper
        </div>
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {groups.map(g => (
          <div key={g.label}>
            <div style={{ padding: '0 10px 8px 10px', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>{g.label}</div>
            {g.items.map(it => {
              const Comp = it.icon;
              const isActive = active === it.id;
              return (
                <button key={it.id} onClick={() => navigate(it.id)} className="pf-tap" style={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  background: isActive ? 'var(--surface)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--ink-2)',
                  fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                  border: isActive ? '1px solid var(--line)' : '1px solid transparent',
                  boxShadow: isActive ? 'var(--shadow-1)' : 'none',
                  textAlign: 'left',
                }}>
                  {isActive && (
                    <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: 999, background: 'var(--accent)' }} />
                  )}
                  <Comp size={18} stroke={isActive ? 2 : 1.6} />
                  <span style={{ flex: 1, color: isActive ? 'var(--ink)' : 'var(--ink-2)' }}>{it.label}</span>
                  {it.badge && (
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accent-ink)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>{it.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: profile */}
      <div style={{ padding: '12px 10px 0 10px', borderTop: '1px solid var(--line)', marginTop: 12 }}>
        <button className="pf-tap" onClick={() => navigate('settings')} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '8px 4px',
        }}>
          <Avatar initials="LM" size={32} />
          <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Lucas Mendes</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Plano Premium</div>
          </div>
          <I.More size={16} style={{ color: 'var(--ink-3)' }} />
        </button>
      </div>
    </aside>
  );
}

Object.assign(window, { MobileShell, WebShell, MobileTabBar, WebSidebar });
