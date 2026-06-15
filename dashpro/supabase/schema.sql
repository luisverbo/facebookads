-- =====================================================================
-- DashPro — schema completo (Supabase SQL Editor)
-- Inclui o schema base + a integração Huggy.
-- Rode este arquivo inteiro no SQL Editor do Supabase.
-- =====================================================================

-- Extensão necessária
create extension if not exists "uuid-ossp";

-- Gestores (um por conta Supabase Auth)
create table public.managers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz default now()
);

-- Workspaces (um por cliente)
create table public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  manager_id uuid not null references public.managers(id) on delete cascade,
  client_name text not null,
  client_logo_url text,
  report_pin char(4) not null default lpad(floor(random()*9999)::text, 4, '0'),
  report_slug text unique not null,
  status text not null default 'trial' check (status in ('trial','active','paused','cancelled')),
  trial_ends_at timestamptz default now() + interval '7 days',
  monthly_goal_leads int,
  monthly_goal_cpl numeric(10,2),
  notes text,
  -- Integração Huggy
  huggy_webhook_token text,
  huggy_company_code text,
  created_at timestamptz default now()
);

-- Métricas diárias (vindas do Meta Ads)
create table public.daily_metrics (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  date date not null,
  spend numeric(10,2) default 0,
  leads int default 0,
  impressions int default 0,
  clicks int default 0,
  reach int default 0,
  cpl numeric(10,2) generated always as (
    case when leads > 0 then spend / leads else 0 end
  ) stored,
  ctr numeric(6,4) generated always as (
    case when impressions > 0 then clicks::numeric / impressions else 0 end
  ) stored,
  created_at timestamptz default now(),
  unique(workspace_id, date)
);

-- Log de atividades
create table public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event_type text not null,
  description text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Conexões Meta Ads
create table public.meta_connections (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  access_token text not null,
  ad_account_id text not null,
  page_id text,
  token_expires_at timestamptz,
  created_at timestamptz default now()
);

-- Contatos recebidos via WhatsApp (vindos do Huggy)
create table public.whatsapp_contacts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  huggy_contact_id text not null,
  phone text,
  name text,
  department text,
  first_contact_at timestamptz not null,
  last_message_at timestamptz not null,
  message_count int default 1,
  created_at timestamptz default now(),
  unique(workspace_id, huggy_contact_id)
);

-- RLS: gestor só vê os próprios workspaces
alter table public.managers enable row level security;
alter table public.workspaces enable row level security;
alter table public.daily_metrics enable row level security;
alter table public.activity_logs enable row level security;
alter table public.meta_connections enable row level security;
alter table public.whatsapp_contacts enable row level security;

create policy "managers_own" on public.managers
  for all using (auth.uid() = id);

create policy "workspaces_own" on public.workspaces
  for all using (manager_id = auth.uid());

create policy "metrics_own" on public.daily_metrics
  for all using (
    workspace_id in (
      select id from public.workspaces where manager_id = auth.uid()
    )
  );

create policy "logs_own" on public.activity_logs
  for all using (
    workspace_id in (
      select id from public.workspaces where manager_id = auth.uid()
    )
  );

create policy "meta_own" on public.meta_connections
  for all using (
    workspace_id in (
      select id from public.workspaces where manager_id = auth.uid()
    )
  );

create policy "wa_contacts_own" on public.whatsapp_contacts
  for all using (
    workspace_id in (
      select id from public.workspaces where manager_id = auth.uid()
    )
  );

-- Índices para performance (Huggy)
create index on public.whatsapp_contacts(workspace_id, first_contact_at);
create index on public.whatsapp_contacts(workspace_id, last_message_at);

-- Função para auto-criar manager após signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.managers (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Incrementa contador de mensagens para contato existente (Huggy)
create or replace function public.increment_message_count(
  p_workspace_id uuid,
  p_huggy_contact_id text,
  p_last_message_at timestamptz
)
returns void language plpgsql security definer as $$
begin
  -- Atualiza SOMENTE last_message_at e message_count.
  -- first_contact_at nunca é alterado aqui (preserva o primeiro contato).
  update public.whatsapp_contacts
  set
    message_count = message_count + 1,
    last_message_at = p_last_message_at
  where
    workspace_id = p_workspace_id
    and huggy_contact_id = p_huggy_contact_id;
end;
$$;
