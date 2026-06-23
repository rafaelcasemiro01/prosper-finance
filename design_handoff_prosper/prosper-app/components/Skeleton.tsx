import { AppShell } from './AppShell';

// Esqueleto de carregamento (shimmer) — exibido instantaneamente ao navegar,
// enquanto o conteúdo real é carregado no servidor. Dá sensação de app rápido.
export function PageSkeleton({ active, width = 'wide' }: { active: string; width?: 'wide' | 'narrow' }) {
  return (
    <AppShell active={active} width={width}>
      <div className="sk" style={{ height: 12, width: 110, marginBottom: 14, borderRadius: 6 }} />
      <div className="sk" style={{ height: 36, width: 220, marginBottom: 28, borderRadius: 10 }} />
      <div className="grid grid-hero" style={{ marginBottom: 16 }}>
        <div className="sk" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />
        <div className="grid" style={{ gap: 16 }}>
          <div className="sk" style={{ height: 92 }} />
          <div className="sk" style={{ height: 92 }} />
        </div>
      </div>
      <div className="grid grid-split">
        <div className="sk" style={{ height: 220 }} />
        <div className="sk" style={{ height: 220 }} />
      </div>
    </AppShell>
  );
}
