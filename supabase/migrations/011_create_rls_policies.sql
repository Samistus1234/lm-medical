-- Enable RLS on all tables
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.invoices enable row level security;
alter table public.pipeline_deals enable row level security;
alter table public.blog_posts enable row level security;
alter table public.team_members enable row level security;
alter table public.activity_log enable row level security;

-- Helper: get current user's role
create or replace function public.get_my_role()
returns team_role as $$
  select role from public.team_members where id = auth.uid() and is_active = true;
$$ language sql security definer stable;

-- PUBLIC READ POLICIES
create policy "categories_public_read" on public.categories for select using (true);
create policy "products_public_read" on public.products for select using (is_active = true);
create policy "blog_public_read" on public.blog_posts for select using (status = 'published');
create policy "quotes_public_insert" on public.quotes for insert with check (true);
create policy "quote_items_public_insert" on public.quote_items for insert with check (true);

-- ADMIN: full access
create policy "admin_full_categories" on public.categories for all using (public.get_my_role() = 'admin');
create policy "admin_full_products" on public.products for all using (public.get_my_role() = 'admin');
create policy "admin_full_customers" on public.customers for all using (public.get_my_role() = 'admin');
create policy "admin_full_quotes" on public.quotes for all using (public.get_my_role() = 'admin');
create policy "admin_full_quote_items" on public.quote_items for all using (public.get_my_role() = 'admin');
create policy "admin_full_orders" on public.orders for all using (public.get_my_role() = 'admin');
create policy "admin_full_order_items" on public.order_items for all using (public.get_my_role() = 'admin');
create policy "admin_full_invoices" on public.invoices for all using (public.get_my_role() = 'admin');
create policy "admin_full_pipeline" on public.pipeline_deals for all using (public.get_my_role() = 'admin');
create policy "admin_full_blog" on public.blog_posts for all using (public.get_my_role() = 'admin');
create policy "admin_full_team" on public.team_members for all using (public.get_my_role() = 'admin');
create policy "admin_full_activity" on public.activity_log for all using (public.get_my_role() = 'admin');

-- SALES: CRUD on customers, quotes, orders, pipeline; read products
create policy "sales_read_products" on public.products for select using (public.get_my_role() = 'sales');
create policy "sales_full_customers" on public.customers for all using (public.get_my_role() = 'sales');
create policy "sales_full_quotes" on public.quotes for all using (public.get_my_role() = 'sales');
create policy "sales_full_quote_items" on public.quote_items for all using (public.get_my_role() = 'sales');
create policy "sales_full_orders" on public.orders for all using (public.get_my_role() = 'sales');
create policy "sales_full_order_items" on public.order_items for all using (public.get_my_role() = 'sales');
create policy "sales_read_invoices" on public.invoices for select using (public.get_my_role() = 'sales');
create policy "sales_full_pipeline" on public.pipeline_deals for all using (public.get_my_role() = 'sales');
create policy "sales_read_activity" on public.activity_log for select using (public.get_my_role() = 'sales');

-- INVENTORY: CRUD on products; read customers, quotes, orders
create policy "inventory_full_products" on public.products for all using (public.get_my_role() = 'inventory');
create policy "inventory_read_customers" on public.customers for select using (public.get_my_role() = 'inventory');
create policy "inventory_read_quotes" on public.quotes for select using (public.get_my_role() = 'inventory');
create policy "inventory_read_quote_items" on public.quote_items for select using (public.get_my_role() = 'inventory');
create policy "inventory_read_orders" on public.orders for select using (public.get_my_role() = 'inventory');
create policy "inventory_read_order_items" on public.order_items for select using (public.get_my_role() = 'inventory');
create policy "inventory_read_activity" on public.activity_log for select using (public.get_my_role() = 'inventory');

-- VIEWER: read-only
create policy "viewer_read_products" on public.products for select using (public.get_my_role() = 'viewer');
create policy "viewer_read_customers" on public.customers for select using (public.get_my_role() = 'viewer');
create policy "viewer_read_quotes" on public.quotes for select using (public.get_my_role() = 'viewer');
create policy "viewer_read_quote_items" on public.quote_items for select using (public.get_my_role() = 'viewer');
create policy "viewer_read_orders" on public.orders for select using (public.get_my_role() = 'viewer');
create policy "viewer_read_order_items" on public.order_items for select using (public.get_my_role() = 'viewer');
create policy "viewer_read_invoices" on public.invoices for select using (public.get_my_role() = 'viewer');
create policy "viewer_read_pipeline" on public.pipeline_deals for select using (public.get_my_role() = 'viewer');
create policy "viewer_read_blog" on public.blog_posts for select using (public.get_my_role() = 'viewer');
create policy "viewer_read_activity" on public.activity_log for select using (public.get_my_role() = 'viewer');

-- Team members: authenticated users can read their own record
create policy "team_read_self" on public.team_members for select using (id = auth.uid());
