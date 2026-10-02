create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  phone text,
  email text,
  country text not null default 'Rwanda',
  currency text not null default 'RWF',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  price numeric(14,2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (business_id, slug)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','completed','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded')),
  total numeric(14,2) not null default 0 check (total >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  provider text not null,
  provider_reference text,
  amount numeric(14,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','successful','failed','refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','starter','business','pro')),
  status text not null default 'active' check (status in ('active','past_due','cancelled','trialing')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists products_business_id_idx on public.products(business_id);
create index if not exists orders_business_id_created_at_idx on public.orders(business_id, created_at desc);
create index if not exists customers_business_id_idx on public.customers(business_id);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles own row" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "business owner access" on public.businesses for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "products owner access" on public.products for all
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "customers owner access" on public.customers for all
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "orders owner access" on public.orders for all
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "order items owner access" on public.order_items for all
using (exists (
  select 1 from public.orders o
  join public.businesses b on b.id = o.business_id
  where o.id = order_id and b.owner_id = auth.uid()
))
with check (exists (
  select 1 from public.orders o
  join public.businesses b on b.id = o.business_id
  where o.id = order_id and b.owner_id = auth.uid()
));

create policy "payments owner access" on public.payments for all
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "subscriptions owner access" on public.subscriptions for all
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();