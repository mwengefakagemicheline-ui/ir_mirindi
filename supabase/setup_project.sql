-- Setup Supabase pour le projet accessoires
-- A coller dans Supabase SQL Editor
-- Ce script est idempotent: il peut etre relance sans casser la base.

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text default '',
  image_url text,
  show_on_home boolean default false,
  created_at timestamptz default now()
);

alter table categories add column if not exists show_on_home boolean default false;

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

create table if not exists agricultural_contact_settings (
  id bigint primary key,
  location_label text not null default 'Notre agence',
  location_value text not null default 'République démocratique du Congo, Minova centre commercial, en face de l''hôtel Luna',
  phone_label text not null default 'Ligne directe',
  phone_value text not null default '+243 972492668 & +243 971904750',
  email_label text not null default 'Support expert',
  email_value text not null default 'irmirindibusiness@gmail.com',
  updated_at timestamptz default now()
);

create table if not exists agricultural_portfolio_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  season text not null,
  image_url text not null,
  tips text[] not null default '{}',
  col_span text not null default 'col-span-1 md:col-span-3',
  sort_order integer not null default 0,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

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

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_featured on products(is_featured) where is_featured = true;
create index if not exists idx_categories_home on categories(show_on_home) where show_on_home = true;
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_cart_items_user on cart_items(user_id);
create index if not exists idx_agricultural_portfolio_sort on agricultural_portfolio_items(sort_order);

alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table cart_items enable row level security;
alter table agricultural_contact_settings enable row level security;
alter table agricultural_portfolio_items enable row level security;

drop policy if exists "Categories public read" on categories;
drop policy if exists "Categories public insert" on categories;
drop policy if exists "Categories public update" on categories;
drop policy if exists "Categories public delete" on categories;
drop policy if exists "Products public read" on products;
drop policy if exists "Products public insert" on products;
drop policy if exists "Products public update" on products;
drop policy if exists "Products public delete" on products;
drop policy if exists "Orders public read" on orders;
drop policy if exists "Orders public insert" on orders;
drop policy if exists "Order items public read" on order_items;
drop policy if exists "Order items public insert" on order_items;
drop policy if exists "Agricultural contact public read" on agricultural_contact_settings;
drop policy if exists "Agricultural contact public upsert" on agricultural_contact_settings;
drop policy if exists "Agricultural portfolio public read" on agricultural_portfolio_items;
drop policy if exists "Agricultural portfolio public update" on agricultural_portfolio_items;

create policy "Categories public read" on categories for select to public using (true);
create policy "Categories public insert" on categories for insert to public with check (true);
create policy "Categories public update" on categories for update to public using (true) with check (true);
create policy "Categories public delete" on categories for delete to public using (true);
create policy "Products public read" on products for select to public using (true);
create policy "Products public insert" on products for insert to public with check (true);
create policy "Products public update" on products for update to public using (true) with check (true);
create policy "Products public delete" on products for delete to public using (true);
create policy "Orders public read" on orders for select to public using (true);
create policy "Orders public insert" on orders for insert to public with check (true);
create policy "Order items public read" on order_items for select to public using (true);
create policy "Order items public insert" on order_items for insert to public with check (true);
create policy "Agricultural contact public read" on agricultural_contact_settings for select to public using (true);
create policy "Agricultural contact public upsert" on agricultural_contact_settings for all to public using (true) with check (true);
create policy "Agricultural portfolio public read" on agricultural_portfolio_items for select to public using (true);
create policy "Agricultural portfolio public update" on agricultural_portfolio_items for all to public using (true) with check (true);

insert into categories (name, slug, description, image_url, show_on_home) values
  ('Electromenager', 'electromenager', 'Appareils essentiels pour la maison', 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('Accessoires Telephone', 'telephone', 'Coques, chargeurs, ecouteurs et plus', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('Accessoires Ordinateur', 'ordinateur', 'Souris, claviers, supports', 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800', true)
on conflict (slug) do nothing;

insert into agricultural_contact_settings (id) values (1)
on conflict (id) do nothing;

insert into agricultural_portfolio_items (name, season, image_url, tips, col_span, sort_order)
select * from (values
  ('Maïs', 'Avril à sept.', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80', array['Semis à 25 000 plants/ha','Apport azoté fractionné','Désherbage précoce'], 'col-span-1 md:col-span-4', 1),
  ('Haricot', 'Mars à juil.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', array['Inoculation rhizobium','Espacement 40×10 cm','Éviter les excès d''eau'], 'col-span-1 md:col-span-2', 2),
  ('Manioc', 'Toute l''année', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', array['Boutures saines 25 cm','Sol bien drainé','Buttage à 3 mois'], 'col-span-1 md:col-span-2', 3),
  ('Tomate', 'Jan. à juin', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80', array['Tuteurage dès 30 cm','Arrosage au pied','Fongicide préventif'], 'col-span-1 md:col-span-4', 4),
  ('Riz', 'Juin à nov.', 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80', array['Repiquage en ligne','Gestion de l''eau','Récolte à maturité'], 'col-span-1 md:col-span-3', 5),
  ('Aubergine', 'Toute l''année', 'https://images.unsplash.com/photo-1773901768958-0ed5aaa4913c?auto=format&fit=crop&q=80&w=800', array['Repiquage sur sol enrichi','Arrosage regulier sans exces','Recolte progressive des fruits'], 'col-span-1 md:col-span-3', 6)
) as seed(name, season, image_url, tips, col_span, sort_order)
where not exists (select 1 from agricultural_portfolio_items);
create table if not exists agricultural_portfolio_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  season text not null,
  image_url text not null,
  tips text[] not null default '{}',
  col_span text not null default 'col-span-1 md:col-span-3',
  sort_order integer not null default 0,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists idx_agricultural_portfolio_sort
on agricultural_portfolio_items(sort_order);

alter table agricultural_portfolio_items enable row level security;

drop policy if exists "Agricultural portfolio public read" on agricultural_portfolio_items;
drop policy if exists "Agricultural portfolio public update" on agricultural_portfolio_items;

create policy "Agricultural portfolio public read"
on agricultural_portfolio_items for select to public using (true);

create policy "Agricultural portfolio public update"
on agricultural_portfolio_items for all to public using (true) with check (true);

insert into agricultural_portfolio_items (name, season, image_url, tips, col_span, sort_order)
select * from (values
  ('Maïs', 'Avril à sept.', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80', array['Semis à 25 000 plants/ha','Apport azoté fractionné','Désherbage précoce'], 'col-span-1 md:col-span-4', 1),
  ('Haricot', 'Mars à juil.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', array['Inoculation rhizobium','Espacement 40×10 cm','Éviter les excès d''eau'], 'col-span-1 md:col-span-2', 2),
  ('Manioc', 'Toute l''année', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', array['Boutures saines 25 cm','Sol bien drainé','Buttage à 3 mois'], 'col-span-1 md:col-span-2', 3),
  ('Tomate', 'Jan. à juin', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80', array['Tuteurage dès 30 cm','Arrosage au pied','Fongicide préventif'], 'col-span-1 md:col-span-4', 4),
  ('Riz', 'Juin à nov.', 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80', array['Repiquage en ligne','Gestion de l''eau','Récolte à maturité'], 'col-span-1 md:col-span-3', 5),
  ('Aubergine', 'Toute l''année', 'https://images.unsplash.com/photo-1773901768958-0ed5aaa4913c?auto=format&fit=crop&q=80&w=800', array['Repiquage sur sol enrichi','Arrosage regulier sans exces','Recolte progressive des fruits'], 'col-span-1 md:col-span-3', 6)
) as seed(name, season, image_url, tips, col_span, sort_order)
where not exists (select 1 from agricultural_portfolio_items);




create table if not exists agricultural_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  reply_subject text,
  reply_message text,
  replied_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_agricultural_inquiries_created_at
on agricultural_inquiries(created_at desc);

alter table agricultural_inquiries enable row level security;

drop policy if exists "Agricultural inquiries public insert" on agricultural_inquiries;
drop policy if exists "Agricultural inquiries public read" on agricultural_inquiries;
drop policy if exists "Agricultural inquiries public update" on agricultural_inquiries;
drop policy if exists "Agricultural inquiries public delete" on agricultural_inquiries;

create policy "Agricultural inquiries public insert"
on agricultural_inquiries for insert to public with check (true);

create policy "Agricultural inquiries public read"
on agricultural_inquiries for select to public using (true);

create policy "Agricultural inquiries public update"
on agricultural_inquiries for update to public using (true) with check (true);

create policy "Agricultural inquiries public delete"
on agricultural_inquiries for delete to public using (true);
