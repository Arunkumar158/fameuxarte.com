-- Create blog_comments table
create table if not exists public.blog_comments (
  id uuid default gen_random_uuid() primary key,
  blog_id text not null,
  name text not null default 'Anonymous',
  email text,
  comment text not null,
  created_at timestamptz default now() not null,
  approved boolean default true not null
);

-- Enable RLS
alter table public.blog_comments enable row level security;

-- Allow anyone to read approved comments
create policy "Anyone can view approved comments"
  on public.blog_comments
  for select
  using (approved = true);

-- Allow anyone to post a comment
create policy "Anyone can insert a comment"
  on public.blog_comments
  for insert
  with check (true);

-- Index for fast lookups by blog_id
create index if not exists blog_comments_blog_id_idx on public.blog_comments (blog_id);
