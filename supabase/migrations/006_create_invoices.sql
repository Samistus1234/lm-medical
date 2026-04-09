create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  order_id uuid not null references public.orders(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status invoice_status not null default 'draft',
  currency currency not null default 'USD',
  subtotal numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  due_date date not null,
  paid_at timestamptz,
  pdf_url text,
  created_at timestamptz not null default now()
);

create index idx_invoices_status on public.invoices(status);
create index idx_invoices_customer on public.invoices(customer_id);
create index idx_invoices_due_date on public.invoices(due_date);

create or replace function generate_invoice_number()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(cast(substring(invoice_number from 'LM-INV-\d{4}-(\d+)') as integer)), 0) + 1
  into next_num
  from public.invoices;
  new.invoice_number := 'LM-INV-' || to_char(now(), 'YYYY') || '-' || lpad(next_num::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger invoices_auto_number
  before insert on public.invoices
  for each row
  when (new.invoice_number is null or new.invoice_number = '')
  execute function generate_invoice_number();
