create table public.products (
  id uuid primary key default gen_random_uuid(),
  item_code text not null unique,
  category text not null,
  item_name text not null,
  variant text,
  description text,
  notes text,
  stock_qty integer not null default 0,
  cost_price_sdg numeric not null default 0,
  sale_price_sdg numeric not null default 0,
  cost_price_usd numeric not null default 0,
  sale_price_usd numeric not null default 0,
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_category on public.products(category);
create index idx_products_item_code on public.products(item_code);
create index idx_products_is_active on public.products(is_active);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row execute function update_updated_at();
