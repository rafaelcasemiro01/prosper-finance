'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/actions';
import { Button, Card, Eyebrow } from '@/components/ui';
import type { Profile } from '@/lib/types';

export function SettingsForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function save() {
    start(async () => {
      await updateProfile({ full_name: fullName.trim(), email: email.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <>
      <Card pad={28} style={{ marginBottom: 24 }}>
        <Eyebrow style={{ marginBottom: 14 }}>Perfil</Eyebrow>
        <label style={{ fontSize: 12, color: 'var(--ink-3)' }}>Nome completo</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={field} />
        <label style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 14, display: 'block' }}>E-mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={field} />
        <Button onClick={save} style={{ marginTop: 18, opacity: pending ? 0.6 : 1 }}>
          {pending ? 'Salvando...' : saved ? 'Salvo ✓' : 'Salvar alterações'}
        </Button>
      </Card>

      <button
        onClick={signOut}
        style={{ width: '100%', padding: 16, color: 'var(--negative)', fontSize: 14, fontWeight: 600, border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}
      >
        Sair da conta
      </button>
    </>
  );
}

const field: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 14px', marginTop: 6, borderRadius: 12,
  border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)',
  fontSize: 15, outline: 'none',
};
