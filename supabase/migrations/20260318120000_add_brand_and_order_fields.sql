-- Add brand and order address fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code text;
