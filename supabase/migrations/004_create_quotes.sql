create type quote_status as enum ('pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'expired');
create type currency as enum ('SDG', 'USD');

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  organization text,
  status quote_status not null default 'pending',
  currency currency not null default 'USD',
  total_amount numeric,
  notes text,
  internal_notes text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1,
  unit_price numeric,
  total numeric
);

create index idx_quotes_status on public.quotes(status);
create index idx_quotes_customer on public.quotes(customer_id);
create index idx_quote_items_quote on public.quote_items(quote_id);

create or replace function generate_quote_number()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(cast(substring(quote_number from 'LM-Q-\d{4}-(\d+)') as integer)), 0) + 1
  into next_num
  from public.quotes;
  new.quote_number := 'LM-Q-' || to_char(now(), 'YYYY') || '-' || lpad(next_num::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger quotes_auto_number
  before insert on public.quotes
  for each row
  when (new.quote_number is null or new.quote_number = '')
  execute function generate_quote_number();
