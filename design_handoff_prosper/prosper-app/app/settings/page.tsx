import { Sidebar } from '@/components/Sidebar';
import { Eyebrow } from '@/components/ui';
import { SettingsForm } from '@/components/SettingsForm';
import { getProfile } from '@/lib/queries';

export default async function SettingsPage() {
  const profile = await getProfile();
  return (
    <div style={{ display: 'flex', background: 'var(--bg)', minHeight: '100vh' }}>
      <Sidebar active="/settings" />
      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 720 }}>
        <Eyebrow>Sua conta</Eyebrow>
        <h1 style={{ fontSize: 44, margin: '6px 0 28px', fontWeight: 700, letterSpacing: '-0.02em' }}>Configurações</h1>
        <SettingsForm profile={profile} />
      </main>
    </div>
  );
}
