-- Supabase schema for gate pass app
-- Run this once in your Supabase SQL editor or via psql.

create table if not exists public.gate_passes (
  id uuid primary key,
  pass jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  event text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

insert into public.settings (key, value)
select 'company',
'{
  "companyName": "Sustainable Medical Billing",
  "address": {
    "line1": "123 Elm Street",
    "city": "City",
    "state": "State",
    "postalCode": "",
    "country": "Country"
  },
  "publicUrl":"https://vumskvlwunxtbddotfrc.supabase.co",
  "logo": "/smb-brand-glow.png"
}'::jsonb
where not exists (select 1 from public.settings where key = 'company');

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_set_updated_at on public.gate_passes;
create trigger trigger_set_updated_at
before update on public.gate_passes
for each row execute function public.set_updated_at();

-- Enable Row Level Security and policies for admin users
alter table public.gate_passes enable row level security;
alter table public.activity_logs enable row level security;
alter table public.settings enable row level security;

-- Policy helper: allow only authenticated users who are in admins table
create policy if not exists admins_only on public.gate_passes
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

create policy if not exists admins_only_logs on public.activity_logs
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

create policy if not exists admins_only_settings on public.settings
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

-- Note: Add initial admin users via Supabase dashboard or insert into public.admins(user_id) using the user's UID.
