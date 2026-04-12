alter table public.products
  add column supplier_id uuid references public.suppliers(id) on delete set null;

create index idx_products_supplier on public.products(supplier_id);
