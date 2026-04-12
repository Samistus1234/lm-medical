create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'sent', 'confirmed', 'received', 'cancelled')),
  currency text not null default 'USD',
  subtotal numeric not null default 0,
  notes text,
  sent_at timestamptz,
  received_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete restrict,
  quantity integer not null default 0,
  unit_cost numeric not null default 0,
  total numeric not null default 0,
  created_at timestamptz not null default now()
);

create index idx_purchase_orders_status on public.purchase_orders(status);
create index idx_purchase_orders_supplier on public.purchase_orders(supplier_id);
create index idx_purchase_order_items_po on public.purchase_order_items(purchase_order_id);

create or replace function generate_po_number()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(cast(substring(po_number from 'LM-PO-\d{4}-(\d+)') as integer)), 0) + 1
  into next_num
  from public.purchase_orders;
  new.po_number := 'LM-PO-' || to_char(now(), 'YYYY') || '-' || lpad(next_num::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger purchase_orders_auto_number
  before insert on public.purchase_orders
  for each row
  when (new.po_number is null or new.po_number = '')
  execute function generate_po_number();

alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;

create policy "admin_full_purchase_orders" on public.purchase_orders for all using (public.get_my_role() = 'admin');
create policy "inventory_full_purchase_orders" on public.purchase_orders for all using (public.get_my_role() = 'inventory');
create policy "sales_read_purchase_orders" on public.purchase_orders for select using (public.get_my_role() = 'sales');
create policy "viewer_read_purchase_orders" on public.purchase_orders for select using (public.get_my_role() = 'viewer');

create policy "admin_full_purchase_order_items" on public.purchase_order_items for all using (public.get_my_role() = 'admin');
create policy "inventory_full_purchase_order_items" on public.purchase_order_items for all using (public.get_my_role() = 'inventory');
create policy "sales_read_purchase_order_items" on public.purchase_order_items for select using (public.get_my_role() = 'sales');
create policy "viewer_read_purchase_order_items" on public.purchase_order_items for select using (public.get_my_role() = 'viewer');
