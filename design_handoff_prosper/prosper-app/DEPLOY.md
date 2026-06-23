# Deploy — Prosper Finance (Next.js + Supabase + Vercel)

Guia passo a passo para colocar o app no ar. Tempo estimado: ~20 min.

---

## Pré-requisitos
- Node.js 18+ instalado (para testar localmente).
- Conta no **Supabase** (gratuita): https://supabase.com
- Conta na **Vercel** (gratuita): https://vercel.com
- Conta no **Anthropic Console** para a chave da IA: https://console.anthropic.com
- (Opcional) Git + GitHub para deploy contínuo.

---

## Passo 1 — Banco de dados (Supabase)
1. Crie um novo projeto em https://supabase.com/dashboard (escolha uma senha de banco e região, ex. São Paulo).
2. No menu lateral: **SQL Editor → New query**.
3. Cole TODO o conteúdo de `../supabase/schema.sql` e clique **Run**.
   - Isso cria as tabelas (`profiles`, `transactions`, `goals`, `accounts`), os enums,
     as políticas de **RLS**, o trigger que cria o perfil no cadastro, e as funções
     `balance_total`, `month_summary`, `category_breakdown`, `contribute_to_goal`.
4. Em **Project Settings → API**, copie:
   - `Project URL` → será o `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → será o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → será o `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta, só server-side)
5. (Recomendado) Em **Authentication → Providers → Email**, mantenha "Email" ativo.
   Para testes rápidos, desative "Confirm email" (Authentication → Settings) para
   entrar sem confirmar o e-mail.

## Passo 2 — Chave da IA (Anthropic)
1. Em https://console.anthropic.com → **API Keys → Create Key**.
2. Copie a chave → será o `ANTHROPIC_API_KEY` (⚠️ secreta, só server-side).
   - Sem essa chave o app funciona normalmente; o consultor responde com um
     fallback até a chave ser configurada.

## Passo 3 — Rodar localmente (opcional, para testar)
```bash
cd prosper-app
cp .env.local.example .env.local
# edite .env.local com os valores dos passos 1 e 2
npm install
npm run dev
```
Acesse http://localhost:3000 → crie uma conta em /login → explore.

## Passo 4 — Deploy na Vercel
### Opção A — via GitHub (deploy contínuo, recomendado)
1. Suba a pasta `prosper-app/` para um repositório no GitHub.
2. Na Vercel: **Add New → Project → Import** o repositório.
3. Framework: **Next.js** (detectado automaticamente). Root: a pasta do app.
4. Em **Environment Variables**, adicione as 4 variáveis (ver tabela abaixo).
5. **Deploy**. Pronto — a Vercel te dá uma URL pública.

### Opção B — via CLI
```bash
npm i -g vercel
cd prosper-app
vercel            # primeira vez: segue o wizard
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY
vercel --prod     # publica em produção
```

## Variáveis de ambiente
| Variável | Onde obter | Exposta ao cliente? |
|----------|-----------|--------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Sim (pública) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | Sim (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role | **Não — secreta** |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys | **Não — secreta** |

> As `NEXT_PUBLIC_*` podem aparecer no cliente (são protegidas pela RLS).
> As secretas **nunca** devem ter o prefixo `NEXT_PUBLIC_` e só são lidas no servidor.

## Passo 5 — Configurar URLs de autenticação
No Supabase → **Authentication → URL Configuration**:
- **Site URL**: a URL de produção da Vercel (ex. `https://prosper.vercel.app`).
- **Redirect URLs**: adicione a mesma URL e `http://localhost:3000` para dev.

---

## Pós-deploy — checklist
- [ ] Criar conta e confirmar que o perfil aparece (trigger funcionando).
- [ ] Lançar uma transação e ver o dashboard atualizar.
- [ ] Criar meta e registrar aporte.
- [ ] Testar o consultor (com `ANTHROPIC_API_KEY` configurada).
- [ ] Confirmar RLS: criar um 2º usuário e garantir que ele NÃO vê os dados do 1º.
- [ ] Em produção, reativar "Confirm email" no Supabase.

## Próximos passos (produção real)
- **Open Finance / Pix:** integrar Pluggy ou Belvo para popular contas/transações
  automaticamente (via rota server-side usando o `SUPABASE_SERVICE_ROLE_KEY`).
- **Modo casal:** tabela `goal_members` + ajuste das policies (ver nota no schema).
- **Tema escuro:** tokens já prontos (`data-theme="dark"`); adicionar um toggle persistido.
- **Domínio próprio:** configurar na Vercel (Settings → Domains).
- **Monitoramento:** logs da Vercel + alertas; revisar o checklist de segurança em `../HANDOFF.md`.
