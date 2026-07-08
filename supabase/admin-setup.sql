-- ============================================
-- ADMIN SETUP — correr DESPUÉS de schema.sql
-- Habilita que un usuario logueado (admin) pueda
-- crear/editar/borrar productos, categorías y subir fotos.
-- ============================================

-- ---------- Permisos de escritura en productos/categorías ----------
-- (la lectura pública ya estaba permitida por schema.sql)

create policy "productos_admin_insert" on products
  for insert to authenticated with check (true);

create policy "productos_admin_update" on products
  for update to authenticated using (true) with check (true);

create policy "productos_admin_delete" on products
  for delete to authenticated using (true);

create policy "categorias_admin_insert" on categories
  for insert to authenticated with check (true);

create policy "categorias_admin_update" on categories
  for update to authenticated using (true) with check (true);

create policy "categorias_admin_delete" on categories
  for delete to authenticated using (true);

-- Para ver los pedidos desde el panel admin (antes solo se podía insertar)
create policy "ordenes_admin_select" on orders
  for select to authenticated using (true);

create policy "ordenes_admin_update" on orders
  for update to authenticated using (true) with check (true);

create policy "order_items_admin_select" on order_items
  for select to authenticated using (true);

-- ---------- Bucket de Storage para fotos de productos ----------

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

-- Cualquiera puede VER las fotos (necesario para que carguen en la tienda)
create policy "productos_fotos_select" on storage.objects
  for select using (bucket_id = 'productos');

-- Solo un usuario logueado (admin) puede subir/editar/borrar fotos
create policy "productos_fotos_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'productos');

create policy "productos_fotos_update" on storage.objects
  for update to authenticated using (bucket_id = 'productos');

create policy "productos_fotos_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'productos');

-- ============================================
-- Crear tu usuario admin:
-- Supabase Dashboard → Authentication → Users → Add user
-- (email + contraseña). Con eso ya puedes entrar en /admin/login
-- No hace falta ningún signup público — el panel no tiene registro,
-- solo login con un usuario que tú crees manualmente.
-- ============================================
