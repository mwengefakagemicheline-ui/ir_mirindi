/*
  # Add stock management function

  ## Overview
  Creates a database function to safely decrement product stock during checkout

  ## New Functions
  - `decrement_stock(product_id, quantity)` - Safely decrements stock with atomic operation

  ## Important Notes
  1. Uses atomic operations to prevent race conditions
  2. Will raise an exception if stock is insufficient
  3. Returns the new stock value
*/

CREATE OR REPLACE FUNCTION decrement_stock(product_id uuid, quantity integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock integer;
  new_stock integer;
BEGIN
  SELECT stock INTO current_stock
  FROM products
  WHERE id = product_id
  FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF current_stock < quantity THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;

  new_stock := current_stock - quantity;

  UPDATE products
  SET stock = new_stock,
      updated_at = now()
  WHERE id = product_id;

  RETURN new_stock;
END;
$$;
