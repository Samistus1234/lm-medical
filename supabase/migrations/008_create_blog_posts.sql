create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ar text,
  slug text not null unique,
  content text not null default '',
  content_ar text,
  cover_image text,
  author text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_blog_posts_slug on public.blog_posts(slug);
create index idx_blog_posts_status on public.blog_posts(status);
