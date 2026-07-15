# Tienda de Calzado — React + Supabase

Catálogo + carrito + checkout con dos métodos de pago: **PayPhone** (tarjeta) y **pedido por WhatsApp**.

## 1. Crear el proyecto en Supabase

1. Ve a https://supabase.com → New Project.
2. Entra a **SQL Editor** y pega el contenido de `supabase/schema.sql`. Ejecútalo.
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
4. (Opcional pero recomendado) Crea un bucket público en **Storage** llamado `productos` para subir las fotos del catálogo.

## 2. Cargar productos de prueba

En el SQL Editor de Supabase:

```sql
insert into categories (name, slug) values
  ('Hombre', 'hombre'),
  ('Mujer', 'mujer');

insert into products (category_id, name, slug, description, price, sizes, colors, stock, images)
select id, 'Mocasín clásico', 'mocasin-clasico',
  'Cuero genuino, suela de cuero cosida a mano.',
  59.90, array['39','40','41','42'], array['Café','Negro'], 15,
  array['https://images.unsplash.com/photo-1614252369475-531eba835eb1']
from categories where slug = 'hombre';
```

## 3. Desplegar en Cloudflare Pages (producción)

1. Sube este proyecto a un repo de GitHub.
2. En Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**, elige el repo.
3. Configuración de build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. En **Settings → Environment variables** del proyecto de Pages, agrega:

   **Variables públicas** (se usan en el build, empiezan con `VITE_`, tipo "Plaintext"):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WHATSAPP_NUMBER`
   - `VITE_PAYPHONE_STORE_ID`

   **Variables secretas** (solo las usa la Pages Function, tipo "Secret", nunca van al navegador):
   - `PAYPHONE_TOKEN` — token secreto de tu cuenta PayPhone
   - `SUPABASE_URL` — igual que `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` — Settings → API → `service_role` en Supabase

5. Guarda y despliega. Cada push a la rama principal vuelve a desplegar automáticamente (igual que GlowSuite).
6. La función `functions/api/payphone-confirm.js` se despliega sola — Cloudflare Pages detecta la carpeta `functions/` y la sirve como `/api/payphone-confirm`, sin configuración extra.

## 4. Configurar WhatsApp

Solo necesitas el número de la tienda en `VITE_WHATSAPP_NUMBER`. El checkout arma
automáticamente el link `wa.me` con el resumen del pedido.

## 5. Configurar PayPhone (pasarela de pago)

1. Crea una cuenta en https://www.payphone.app/ y obtén tu **Store ID**.
2. Pon el Store ID en `VITE_PAYPHONE_STORE_ID` (es público, sin problema).
3. **Importante:** el token secreto de PayPhone NUNCA debe ir en el frontend.
   La confirmación del pago ya está resuelta con una **Cloudflare Pages
   Function** (`functions/api/payphone-confirm.js`) que corre en el servidor,
   confirma la transacción con PayPhone y marca la orden como `pagado` en
   Supabase usando la `service_role` key. Solo necesitas configurar las
   variables secretas al desplegar (ver sección 3).

## 6. Panel de administración (subir fotos, crear/editar productos)

1. En el SQL Editor de Supabase, corre `supabase/admin-setup.sql` (después de `schema.sql`). Esto:
   - Crea el bucket público `productos` en Storage.
   - Da permiso a usuarios logueados para crear/editar/borrar productos, categorías y pedidos.
2. Crea tu usuario admin: Supabase → **Authentication → Users → Add user** (correo + contraseña). No hay registro público — el panel solo tiene login.
3. Entra a `https://tu-dominio/admin/login` con ese correo y contraseña.
4. Desde ahí puedes:
   - Crear/editar/borrar productos y subir sus fotos directamente (arrastra o selecciona el archivo, se sube a Supabase Storage).
   - Crear/borrar categorías.
   - Ver los pedidos que van entrando y cambiar su estado (nuevo → confirmado → enviado → entregado).

No necesitas volver a tocar el SQL Editor de Supabase para el día a día — todo el catálogo se administra desde `/admin`.

## Estructura

```
src/
  lib/            → clientes de Supabase, PayPhone, WhatsApp
  context/        → carrito (localStorage) y sesión de admin
  components/     → Header, ProductCard, CartDrawer, ImageUploader, ProtectedRoute
  pages/          → Catálogo, Detalle, Checkout, Confirmación
  pages/admin/    → Login, Productos, Categorías, Pedidos (panel admin)
supabase/
  schema.sql      → tablas + políticas RLS de la tienda
  admin-setup.sql → bucket de fotos + permisos de admin
functions/
  api/payphone-confirm.js → confirma pagos de PayPhone (Cloudflare Pages Function)
```

## Pendientes sugeridos (siguiente iteración)

- Manejo de stock (descontar automáticamente al confirmar un pedido).
- Búsqueda y filtros adicionales en el catálogo.
- Webhook/notificación (email o WhatsApp) cuando entra un pedido nuevo.
- Reordenar/arrastrar fotos en el formulario de producto.
