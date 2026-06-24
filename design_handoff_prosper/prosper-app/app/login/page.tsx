'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function Logomark({ size = 30, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="2" />
      <path d="M12.5 23V9H16a3.5 3.5 0 0 1 0 7h-3.5" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

// Regras de senha (cadastro)
function passwordRules(pw: string) {
  return [
    { id: 'len', label: 'Mínimo de 8 caracteres', ok: pw.length >= 8 },
    { id: 'upper', label: 'Uma letra maiúscula', ok: /[A-Z]/.test(pw) },
    { id: 'lower', label: 'Uma letra minúscula', ok: /[a-z]/.test(pw) },
    { id: 'num', label: 'Um número', ok: /\d/.test(pw) },
  ];
}

const VALUE_PROPS = [
  'Controle total das contas, cartões e empréstimos em um só lugar.',
  'Metas com barra de progresso que mostram o quanto falta para o seu sonho.',
  'Consultor inteligente com sugestões de economia e investimento.',
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const rules = passwordRules(password);
  const pwValid = rules.every((r) => r.ok);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailValid && (mode === 'signin' ? password.length >= 1 : pwValid);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(traduzErro(error.message)); return; }
        router.push('/dashboard');
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) { setError(traduzErro(error.message)); return; }
        // Se o e-mail exigir confirmação, não há sessão imediata.
        if (data.session) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setNotice('Conta criada! Verifique seu e-mail para confirmar e depois faça login.');
          setMode('signin');
          setPassword('');
        }
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: 'signin' | 'signup') {
    setMode(m); setError(null); setNotice(null);
  }

  return (
    <main className="auth">
      {/* Painel de marca (desktop) com efeito "lamp" */}
      <section className="auth__brand">
        {/* Lamp: facho de luz que acende do topo */}
        <div className="lamp" aria-hidden>
          <motion.div className="lamp__cone-l" initial={{ opacity: 0, scaleX: 0.4 }} animate={{ opacity: 0.5, scaleX: 1 }} transition={{ delay: 0.1, duration: 0.9, ease: 'easeOut' }} style={{ transformOrigin: 'top right' }} />
          <motion.div className="lamp__cone-r" initial={{ opacity: 0, scaleX: 0.4 }} animate={{ opacity: 0.5, scaleX: 1 }} transition={{ delay: 0.1, duration: 0.9, ease: 'easeOut' }} style={{ transformOrigin: 'top left' }} />
          <motion.div className="lamp__line" initial={{ opacity: 0, scaleX: 0.2 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.35, duration: 0.8, ease: 'easeOut' }} />
          <motion.div className="lamp__glow" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 0.55, scale: 1 }} transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, zIndex: 1 }}>
          <Logomark size={34} color="var(--bg)" />
          <span style={{ fontSize: 22, fontWeight: 700 }}>Prosper</span>
        </motion.div>

        <div style={{ position: 'relative', maxWidth: 460, zIndex: 1 }}>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 'clamp(34px, 4vw, 52px)', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 28px' }}
          >
            Sua grana no controle, <span style={{ color: 'var(--highlight)' }}>sem complicação</span>.
          </motion.h1>
          {VALUE_PROPS.map((v, i) => (
            <motion.div
              className="auth__valueprop" key={v}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
              <span style={{ fontSize: 15, lineHeight: 1.5, color: 'color-mix(in oklab, var(--bg) 85%, transparent)' }}>{v}</span>
            </motion.div>
          ))}
        </div>

        <div style={{ position: 'relative', fontSize: 12, color: 'color-mix(in oklab, var(--bg) 72%, transparent)', letterSpacing: '0.04em', zIndex: 1 }}>
          EST. 2026 · Seus dados protegidos com criptografia
        </div>
      </section>

      {/* Painel do formulário */}
      <section className="auth__form">
        <div className="show-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <Logomark size={28} />
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>Prosper</span>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          {mode === 'signin' ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 24px' }}>
          {mode === 'signin' ? 'Entre para continuar organizando sua vida financeira.' : 'Leva menos de um minuto. É grátis.'}
        </p>

        <div className="seg" role="tablist">
          <button className={mode === 'signin' ? 'is-on' : ''} onClick={() => switchMode('signin')} type="button">Entrar</button>
          <button className={mode === 'signup' ? 'is-on' : ''} onClick={() => switchMode('signup')} type="button">Criar conta</button>
        </div>

        {notice && (
          <div className="anim-pop" style={{ background: 'var(--accent-soft)', color: 'var(--ink)', border: '1px solid var(--accent)', borderRadius: 12, padding: '12px 14px', fontSize: 13, marginBottom: 16 }}>
            {notice}
          </div>
        )}

        <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label" htmlFor="email">E-mail</label>
            <input id="email" className="input" type="email" inputMode="email" autoComplete="email"
              placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="field-label" htmlFor="password">Senha</label>
            <div className="input-wrap">
              <input id="password" className="input" type={showPw ? 'text' : 'password'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                placeholder={mode === 'signin' ? 'Sua senha' : 'Crie uma senha forte'}
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="input-affix" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPw ? (
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.4 5.2A9.9 9.9 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.3 2.5-2.7 3.8M6.1 6.1C3.8 7.6 2.4 9.8 2 12c1 2.5 5 7 10 7 1.4 0 2.7-.3 3.9-.9" /></svg>
                ) : (
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Regras de senha (cadastro) */}
          {mode === 'signup' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px', marginTop: -4 }}>
              {rules.map((r) => (
                <div key={r.id} className={`rule${r.ok ? ' ok' : ''}`}>
                  <span className="rule__dot">{r.ok && <Check />}</span>
                  {r.label}
                </div>
              ))}
            </div>
          )}

          {mode === 'signin' && (
            <button type="button" onClick={() => setNotice('Em breve: recuperação de senha por e-mail.')} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 13, marginTop: -6 }}>
              Esqueceu a senha?
            </button>
          )}

          {error && (
            <div className="anim-pop" style={{ color: 'var(--negative)', fontSize: 13, background: 'color-mix(in oklab, var(--negative) 10%, transparent)', borderRadius: 10, padding: '10px 12px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn--accent btn--block" disabled={!canSubmit || loading} style={{ marginTop: 4, height: 52 }}>
            {loading ? (
              <><svg className="spin" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3a9 9 0 1 0 9 9" /></svg> Aguarde...</>
            ) : mode === 'signin' ? 'Entrar' : 'Criar minha conta'}
          </button>
        </form>

        <p style={{ marginTop: 22, fontSize: 13, color: 'var(--ink-3)', textAlign: 'center' }}>
          {mode === 'signin' ? (
            <>Não tem conta? <button onClick={() => switchMode('signup')} style={linkBtn}>Criar agora</button></>
          ) : (
            <>Já tem conta? <button onClick={() => switchMode('signin')} style={linkBtn}>Entrar</button></>
          )}
        </p>
      </section>
    </main>
  );
}

const linkBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, fontSize: 13, padding: 0,
};

function traduzErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('already registered') || m.includes('already exists')) return 'Este e-mail já está cadastrado. Tente entrar.';
  if (m.includes('password')) return 'Senha inválida. Verifique os requisitos.';
  if (m.includes('email')) return 'E-mail inválido.';
  return msg;
}
