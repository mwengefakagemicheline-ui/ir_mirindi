-- Full schema for ShopAccessoires (demo public)
-- This file is safe to run multiple times.

-- Extensions
create extension if not exists "pgcrypto";

-- Tables
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text default '',
  image_url text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text default '',
  price numeric(10,2) not null check (price >= 0),
  compare_price numeric(10,2) check (compare_price >= 0),
  image_url text,
  images text[] default '{}',
  stock integer default 0 check (stock >= 0),
  sku text unique not null,
  brand text,
  is_featured boolean default false,
  is_new boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled')),
  total numeric(10,2) not null check (total >= 0),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address text not null,
  city text,
  postal_code text,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_image text,
  quantity integer not null check (quantity > 0),
  price numeric(10,2) not null check (price >= 0),
  created_at timestamptz default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity integer default 1 check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, product_id)
);

-- Function for safe stock decrement
create or replace function decrement_stock(product_id uuid, quantity integer)
returns integer
language plpgsql
as $$
declare
  current_stock integer;
  new_stock integer;
begin
  select stock into current_stock
  from products
  where id = product_id
  for update;

  if current_stock is null then
    raise exception 'Product not found';
  end if;

  if current_stock < quantity then
    raise exception 'Insufficient stock';
  end if;

  new_stock := current_stock - quantity;

  update products
  set stock = new_stock,
      updated_at = now()
  where id = product_id;

  return new_stock;
end;
$$;

-- Indexes
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_featured on products(is_featured) where is_featured = true;
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_cart_items_user on cart_items(user_id);

-- RLS
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table cart_items enable row level security;

-- Demo public policies
-- Categories
create policy if not exists "Categories public read"
  on categories for select
  to public
  using (true);

create policy if not exists "Categories public insert"
  on categories for insert
  to public
  with check (true);

create policy if not exists "Categories public update"
  on categories for update
  to public
  using (true)
  with check (true);

create policy if not exists "Categories public delete"
  on categories for delete
  to public
  using (true);

-- Products
create policy if not exists "Products public read"
  on products for select
  to public
  using (true);

create policy if not exists "Products public insert"
  on products for insert
  to public
  with check (true);

create policy if not exists "Products public update"
  on products for update
  to public
  using (true)
  with check (true);

create policy if not exists "Products public delete"
  on products for delete
  to public
  using (true);

-- Orders
create policy if not exists "Orders public read"
  on orders for select
  to public
  using (true);

create policy if not exists "Orders public insert"
  on orders for insert
  to public
  with check (true);

-- Order items
create policy if not exists "Order items public read"
  on order_items for select
  to public
  using (true);

create policy if not exists "Order items public insert"
  on order_items for insert
  to public
  with check (true);

-- NOTE: cart_items still requires auth; keep as-is or open if needed.
