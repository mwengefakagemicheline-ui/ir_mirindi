/*
  # E-commerce Database Schema

  ## Overview
  Complete database schema for an e-commerce platform selling accessories (phones, computers, appliances, etc.)

  ## New Tables
  
  ### `categories`
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name (e.g., "Phone Accessories", "Computer Accessories")
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Category description
  - `image_url` (text) - Category image
  - `created_at` (timestamptz) - Creation timestamp

  ### `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `category_id` (uuid, foreign key) - Reference to category
  - `name` (text) - Product name
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Product description
  - `price` (numeric) - Product price
  - `compare_price` (numeric, nullable) - Original price for discounts
  - `image_url` (text) - Main product image
  - `images` (text array) - Additional product images
  - `stock` (integer) - Available quantity
  - `sku` (text, unique) - Stock keeping unit
  - `is_featured` (boolean) - Featured product flag
  - `is_new` (boolean) - New product flag
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `orders`
  - `id` (uuid, primary key) - Unique order identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `status` (text) - Order status (pending, paid, shipped, delivered, cancelled)
  - `total` (numeric) - Total order amount
  - `customer_name` (text) - Customer name
  - `customer_email` (text) - Customer email
  - `customer_phone` (text) - Customer phone
  - `shipping_address` (text) - Shipping address
  - `notes` (text) - Order notes
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `order_items`
  - `id` (uuid, primary key) - Unique item identifier
  - `order_id` (uuid, foreign key) - Reference to order
  - `product_id` (uuid, foreign key) - Reference to product
  - `product_name` (text) - Product name snapshot
  - `product_image` (text) - Product image snapshot
  - `quantity` (integer) - Ordered quantity
  - `price` (numeric) - Price at time of order
  - `created_at` (timestamptz) - Creation timestamp

  ### `cart_items`
  - `id` (uuid, primary key) - Unique cart item identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `product_id` (uuid, foreign key) - Reference to product
  - `quantity` (integer) - Cart quantity
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Categories and products are publicly readable
  - Only authenticated admins can modify products and categories
  - Users can only view and modify their own cart items
  - Users can only view their own orders
  - Only authenticated admins can create and update orders

  ## Important Notes
  1. Product data is snapshotted in order_items to preserve historical accuracy
  2. Stock management should be handled atomically during checkout
  3. All prices are stored as numeric for precision
  4. Images are stored as URLs (actual files in Supabase Storage)
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_price numeric(10,2) CHECK (compare_price >= 0),
  image_url text,
  images text[] DEFAULT '{}',
  stock integer DEFAULT 0 CHECK (stock >= 0),
  sku text UNIQUE NOT NULL,
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Cart items policies (users can only access their own cart)
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies (users can view own orders, admins can view/manage all)
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Order items policies (viewable with order access)
CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
      )
    )
  );

CREATE POLICY "Authenticated users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);

-- Insert sample categories
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Accessoires Téléphone', 'telephone', 'Coques, chargeurs, écouteurs et plus', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Accessoires Ordinateur', 'ordinateur', 'Souris, claviers, webcams, supports', 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Électroménager', 'electromenager', 'Cafetières, mixeurs, grille-pain', 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Audio & Vidéo', 'audio-video', 'Casques, enceintes, câbles HDMI', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (category_id, name, slug, description, price, compare_price, image_url, stock, sku, is_featured, is_new) 
SELECT 
  c.id,
  'Coque iPhone 15 Pro Silicone',
  'coque-iphone-15-pro',
  'Coque en silicone de haute qualité pour iPhone 15 Pro. Protection optimale contre les chocs et les rayures. Disponible en plusieurs couleurs.',
  29.99,
  39.99,
  'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800',
  50,
  'IP15-CASE-001',
  true,
  true
FROM categories c WHERE c.slug = 'telephone'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, price, image_url, stock, sku, is_featured) 
SELECT 
  c.id,
  'Chargeur Sans Fil 15W',
  'chargeur-sans-fil-15w',
  'Chargeur rapide sans fil compatible avec tous les smartphones Qi. Design élégant et compact.',
  34.99,
  'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=800',
  30,
  'CHRG-WL-001',
  true
FROM categories c WHERE c.slug = 'telephone'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, price, compare_price, image_url, stock, sku, is_new) 
SELECT 
  c.id,
  'Souris Gaming RGB',
  'souris-gaming-rgb',
  'Souris gaming avec éclairage RGB personnalisable. 6 boutons programmables, DPI ajustable jusqu''à 12000.',
  49.99,
  69.99,
  'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800',
  25,
  'PC-MOUSE-001',
  true
FROM categories c WHERE c.slug = 'ordinateur'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, price, image_url, stock, sku, is_featured) 
SELECT 
  c.id,
  'Clavier Mécanique RGB',
  'clavier-mecanique-rgb',
  'Clavier mécanique avec switches Cherry MX. Rétroéclairage RGB, repose-poignet inclus.',
  89.99,
  'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=800',
  15,
  'PC-KBD-001',
  true
FROM categories c WHERE c.slug = 'ordinateur'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, price, image_url, stock, sku) 
SELECT 
  c.id,
  'Cafetière Expresso Automatique',
  'cafetiere-expresso-auto',
  'Machine à café expresso automatique. Broyeur intégré, 15 bars de pression, réservoir 1.8L.',
  299.99,
  'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=800',
  10,
  'CAFE-ESP-001'
FROM categories c WHERE c.slug = 'electromenager'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, price, compare_price, image_url, stock, sku, is_new) 
SELECT 
  c.id,
  'Casque Bluetooth à Réduction de Bruit',
  'casque-bluetooth-anc',
  'Casque audio sans fil avec réduction active du bruit. Autonomie 30h, son haute fidélité.',
  149.99,
  199.99,
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
  20,
  'AUD-HP-001',
  true
FROM categories c WHERE c.slug = 'audio-video'
ON CONFLICT (sku) DO NOTHING;