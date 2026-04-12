create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  email text,
  phone text,
  whatsapp text,
  address text,
  city text,
  country text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_suppliers_name on public.suppliers(name);
create index idx_suppliers_is_active on public.suppliers(is_active);

alter table public.suppliers enable row level security;

create policy "admin_full_suppliers" on public.suppliers for all using (public.get_my_role() = 'admin');
create policy "inventory_full_suppliers" on public.suppliers for all using (public.get_my_role() = 'inventory');
create policy "sales_read_suppliers" on public.suppliers for select using (public.get_my_role() = 'sales');
create policy "viewer_read_suppliers" on public.suppliers for select using (public.get_my_role() = 'viewer');
