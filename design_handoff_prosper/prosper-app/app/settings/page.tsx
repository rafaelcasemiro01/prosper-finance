import { AppShell } from '@/components/AppShell';
import { Eyebrow } from '@/components/ui';
import { SettingsForm } from '@/components/SettingsForm';
import { getProfile } from '@/lib/queries';

export default async function SettingsPage() {
  const profile = await getProfile();
  return (
    <AppShell active="/settings" width="narrow">
      <Eyebrow>Sua conta</Eyebrow>
      <h1 className="h-page" style={{ margin: '6px 0 24px' }}>Configurações</h1>
      <SettingsForm profile={profile} />
    </AppShell>
  );
}
