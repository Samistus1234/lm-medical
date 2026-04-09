create type order_status as enum ('confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  quote_id uuid references public.quotes(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status order_status not null default 'confirmed',
  currency currency not null default 'USD',
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  shipping_address text,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1,
  unit_price numeric not null default 0,
  total numeric not null default 0
);

create index idx_orders_status on public.orders(status);
create index idx_orders_customer on public.orders(customer_id);
create index idx_order_items_order on public.order_items(order_id);

create or replace function generate_order_number()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(cast(substring(order_number from 'LM-O-\d{4}-(\d+)') as integer)), 0) + 1
  into next_num
  from public.orders;
  new.order_number := 'LM-O-' || to_char(now(), 'YYYY') || '-' || lpad(next_num::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger orders_auto_number
  before insert on public.orders
  for each row
  when (new.order_number is null or new.order_number = '')
  execute function generate_order_number();
