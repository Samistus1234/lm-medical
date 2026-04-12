create or replace function public.increment_stock(p_id uuid, qty integer)
returns void as $$
begin
  update public.products
  set stock_qty = stock_qty + qty
  where id = p_id;
end;
$$ language plpgsql security definer;
