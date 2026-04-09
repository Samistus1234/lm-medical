create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.team_members(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_activity_log_actor on public.activity_log(actor_id);
create index idx_activity_log_entity on public.activity_log(entity_type, entity_id);
create index idx_activity_log_created on public.activity_log(created_at desc);
