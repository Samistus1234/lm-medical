create type customer_type as enum ('hospital', 'clinic', 'distributor', 'individual');

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  type customer_type not null default 'hospital',
  name text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  city text,
  country text,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_customers_type on public.customers(type);
create index idx_customers_name on public.customers(name);
