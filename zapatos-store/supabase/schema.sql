-- ============================================
-- SCHEMA: Tienda de Calzado (catálogo + carrito)
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

create extension if not exists "pgcrypto";

-- ---------- CATEGORÍAS ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTOS ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  sizes text[] not null default '{}',      -- ej: {'36','37','38','39','40'}
  colors text[] not null default '{}',     -- ej: {'Negro','Café','Blanco'}
  stock integer not null default 0,
  images text[] not null default '{}',     -- URLs de Supabase Storage
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_active on products(is_active);

-- ---------- ÓRDENES ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  city text,
  payment_method text not null check (payment_method in ('payphone', 'whatsapp')),
  payment_status text not null default 'pendiente' check (payment_status in ('pendiente', 'pagado', 'fallido')),
  status text not null default 'nuevo' check (status in ('nuevo', 'confirmado', 'enviado', 'entregado', 'cancelado')),
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- ITEMS DE ORDEN ----------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  size text,
  color text,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  subtotal numeric(10,2) not null
);

create index if not exists idx_order_items_order on order_items(order_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Categorías y productos: lectura pública
create policy "categorias_publicas_select" on categories
  for select using (true);

create policy "productos_activos_select" on products
  for select using (is_active = true);

-- Órdenes: cualquiera puede crear una orden (checkout público),
-- pero nadie puede leer/editar órdenes de otros desde el cliente.
create policy "ordenes_insert_publico" on orders
  for insert with check (true);

create policy "order_items_insert_publico" on order_items
  for insert with check (true);

-- NOTA: para el panel admin (ver/gestionar órdenes) usa la
-- service_role key desde un backend, o crea policies con auth.uid()
-- cuando agregues login de administrador.
