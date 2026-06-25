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
      <div
        style={{
          background: 'linear-gradient(145deg, var(--accent) 0%, color-mix(in oklab, var(--accent) 78%, #7a2f00) 100%)',
          color: '#fff', borderRadius: 'var(--radius-xl)', padding: 'clamp(24px,4vw,36px)', marginBottom: 22, boxShadow: 'var(--glow-accent), var(--shadow-2)',
        }}
      >
        <Eyebrow style={{ color: 'var(--ink-3)' }}>Progresso total</Eyebrow>
        <div style={{ fontSize: 'clamp(44px,8vw,64px)', fontWeight: 700, color: 'var(--highlight)', lineHeight: 1, marginTop: 8 }}>
          <AnimatedNumber value={pct} kind="percent" />
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-3)' }}>
          <span style={{ color: 'var(--bg)' }}>{brl(saved)}</span> de {brl(target)} guardados
        </div>
        <div style={{ marginTop: 22 }}>
          <ProgressBar pct={pct} height={5} color="var(--highlight)" track="rgba(255,255,255,0.12)" />
        </div>
      </div>

      <GoalsBoard goals={goals} />
    </AppShell>
  );
}
