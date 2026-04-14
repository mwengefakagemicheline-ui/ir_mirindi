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

create index if not exists idx_agricultural_portfolio_sort on agricultural_portfolio_items(sort_order);

alter table agricultural_portfolio_items enable row level security;

drop policy if exists "Agricultural portfolio public read" on agricultural_portfolio_items;
drop policy if exists "Agricultural portfolio public update" on agricultural_portfolio_items;

create policy "Agricultural portfolio public read" on agricultural_portfolio_items for select to public using (true);
create policy "Agricultural portfolio public update" on agricultural_portfolio_items for all to public using (true) with check (true);

insert into agricultural_portfolio_items (name, season, image_url, tips, col_span, sort_order)
select * from (values
  ('Maïs', 'Avril à sept.', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80', array['Semis à 25 000 plants/ha','Apport azoté fractionné','Désherbage précoce'], 'col-span-1 md:col-span-4', 1),
  ('Haricot', 'Mars à juil.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', array['Inoculation rhizobium','Espacement 40×10 cm','Éviter les excès d''eau'], 'col-span-1 md:col-span-2', 2),
  ('Manioc', 'Toute l''année', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', array['Boutures saines 25 cm','Sol bien drainé','Buttage à 3 mois'], 'col-span-1 md:col-span-2', 3),
  ('Tomate', 'Jan. à juin', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80', array['Tuteurage dès 30 cm','Arrosage au pied','Fongicide préventif'], 'col-span-1 md:col-span-4', 4),
  ('Riz', 'Juin à nov.', 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80', array['Repiquage en ligne','Gestion de l''eau','Récolte à maturité'], 'col-span-1 md:col-span-3', 5),
  ('Soja', 'Mai à oct.', 'https://images.unsplash.com/photo-1566218246241-934ad8b38b3b?w=800&q=80', array['Inoculation','Labour profond 25 cm','Récolte avant verse'], 'col-span-1 md:col-span-3', 6)
) as seed(name, season, image_url, tips, col_span, sort_order)
where not exists (select 1 from agricultural_portfolio_items);
