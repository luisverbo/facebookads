# DashPro

Plataforma SaaS multi-tenant para gestores de tráfego: conecta o Meta Ads dos
clientes e gera relatórios profissionais com link público protegido por PIN.

## Stack
- Next.js 14 (App Router)
- Supabase (auth + banco + RLS)
- Tailwind CSS
- Recharts
- Integração Meta Ads (OAuth + Graph API)
- Integração Huggy (webhook de WhatsApp para CPL real)

## Setup

1. Instalar dependências:
   ```bash
   npm install
   ```
2. Criar o banco: abra o **SQL Editor** do Supabase e rode o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql). Ele cria todas as tabelas,
   as policies de RLS, os triggers e as funções (incluindo a parte do Huggy).
3. Configurar variáveis de ambiente:
   ```bash
   cp .env.local.example .env.local
   ```
   Preencha:
   - **Supabase**: Project Settings → API → Project URL, anon key e service_role key
   - **Meta**: developers.facebook.com → Meu App → Configurações Básicas → App ID e App Secret
4. Rodar em desenvolvimento:
   ```bash
   npm run dev
   ```

## Integração Huggy

Recebe eventos do Huggy (atendimento via WhatsApp) e salva os contatos para
cruzar com os dados do Meta Ads e calcular o **CPL/CPA real**.

### URL do webhook
Após o deploy (ex.: Vercel):
```
https://SEU-DOMINIO/api/huggy/webhook?workspace_id=ID_DO_WORKSPACE
```
O `workspace_id` aparece na URL do cliente no painel (`/clients/<id>`).

### Configuração no Huggy
1. Huggy → Configurações → Integrações → Webhook
2. Cole a URL acima
3. Ative o evento `receivedAllMessage`
4. Salve

### Token de segurança (recomendado)
Ao cadastrar/editar o cliente, informe o token do Huggy. Ele é salvo em
`workspaces.huggy_webhook_token` e validado (header `x-huggy-token` ou
querystring `token`) em cada requisição.

### Métricas disponíveis
| Métrica | Fonte | Fórmula |
|---|---|---|
| CPL Meta | Meta Ads | Investido ÷ Leads formulário |
| CPL real | Meta + Huggy | Investido ÷ Contatos WA únicos |
| Taxa de contato | Huggy | Contatos WA ÷ Leads Meta × 100 |
| Leads sem contato | Meta + Huggy | Leads Meta − Contatos WA |
