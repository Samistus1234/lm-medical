create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  name_ar text,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_categories_slug on public.categories(slug);
