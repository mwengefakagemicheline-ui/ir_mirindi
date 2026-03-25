-- Demo public policies

-- Categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

CREATE POLICY "Categories public read"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Categories public insert"
  ON categories FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Categories public update"
  ON categories FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Categories public delete"
  ON categories FOR DELETE
  TO public
  USING (true);

-- Products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

CREATE POLICY "Products public read"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Products public insert"
  ON products FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Products public update"
  ON products FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Products public delete"
  ON products FOR DELETE
  TO public
  USING (true);

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Orders public read"
  ON orders FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Orders public insert"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

-- Order items
DROP POLICY IF EXISTS "Users can view order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can create order items" ON order_items;

CREATE POLICY "Order items public read"
  ON order_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Order items public insert"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (true);
