alter table agricultural_inquiries
add column if not exists reply_message text,
add column if not exists replied_at timestamptz;
