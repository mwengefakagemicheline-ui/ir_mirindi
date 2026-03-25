-- Seed accessories products (run once; safe with ON CONFLICT)

-- Ensure base categories exist
insert into categories (name, slug, description, image_url) values
  ('Électroménager', 'electromenager', 'Appareils essentiels pour la maison', 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Accessoires Téléphone', 'telephone', 'Coques, chargeurs, écouteurs et plus', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Accessoires Ordinateur', 'ordinateur', 'Souris, claviers, supports', 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800')
on conflict (slug) do nothing;

-- Products
insert into products (category_id, name, slug, description, price, image_url, stock, sku, is_featured, is_new)
select c.id, 'Réchaud électrique 2 plaques', 'rechaud-electrique-2-plaques',
  'Réchaud compact à double plaque, chauffe rapide et consommation réduite.',
  49.99, 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200&q=80', 25, 'ELEC-RECH-001', true, true
from categories c where c.slug = 'electromenager'
on conflict (sku) do nothing;

insert into products (category_id, name, slug, description, price, image_url, stock, sku, is_featured, is_new)
select c.id, 'Fer à repasser vapeur', 'fer-a-repasser-vapeur',
  'Fer à vapeur performant, semelle anti-adhésive, réglages précis.',
  39.99, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80', 40, 'ELEC-FER-001', true, true
from categories c where c.slug = 'electromenager'
on conflict (sku) do nothing;

insert into products (category_id, name, slug, description, price, image_url, stock, sku, is_featured, is_new)
select c.id, 'Ventilateur silencieux 40cm', 'ventilateur-silencieux-40cm',
  'Ventilateur puissant et silencieux, 3 vitesses, oscillation automatique.',
  59.99, 'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?w=1200&q=80', 30, 'ELEC-VENT-001', true, true
from categories c where c.slug = 'electromenager'
on conflict (sku) do nothing;

insert into products (category_id, name, slug, description, price, image_url, stock, sku, is_featured, is_new)
select c.id, 'Powerbank 20 000 mAh', 'powerbank-20000mah',
  'Grande capacité, charge rapide, double port USB.',
  34.99, 'https://images.unsplash.com/photo-1512499617640-c2f999098c4a?w=1200&q=80', 50, 'TEL-PB-001', true, true
from categories c where c.slug = 'telephone'
on conflict (sku) do nothing;

insert into products (category_id, name, slug, description, price, image_url, stock, sku, is_featured, is_new)
select c.id, 'Chargeur USB-C 30W', 'chargeur-usb-c-30w',
  'Charge rapide universelle pour smartphones et tablettes.',
  19.99, 'https://images.unsplash.com/photo-1586941965322-8e92eea1d1a0?w=1200&q=80', 80, 'TEL-CHG-001', false, true
from categories c where c.slug = 'telephone'
on conflict (sku) do nothing;

insert into products (category_id, name, slug, description, price, image_url, stock, sku, is_featured, is_new)
select c.id, 'Souris sans fil ergonomique', 'souris-sans-fil-ergonomique',
  'Souris confortable pour usage quotidien, autonomie longue durée.',
  24.99, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&q=80', 60, 'PC-MOUSE-002', false, true
from categories c where c.slug = 'ordinateur'
on conflict (sku) do nothing;

insert into products (category_id, name, slug, description, price, image_url, stock, sku, is_featured, is_new)
select c.id, 'Support ordinateur portable', 'support-ordinateur-portable',
  'Support aluminium, ventilation améliorée, hauteur réglable.',
  29.99, 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=80', 45, 'PC-STD-001', false, true
from categories c where c.slug = 'ordinateur'
on conflict (sku) do nothing;
