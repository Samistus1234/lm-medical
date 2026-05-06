-- Allow invoices to exist without an order (admin can create directly).
alter table public.invoices alter column order_id drop not null;
alter table public.invoices drop constraint invoices_order_id_fkey;
alter table public.invoices
  add constraint invoices_order_id_fkey
  foreign key (order_id) references public.orders(id) on delete set null;

-- Line items for invoices. order-based invoices keep using order_items;
-- standalone invoices store their items here.
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total numeric not null default 0,
  created_at timestamptz not null default now()
);

create index idx_invoice_items_invoice on public.invoice_items(invoice_id);

-- RLS — mirror invoices role policy.
alter table public.invoice_items enable row level security;

create policy "admin_full_invoice_items"
  on public.invoice_items for all using (public.get_my_role() = 'admin');

create policy "sales_read_invoice_items"
  on public.invoice_items for select using (public.get_my_role() = 'sales');
