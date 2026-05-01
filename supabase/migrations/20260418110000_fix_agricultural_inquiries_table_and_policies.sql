create table if not exists agricultural_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  reply_message text,
  replied_at timestamptz,
  created_at timestamptz default now()
);

alter table agricultural_inquiries
  add column if not exists reply_message text,
  add column if not exists replied_at timestamptz,
  add column if not exists created_at timestamptz default now();

create index if not exists idx_agricultural_inquiries_created_at
on agricultural_inquiries(created_at desc);

alter table agricultural_inquiries enable row level security;

drop policy if exists "Agricultural inquiries public insert" on agricultural_inquiries;
drop policy if exists "Agricultural inquiries public read" on agricultural_inquiries;
drop policy if exists "Agricultural inquiries public update" on agricultural_inquiries;
drop policy if exists "Agricultural inquiries public delete" on agricultural_inquiries;

create policy "Agricultural inquiries public insert"
on agricultural_inquiries for insert
to public
with check (true);

create policy "Agricultural inquiries public read"
on agricultural_inquiries for select
to public
using (true);

create policy "Agricultural inquiries public update"
on agricultural_inquiries for update
to public
using (true)
with check (true);

create policy "Agricultural inquiries public delete"
on agricultural_inquiries for delete
to public
using (true);
