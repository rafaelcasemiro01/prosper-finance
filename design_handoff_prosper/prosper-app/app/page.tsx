import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LandingDemo } from '@/components/LandingDemo';

export const metadata = {
  title: 'Prosper — Sua grana no controle, sem complicação',
  description: 'Gestão financeira pessoal: contas, cartões, metas e um consultor inteligente. Explore antes de criar sua conta.',
};

function Logomark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14.5" stroke="var(--accent)" strokeWidth="2.2" />
      <path d="M12.5 23V9H16a3.5 3.5 0 0 1 0 7h-3.5" stroke="var(--accent)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FEATURES = [
  { icon: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z', title: 'Dashboard vivo', desc: 'Patrimônio, saldo do mês e faturas — com projeção mês a mês para planejar o ano inteiro.' },
  { icon: 'M8 4v13M8 4 5 7M8 4l3 3M16 20V7M16 20l-3-3M16 20l3-3', title: 'Movimentos', desc: 'Lance receitas e despesas em segundos. Categorias, tipos e formas de pagamento (Pix, débito, dinheiro).' },
  { icon: 'M2.5 5h19v14h-19zM2.5 9.5h19M6 15h4', title: 'Contas & Cartões', desc: 'Bancos, cooperativas, cartões e empréstimos num só lugar — com limite disponível e parcelas.' },
  { icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2', title: 'Análises', desc: 'Gráficos por categoria, forma de pagamento e comparativos que mostram para onde vai seu dinheiro.' },
  { icon: 'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z', title: 'Metas & sonhos', desc: 'Defina objetivos, registre aportes e acompanhe a barra de progresso até realizar.' },
  { icon: 'M5 3v4M3 5h4M19 13v6M16 16h6M11 3l1.6 4.4L17 9l-4.4 1.6L11 15l-1.6-4.4L5 9l4.4-1.6z', title: 'Consultor Prosper', desc: 'Sugestões inteligentes de economia e investimento, baseadas nos seus números.' },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Top nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'saturate(180%) blur(14px)', WebkitBackdropFilter: 'saturate(180%) blur(14px)', background: 'color-mix(in oklab, var(--bg) 80%, transparent)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="lp-header-inner">
          <div className="lp-brand">
            <Logomark size={26} />
            <span className="lp-brandname">Prosper</span>
          </div>
          <div className="lp-actions">
            <ThemeToggle compact />
            {user ? (
              <Link href="/dashboard" className="btn btn--primary">
                <span className="lp-cta-long">Ir para o app</span>
                <span className="lp-cta-short">Meu app</span>
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn--ghost">Entrar</Link>
                <Link href="/login" className="btn btn--primary">
                  <span className="lp-cta-long">Criar conta grátis</span>
                  <span className="lp-cta-short">Criar conta</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-hero">
        <span className="lp-eyebrow">✦ Explore o quanto quiser — conta é opcional</span>
        <h1 className="lp-title">
          Sua grana no controle,<br /><span style={{ color: 'var(--accent)' }}>sem complicação.</span>
        </h1>
        <p className="lp-sub">
          Contas, cartões, metas e análises num app leve e bonito. Navegue à vontade e crie sua conta só quando quiser guardar tudo.
        </p>
        <div className="lp-hero-actions">
          <Link href={user ? '/dashboard' : '/login'} className="btn btn--primary">
            {user ? 'Abrir meu painel' : 'Começar agora — é grátis'}
          </Link>
          <a href="#recursos" className="btn btn--secondary">
            Ver o que dá pra fazer
          </a>
        </div>
      </section>

      {/* Demo interativo da plataforma */}
      <section style={{ padding: '12px 0 24px' }}>
        <LandingDemo />
      </section>

      {/* Feature grid */}
      <section id="recursos" className="lp-section" style={{ scrollMarginTop: 70 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div className="eyebrow">Tudo em um só lugar</div>
          <h2 style={{ fontSize: 'clamp(24px, 5.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '8px 0 0' }}>
            Feito para o seu dia a dia
          </h2>
        </div>
        <div className="lp-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card--hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-soft)', border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section style={{ maxWidth: 780, margin: '32px auto 0', padding: '20px' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'clamp(26px, 6vw, 56px)' }}>
          <h2 style={{ fontSize: 'clamp(23px, 5.5vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Pronto para prosperar?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: '14px auto 26px', maxWidth: 460, lineHeight: 1.55 }}>
            Leva menos de um minuto para criar sua conta. Seus dados são privados e protegidos.
          </p>
          <Link href={user ? '/dashboard' : '/login'} className="btn btn--primary" style={{ height: 52, padding: '0 28px', fontSize: 15 }}>
            {user ? 'Ir para o app' : 'Criar minha conta grátis'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: 1120, margin: '0 auto', padding: '36px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', color: 'var(--ink-3)', fontSize: 12.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logomark size={22} />
          <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>Prosper</span>
        </div>
        <span>EST. 2026 · Criptografia ponta a ponta</span>
      </footer>
    </div>
  );
}
