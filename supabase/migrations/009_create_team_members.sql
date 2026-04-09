create type team_role as enum ('admin', 'sales', 'inventory', 'viewer');

create table public.team_members (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role team_role not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_team_members_role on public.team_members(role);
