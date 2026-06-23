// icons.jsx — minimal line-based icon set (stroke 1.5)
// All icons sized via `size` prop; inherit currentColor.

function Icon({ children, size = 20, stroke = 1.5, fill = 'none', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      {children}
    </svg>
  );
}

const I = {
  Home: (p) => <Icon {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1v-9z"/></Icon>,
  Chart: (p) => <Icon {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></Icon>,
  Target: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></Icon>,
  Spark: (p) => <Icon {...p}><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/></Icon>,
  Plus: (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></Icon>,
  Filter: (p) => <Icon {...p}><path d="M3 5h18M6 12h12M10 19h4"/></Icon>,
  Bell: (p) => <Icon {...p}><path d="M6 8a6 6 0 1 1 12 0v4l2 3H4l2-3V8zM10 19a2 2 0 0 0 4 0"/></Icon>,
  Cog: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>,
  ArrowUp: (p) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>,
  ArrowDown: (p) => <Icon {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Icon>,
  ArrowRight: (p) => <Icon {...p}><path d="M5 12h14M12 5l7 7-7 7"/></Icon>,
  ArrowLeft: (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></Icon>,
  Check: (p) => <Icon {...p}><path d="M4 12l5 5L20 6"/></Icon>,
  X: (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>,
  Send: (p) => <Icon {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></Icon>,
  Sparkles: (p) => <Icon {...p}><path d="M5 3v4M3 5h4M19 13v6M16 16h6M11 3l1.6 4.4L17 9l-4.4 1.6L11 15l-1.6-4.4L5 9l4.4-1.6L11 3z"/></Icon>,
  More: (p) => <Icon {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></Icon>,
  Calendar: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></Icon>,
  Wallet: (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2H5a2 2 0 0 0 0 4h16v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><circle cx="17" cy="11" r="1" fill="currentColor"/></Icon>,
  Card: (p) => <Icon {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19M6 15h4"/></Icon>,
  Bank: (p) => <Icon {...p}><path d="M4 10h16M5 10l7-5 7 5M6 10v7M10 10v7M14 10v7M18 10v7M4 20h16"/></Icon>,
  Pix: (p) => <Icon {...p}><path d="M12 3l4 4-4 4-4-4 4-4zM12 13l4 4-4 4-4-4 4-4zM3 12l4-4 4 4-4 4-4-4zM13 12l4-4 4 4-4 4-4-4z"/></Icon>,
  Edit: (p) => <Icon {...p}><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M13.5 6.5l3 3"/></Icon>,
  Trash: (p) => <Icon {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6"/></Icon>,
  Trend: (p) => <Icon {...p}><path d="M3 17l6-6 4 4 8-9M14 6h7v7"/></Icon>,
  Users: (p) => <Icon {...p}><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M17 11a4 4 0 0 0 0-8M22 21a7 7 0 0 0-5-6.7"/></Icon>,
  Globe: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Icon>,
  Lock: (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></Icon>,
  // Category icons
  cutlery: (p) => <Icon {...p}><path d="M4 3v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M6 13v8M14 3c-2 0-3 2-3 5s1 5 3 5v8"/></Icon>,
  home: (p) => <Icon {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9z"/></Icon>,
  car: (p) => <Icon {...p}><path d="M5 17h14M5 17v-3l2-5h10l2 5v3M5 17v2M19 17v2"/><circle cx="8" cy="14.5" r="1" fill="currentColor"/><circle cx="16" cy="14.5" r="1" fill="currentColor"/></Icon>,
  sparkle: (p) => <Icon {...p}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></Icon>,
  heart: (p) => <Icon {...p}><path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/></Icon>,
  book: (p) => <Icon {...p}><path d="M4 4h8a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4V4zM20 4h-8a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h9V4z"/></Icon>,
  income: (p) => <Icon {...p}><path d="M12 4v12M6 10l6 6 6-6"/></Icon>,
};

window.I = I;
window.PFIcon = Icon;
