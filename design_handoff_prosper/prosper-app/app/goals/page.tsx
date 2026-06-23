import { Sidebar } from '@/components/Sidebar';
import { Eyebrow, ProgressBar } from '@/components/ui';
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
    <div style={{ display: 'flex', background: 'var(--bg)', minHeight: '100vh' }}>
      <Sidebar active="/goals" />

      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1200 }}>
        <Eyebrow>Sua jornada</Eyebrow>
        <h1 style={{ fontSize: 44, margin: '6px 0 24px', fontWeight: 700, letterSpacing: '-0.02em' }}>Metas e sonhos</h1>

        {/* Overall progress hero */}
        <div
          style={{
            background: 'linear-gradient(150deg, var(--ink) 0%, color-mix(in oklab, var(--ink) 86%, var(--accent)) 100%)',
            color: 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: 36, marginBottom: 22, boxShadow: 'var(--shadow-2)',
          }}
        >
          <Eyebrow style={{ color: 'var(--ink-3)' }}>Progresso total</Eyebrow>
          <div style={{ fontSize: 64, fontWeight: 700, color: 'var(--highlight)', lineHeight: 1, marginTop: 8 }}>
            {Math.round(pct)}%
          </div>
          <div style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-3)' }}>
            <span style={{ color: 'var(--bg)' }}>{brl(saved)}</span> de {brl(target)} guardados
          </div>
          <div style={{ marginTop: 22 }}>
            <ProgressBar pct={pct} height={5} color="var(--highlight)" track="rgba(255,255,255,0.12)" />
          </div>
        </div>

        <GoalsBoard goals={goals} />
      </main>
    </div>
  );
}
