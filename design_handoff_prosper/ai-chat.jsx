// ai-chat.jsx — Consultor Prosper
// Por enquanto SEM API de IA: respostas de exemplo (curadas) baseadas nos
// dados financeiros mostrados no app. A integração com IA real está
// preparada em pfAskAI() para ser ligada numa versão futura.

// ── Motor de respostas de exemplo (offline) ────────────────────────────────
// Casa a pergunta do usuário com tópicos financeiros e devolve uma resposta
// curada, no mesmo tom do consultor. Sem rede, sem dependências.
const PF_CANNED = [
  {
    keys: ['europa', 'viagem', 'viajar', 'antecipar'],
    reply: 'Sua meta da Europa já está em 73% — R$ 10.950 de R$ 15.000. 🎯 Mantendo R$ 580/mês, você fecha em dezembro. Se conseguir separar R$ 156 a mais por mês (dá pra tirar do Lazer, que ficou em R$ 438), antecipa a viagem em cerca de 3 semanas. Quer que eu simule um aporte extra único pra adiantar ainda mais?',
  },
  {
    keys: ['reserva', 'emergência', 'emergencia', 'onde investir a reserva'],
    reply: 'Sua reserva está em R$ 18.300 de R$ 30.000 (61%) — ótimo ritmo. Para reserva de emergência o ideal é liquidez diária e baixo risco: opções como Tesouro Selic ou um CDB de liquidez diária que acompanhe o CDI costumam ser as mais usadas. O importante é poder resgatar a qualquer momento sem perder valor. Quer que eu mostre quanto sua reserva renderia ao mês nesse formato?',
  },
  {
    keys: ['investir', 'investimento', 'render', 'aplicar', 'cdb', 'tesouro', 'ações', 'acoes'],
    reply: 'Com uma taxa de poupança de 50% você tem fôlego pra investir com consistência. Uma divisão comum é: reserva de emergência em renda fixa de liquidez diária, e o que sobra distribuído conforme seu prazo e perfil (renda fixa para metas de curto prazo, um pouco de renda variável como ETFs para o longo prazo). Posso te ajudar a definir quanto direcionar para cada meta — quer começar pela viagem ou pelo carro?',
  },
  {
    keys: ['carro', 'financiar', 'financiamento', 'suv'],
    reply: 'O carro hoje está em 16% (R$ 12.500 de R$ 80.000). No ritmo atual de R$ 1.200/mês, a entrada fica pronta em meados de 2028. Financiar antes disso significa pagar juros que, no Brasil, costumam superar o que você ganharia investindo — então adiantar o aporte e dar uma entrada maior tende a sair mais barato. Quer comparar os dois cenários lado a lado?',
  },
  {
    keys: ['economizar', 'economia', 'gastar menos', 'cortar', 'gastos', 'aporte', 'aumentar'],
    reply: 'Boa notícia: em maio você gastou 12% menos que em abril (R$ 4.213 contra R$ 4.780). As categorias com mais espaço pra otimizar são Lazer (R$ 438) e Alimentação (R$ 1.187). Se redirecionar metade da economia de maio para as metas, você acelera as três ao mesmo tempo. Quer que eu sugira um valor de aporte extra que cabe no seu orçamento?',
  },
  {
    keys: ['gastei', 'quanto', 'despesa', 'mês', 'mes', 'resumo', 'saldo', 'patrimônio', 'patrimonio'],
    reply: 'Resumo de maio: receita de R$ 8.500, despesas de R$ 4.213 e uma sobra de R$ 4.286 — sua melhor taxa de poupança do semestre. Seu patrimônio total está em R$ 23.847, crescendo R$ 1.284 nos últimos 30 dias. Está tudo no rumo certo! Quer que eu mostre pra onde foi cada real este mês?',
  },
];

const PF_FALLBACK = 'Ótima pergunta! Por enquanto estou respondendo com exemplos baseados nos seus dados (receita de R$ 8.500, despesas de R$ 4.213 e 3 metas ativas). Em breve o consultor terá IA de verdade pra responder qualquer pergunta sobre suas finanças. Enquanto isso, posso falar sobre suas metas, investimentos, economia do mês ou o financiamento do carro — é só tocar numa das sugestões.';

function pfCannedReply(text) {
  const t = (text || '').toLowerCase();
  const hit = PF_CANNED.find(c => c.keys.some(k => t.includes(k)));
  return hit ? hit.reply : PF_FALLBACK;
}

// Preparado para a versão futura com IA real (atualmente não usado):
// async function pfAskAI(messages) {
//   return window.claude.complete({ system: PF_AI_SYSTEM, messages });
// }

const PF_SUGGESTIONS = [
  { icon: '✺', text: 'Como antecipar minha viagem para a Europa?' },
  { icon: '◐', text: 'Onde investir minha reserva de emergência?' },
  { icon: '⊙', text: 'Posso aumentar o aporte mensal sem apertar?' },
  { icon: '◇', text: 'Vale a pena financiar o carro ou esperar?' },
];

function AIChatScreen({ navigate, frame }) {
  const isMobile = frame === 'mobile';
  const [messages, setMessages] = React.useState([
    {
      role: 'assistant',
      content: 'Boa noite, Lucas! Você está economizando 50% da sua renda este mês — bem acima da média brasileira. Posso te ajudar a acelerar uma meta, planejar um investimento ou revisar seus gastos. Como vamos prosperar hoje?',
    },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function send(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    // Versão sem API: resposta de exemplo curada, com um pequeno atraso
    // para simular o "pensando". Trocar por pfAskAI(next) numa versão futura.
    const reply = pfCannedReply(text);
    const delay = 650 + Math.min(1100, reply.length * 9);
    setTimeout(() => {
      setMessages([...next, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, delay);
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* Header */}
      <div style={{
        padding: isMobile ? '12px 22px 16px 22px' : '32px 48px 24px 48px',
        borderBottom: '1px solid var(--line-soft)',
        background: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--accent)', color: 'var(--accent-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <I.Sparkles size={20} />
            <span style={{
              position: 'absolute', bottom: -1, right: -1,
              width: 12, height: 12, borderRadius: '50%',
              background: 'var(--warning)', border: '2px solid var(--bg)',
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div className="pf-serif" style={{ fontSize: isMobile ? 22 : 28 }}>
                Consultor <em style={{ fontStyle: 'italic' }}>Prosper</em>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, background: 'var(--warning)', borderRadius: '50%' }} />
              Prévia · respostas de exemplo · IA completa em breve
            </div>
          </div>
          {!isMobile && <button className="pf-tap" style={{ color: 'var(--ink-3)' }}><I.More size={20} /></button>}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="pf-noscroll" style={{
        flex: 1, overflowY: 'auto',
        padding: isMobile ? '20px 22px' : '32px 48px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {messages.map((m, i) => (
            <Message key={i} role={m.role} content={m.content} isMobile={isMobile} />
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent)', color: 'var(--accent-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <I.Sparkles size={14} />
              </div>
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 18, padding: '14px 18px', display: 'flex', gap: 4,
              }}>
                <span className="pf-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-3)', display: 'block' }} />
                <span className="pf-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-3)', display: 'block' }} />
                <span className="pf-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-3)', display: 'block' }} />
              </div>
            </div>
          )}

          {/* Suggestions: show before first user message */}
          {messages.length === 1 && !loading && (
            <div className="pf-fade" style={{ marginTop: 8 }}>
              <Eyebrow style={{ marginBottom: 10 }}>Comece com</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                {PF_SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => send(s.text)} className="pf-tap" style={{
                    textAlign: 'left', padding: '14px 16px',
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)', display: 'flex', gap: 10, alignItems: 'center',
                    fontSize: 14, color: 'var(--ink)',
                  }}>
                    <span style={{ fontSize: 18, color: 'var(--accent)' }}>{s.icon}</span>
                    <span style={{ flex: 1 }}>{s.text}</span>
                    <I.ArrowRight size={14} style={{ color: 'var(--ink-3)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div style={{
        padding: isMobile ? '14px 22px 22px 22px' : '20px 48px 32px 48px',
        background: 'var(--bg)',
        borderTop: '1px solid var(--line-soft)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} style={{
            display: 'flex', alignItems: 'flex-end', gap: 10,
            padding: '8px 8px 8px 18px',
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 24,
          }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Pergunte algo sobre suas finanças..."
              rows={1}
              style={{
                flex: 1, resize: 'none', fontSize: 14, lineHeight: 1.5,
                padding: '10px 0', maxHeight: 120,
              }}
            />
            <button type="submit" disabled={!input.trim() || loading} className="pf-tap" style={{
              width: 40, height: 40, borderRadius: '50%',
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--line)',
              color: input.trim() && !loading ? 'var(--accent-ink)' : 'var(--ink-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}>
              <I.Send size={16} />
            </button>
          </form>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-3)', textAlign: 'center' }}>
            Respostas de exemplo nesta prévia. O consultor com IA chega numa próxima versão.
          </div>
        </div>
      </div>
    </div>
  );
}

function Message({ role, content, isMobile }) {
  if (role === 'user') {
    return (
      <div className="pf-fade" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          background: 'var(--ink)', color: 'var(--bg)',
          padding: '12px 16px', borderRadius: '18px 18px 4px 18px',
          maxWidth: '78%', fontSize: 14, lineHeight: 1.5,
        }}>{content}</div>
      </div>
    );
  }
  return (
    <div className="pf-fade" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'var(--accent)', color: 'var(--accent-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
      }}>
        <I.Sparkles size={14} />
      </div>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line)',
        padding: '14px 18px', borderRadius: '4px 18px 18px 18px',
        maxWidth: '85%', fontSize: 14, lineHeight: 1.6,
        color: 'var(--ink)',
        whiteSpace: 'pre-wrap',
      }}>{content}</div>
    </div>
  );
}

Object.assign(window, { AIChatScreen });
