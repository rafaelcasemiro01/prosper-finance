import { Sidebar } from '@/components/Sidebar';
import { Eyebrow } from '@/components/ui';
import { AdvisorChat } from '@/components/AdvisorChat';

export default function AiPage() {
  return (
    <div style={{ display: 'flex', background: 'var(--bg)', minHeight: '100vh' }}>
      <Sidebar active="/ai" />
      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 900 }}>
        <Eyebrow>Consultoria gratuita</Eyebrow>
        <h1 style={{ fontSize: 44, margin: '6px 0 24px', fontWeight: 700, letterSpacing: '-0.02em' }}>Consultor Prosper</h1>
        <AdvisorChat />
      </main>
    </div>
  );
}
