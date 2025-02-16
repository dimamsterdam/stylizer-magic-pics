
create table if not exists public.products (
    id text primary key,
    shopify_gid text,
    title text,
    description text,
    sku text,
    price decimal,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.products enable row level security;

create policy "Allow public read access"
on public.products for select
to authenticated, anon
using (true);

create policy "Allow authenticated insert"
on public.products for insert
to authenticated
with check (true);

create policy "Allow authenticated update"
on public.products for update
to authenticated
using (true)
with check (true);
