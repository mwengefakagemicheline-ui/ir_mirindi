alter table categories
  add column if not exists show_on_home boolean default false;

create index if not exists idx_categories_home on categories(show_on_home) where show_on_home = true;
