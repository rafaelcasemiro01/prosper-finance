'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fn = mode === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', maxWidth: 420, margin: '0 auto', padding: '0 28px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <svg width={28} height={28} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14.5" stroke="var(--accent)" strokeWidth="2" />
          <path d="M12.5 23V9H16a3.5 3.5 0 0 1 0 7h-3.5" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>Prosper</span>
      </div>

      <h1 style={{ fontSize: 40, lineHeight: 1.05, margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Sua grana no controle,{' '}
        <span style={{ color: 'var(--accent)' }}>sem complicação</span>.
      </h1>

      <form onSubmit={submit} style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email" placeholder="seu@email.com" value={email} required
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password" placeholder="senha" value={password} required minLength={6}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <div style={{ color: 'var(--negative)', fontSize: 13 }}>{error}</div>}
        <Button type="submit" full style={{ marginTop: 8, opacity: loading ? 0.6 : 1 }}>
          {loading ? '...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 13 }}
      >
        {mode === 'signin' ? 'Não tem conta? Criar agora' : 'Já tenho conta'}
      </button>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  height: 48, padding: '0 16px', borderRadius: 12,
  border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)',
  fontSize: 15, outline: 'none', width: '100%',
};
