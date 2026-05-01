alter table agricultural_inquiries
add column if not exists reply_subject text,
add column if not exists email_sent_at timestamptz;
