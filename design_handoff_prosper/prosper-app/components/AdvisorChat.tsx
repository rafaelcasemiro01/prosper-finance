'use client';

import { useState, useRef, useEffect } from 'react';

// Consultor — conversa com IA real via rota server-side /api/advisor.
// A rota monta o contexto financeiro do usuário e chama a Claude API (chave
// fica no servidor). Se a chamada falhar, usa uma resposta de exemplo local.

const SUGGESTIONS = [
  { icon: '✺', text: 'Como antecipar minha viagem para a Europa?' },
  { icon: '◐', text: 'Onde investir minha reserva de emergência?' },
  { icon: '⊙', text: 'Posso aumentar o aporte mensal sem apertar?' },
  { icon: '◇', text: 'Vale a pena financiar o carro ou esperar?' },
];

const CANNED: { keys: string[]; reply: string }[] = [
  { keys: ['europa', 'viagem', 'antecipar'], reply: 'Sua meta da Europa avança bem! Separando um pouco mais por mês — algo que cabe cortando do Lazer — você antecipa a viagem em semanas. Quer que eu simule um aporte extra?' },
  { keys: ['reserva', 'emergência', 'emergencia'], reply: 'Para reserva de emergência o ideal é liquidez diária e baixo risco: opções como Tesouro Selic ou um CDB de liquidez diária que acompanhe o CDI são as mais usadas. O essencial é poder resgatar a qualquer momento sem perder valor.' },
  { keys: ['investir', 'investimento', 'cdb', 'tesouro', 'ações', 'acoes'], reply: 'Com uma boa taxa de poupança, dá para investir com consistência: reserva em renda fixa de liquidez diária e o restante distribuído conforme prazo e perfil (renda fixa no curto prazo, ETFs no longo). Quer ajuda para definir quanto destinar a cada meta?' },
  { keys: ['carro', 'financiar', 'financiamento'], reply: 'Financiar costuma sair caro no Brasil por causa dos juros — geralmente superam o que você ganharia investindo. Adiantar os aportes e dar uma entrada maior tende a compensar. Quer comparar os dois cenários?' },
  { keys: ['economizar', 'economia', 'gastos', 'cortar'], reply: 'As categorias com mais espaço para otimizar costumam ser Lazer e Alimentação. Redirecionando parte dessa economia para as metas, você acelera todas ao mesmo tempo. Quer uma sugestão de valor de aporte extra?' },
];

const FALLBACK = 'Ótima pergunta! Nesta prévia respondo com exemplos. Em breve o consultor terá IA de verdade para analisar seus dados em tempo real. Por enquanto, posso falar sobre metas, investimentos, economia do mês ou financiamento.';

function cannedReply(text: string): string {
  const t = text.toLowerCase();
  return CANNED.find((c) => c.keys.some((k) => t.includes(k)))?.reply ?? FALLBACK;
}

type Msg = { role: 'user' | 'assistant'; content: string };

export function AdvisorChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Olá! Sou o Consultor Prosper. Posso ajudar a acelerar uma meta, planejar um investimento ou revisar seus gastos. Como vamos prosperar hoje?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  function send(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    (async () => {
      try {
        const res = await fetch('/api/advisor', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: next }),
        });
        const data = await res.json();
        const reply = res.ok && data.reply ? data.reply : cannedReply(text);
        setMessages([...next, { role: 'assistant', content: reply }]);
      } catch {
        setMessages([...next, { role: 'assistant', content: cannedReply(text) }]);
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'clamp(440px, 68vh, 720px)' }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: 12, fontSize: 13, color: 'var(--ink)' }}>
            <span style={{ fontSize: 16 }}>✨</span>
            <span>Esta é uma prévia com respostas de exemplo. Em breve vamos implementar o consultor com <strong>IA de verdade</strong>, analisando seus dados em tempo real.</span>
          </div>
          {messages.map((m, i) => <Bubble key={i} role={m.role} content={m.content} />)}
          {loading && <Bubble role="assistant" content="..." />}
          {messages.length === 1 && !loading && (
            <div className="grid grid-2" style={{ gap: 8, marginTop: 4 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s.text)} style={{ textAlign: 'left', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--ink)' }}>
                  <span style={{ fontSize: 18, color: 'var(--accent)' }}>{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 8px 8px 18px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 24, maxWidth: 720, marginTop: 16 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pergunte algo sobre suas finanças..." style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }} />
        <button type="submit" disabled={!input.trim() || loading} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: input.trim() ? 'var(--accent)' : 'var(--line)', color: input.trim() ? 'var(--accent-ink)' : 'var(--ink-3)', fontSize: 16 }}>↑</button>
      </form>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8 }}>
        Funcionalidade de IA em desenvolvimento · disponível em breve
      </div>
    </div>
  );
}

function Bubble({ role, content }: Msg) {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '82%', padding: '12px 16px', fontSize: 14, lineHeight: 1.55,
          borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
          background: isUser ? 'var(--ink)' : 'var(--surface)',
          color: isUser ? 'var(--bg)' : 'var(--ink)',
          border: isUser ? 'none' : '1px solid var(--line)',
        }}
      >
        {content}
      </div>
    </div>
  );
}
