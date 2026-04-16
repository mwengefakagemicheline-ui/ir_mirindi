alter table agricultural_inquiries enable row level security;

drop policy if exists "Agricultural inquiries public delete" on agricultural_inquiries;

create policy "Agricultural inquiries public delete"
on agricultural_inquiries for delete
to public
using (true);
