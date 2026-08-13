import { AppShell } from '@/components/AppShell';
import { Eyebrow, ProgressBar } from '@/components/ui';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { GoalsBoard } from '@/components/GoalsBoard';
import { getGoals } from '@/lib/queries';
import { brl } from '@/lib/format';

// Server Component — fetches goals, renders overall progress + board.
export default async function GoalsPage() {
  const goals = await getGoals();
  const target = goals.reduce((a, g) => a + g.target, 0);
  const saved = goals.reduce((a, g) => a + g.current, 0);
  const pct = target ? (saved / target) * 100 : 0;

  return (
    <AppShell active="/goals" width="wide">
      <Eyebrow>Sua jornada</Eyebrow>
      <h1 className="h-page" style={{ margin: '6px 0 22px' }}>Metas e sonhos</h1>

      {/* Overall progress hero */}
      <div className="card"
        style={{
          borderRadius: 'var(--radius-xl)', padding: 'clamp(24px,4vw,36px)', marginBottom: 22,
          background: 'var(--surface)', backdropFilter: 'none', WebkitBackdropFilter: 'none',
        }}
      >
        <Eyebrow>Progresso total</Eyebrow>
        <div style={{ fontSize: 'clamp(44px,8vw,64px)', fontWeight: 700, color: 'var(--accent)', lineHeight: 1, marginTop: 8 }}>
          <AnimatedNumber value={pct} kind="percent" />
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-3)' }}>
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{brl(saved)}</span> de {brl(target)} guardados
        </div>
        <div style={{ marginTop: 22 }}>
          <ProgressBar pct={pct} height={5} color="var(--accent)" track="var(--line)" />
        </div>
      </div>

      <GoalsBoard goals={goals} />
    </AppShell>
  );
}
