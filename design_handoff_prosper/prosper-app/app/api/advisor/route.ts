import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/advisor — Consultor financeiro com IA (server-side).
// Monta o contexto financeiro REAL do usuário (RLS-scoped) e chama a Claude API.
// A chave nunca vai para o cliente. Sem chave configurada, devolve fallback.

export const runtime = 'nodejs';

const MODEL = 'claude-sonnet-4-5-20250929';

interface ClientMsg { role: 'user' | 'assistant'; content: string }

function brl(n: number): string {
  return 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function POST(req: NextRequest) {
  let body: { messages?: ClientMsg[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: 'Sem mensagens' }, { status: 400 });
  }

  // 1) Autenticação + contexto financeiro do usuário (fonte da verdade no banco)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const [{ data: profile }, { data: total }, { data: month }, { data: cats }, { data: goals }] = await Promise.all([
    supabase.from('profiles').select('full_name').single(),
    supabase.rpc('balance_total'),
    supabase.rpc('month_summary').single(),
    supabase.rpc('category_breakdown'),
    supabase.from('goals').select('name,target,current,monthly,shared'),
  ]);

  const income = Number((month as any)?.income ?? 0);
  const expense = Number((month as any)?.expense ?? 0);
  const net = Number((month as any)?.net ?? 0);
  const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : '0';

  const catLines = (cats ?? []).map((c: any) => `- ${c.category}: ${brl(Number(c.amount))}`).join('\n') || '- (sem despesas no mês)';
  const goalLines = (goals ?? []).map((g: any) => {
    const pct = g.target ? Math.round((g.current / g.target) * 100) : 0;
    return `- ${g.name}: ${brl(Number(g.current))} / ${brl(Number(g.target))} (${pct}%) · aporte ${brl(Number(g.monthly))}/mês${g.shared ? ' · casal' : ''}`;
  }).join('\n') || '- (nenhuma meta cadastrada)';

  const system = `Você é o Consultor Prosper, um assistente financeiro brasileiro especialista em finanças pessoais, integrado ao app Prosper Finance.

DADOS REAIS DO USUÁRIO (use sempre que relevante):
- Nome: ${profile?.full_name || 'usuário'}
- Patrimônio total: ${brl(Number(total ?? 0))}
- Receita do mês: ${brl(income)} | Despesa do mês: ${brl(expense)} | Saldo: ${brl(net)}
- Taxa de poupança atual: ${savingsRate}% (média brasileira ~22%)

DESPESAS DO MÊS POR CATEGORIA:
${catLines}

METAS ATIVAS:
${goalLines}

TOM E ESTILO:
- Motivacional e otimista, próximo mas profissional (estilo Nubank/Mercury).
- Português brasileiro. Respostas CURTAS e diretas (3-5 frases), exceto se pedirem detalhes.
- Use os dados reais acima sempre que possível e transforme números em ações concretas.
- Ao sugerir investimentos, cite apenas categorias genéricas (Tesouro Direto, CDB, ETFs) — nunca ativos específicos nem promessas de retorno.
- Termine com uma sugestão de próximo passo ou pergunta de acompanhamento.
- No máximo 1 emoji discreto por resposta. Sem markdown pesado.`;

  // 2) Chamada à Claude API (server-side). Sem chave → fallback amigável.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: 'O consultor com IA ainda não está configurado neste ambiente (defina ANTHROPIC_API_KEY). Mas, pelos seus dados, sua taxa de poupança está em ' + savingsRate + '% — continue assim e priorize sua meta mais próxima!',
    });
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('Anthropic API error', resp.status, detail);
      return NextResponse.json({ error: 'Falha ao consultar a IA' }, { status: 502 });
    }

    const data = await resp.json();
    const reply = (data?.content ?? [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')
      .trim() || 'Desculpe, não consegui responder agora.';

    return NextResponse.json({ reply });
  } catch (e) {
    console.error('advisor route error', e);
    return NextResponse.json({ error: 'Erro inesperado' }, { status: 500 });
  }
}
