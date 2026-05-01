# Setup Supabase

## 1. Creer les tables
Ouvre Supabase > SQL Editor.
Colle le contenu de `supabase/setup_project.sql`.
Clique sur Run.

## 2. Variables d'environnement
Le projet lit deja:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ADMIN_EMAILS (optionnel)

## 3. Creer un compte admin
Dans Supabase > Authentication > Users:
1. Cree un utilisateur avec email + mot de passe.
2. Dans `.env`, ajoute son email dans `VITE_ADMIN_EMAILS`.
3. Redemarre le front.
4. Connecte-toi sur `/admin/login`.

## 4. Comment l'admin marche
- Le front verifie la session Supabase.
- Si `VITE_ADMIN_EMAILS` est vide, tout utilisateur connecte peut entrer dans l'admin.
- Si `VITE_ADMIN_EMAILS` contient des emails, seuls ces emails ont acces a l'admin.
- Les policies SQL actuelles sont en mode demo pour que l'admin puisse ecrire tout de suite.

## 5. Tables utilisees
- categories
- products
- orders
- order_items
- cart_items
- agricultural_contact_settings
- agricultural_portfolio_items
- agricultural_inquiries
- fonction `decrement_stock(uuid, integer)`

## 6. Requetes utiles
select * from categories order by name;
select * from products order by created_at desc;
select * from orders order by created_at desc;
select * from order_items order by created_at desc;
select * from agricultural_inquiries order by created_at desc;

## 7. Important
Si tu veux, je peux ensuite te durcir la securite RLS pour que seuls les admins ecrivent en base.
