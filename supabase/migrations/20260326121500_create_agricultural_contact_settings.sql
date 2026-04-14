create table if not exists agricultural_contact_settings (
  id bigint primary key,
  location_label text not null default 'Notre agence',
  location_value text not null default 'République démocratique du Congo, Minova centre commercial, en face de l''hôtel Luna',
  phone_label text not null default 'Ligne directe',
  phone_value text not null default '+33 1 23 45 67 89',
  email_label text not null default 'Support expert',
  email_value text not null default 'agronomie@startup.co',
  updated_at timestamptz default now()
);

alter table agricultural_contact_settings enable row level security;

drop policy if exists "Agricultural contact public read" on agricultural_contact_settings;
drop policy if exists "Agricultural contact public upsert" on agricultural_contact_settings;

create policy "Agricultural contact public read" on agricultural_contact_settings for select to public using (true);
create policy "Agricultural contact public upsert" on agricultural_contact_settings for all to public using (true) with check (true);

insert into agricultural_contact_settings (id) values (1)
on conflict (id) do nothing;
