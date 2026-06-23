import { AppShell } from '@/components/AppShell';
import { Eyebrow } from '@/components/ui';
import { AdvisorChat } from '@/components/AdvisorChat';

export default function AiPage() {
  return (
    <AppShell active="/ai" width="narrow">
      <Eyebrow>Consultoria gratuita</Eyebrow>
      <h1 className="h-page" style={{ margin: '6px 0 20px' }}>Consultor Prosper</h1>
      <AdvisorChat />
    </AppShell>
  );
}
