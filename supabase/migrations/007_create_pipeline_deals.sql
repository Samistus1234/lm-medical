create type pipeline_stage as enum ('lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost');

create table public.pipeline_deals (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  title text not null,
  stage pipeline_stage not null default 'lead',
  value_sdg numeric,
  value_usd numeric,
  probability integer not null default 0 check (probability >= 0 and probability <= 100),
  assigned_to uuid,
  expected_close date,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_pipeline_deals_stage on public.pipeline_deals(stage);
create index idx_pipeline_deals_customer on public.pipeline_deals(customer_id);
create index idx_pipeline_deals_assigned on public.pipeline_deals(assigned_to);
