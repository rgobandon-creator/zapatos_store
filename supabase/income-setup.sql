-- ============================================
-- INGRESOS MANUALES
-- Ejecutar en el SQL Editor de Supabase, DESPUÉS de expenses-setup.sql
--
-- Nota: las ventas de la tienda YA se registran solas en la tabla
-- 'orders' (cuando alguien compra por WhatsApp o PayPhone). Esta tabla
-- nueva es solo para ingresos que no pasan por el checkout: venta en
-- el local, un abono, etc.
-- ============================================

create table if not exists income (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  amount numeric(10,2) not null,
  description text,
  income_date date not null default current_date,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_income_date on income(income_date);

alter table income enable row level security;

create policy "ingresos_select_autenticados" on income
  for select using (auth.role() = 'authenticated');

create policy "ingresos_insert_autenticados" on income
  for insert with check (auth.role() = 'authenticated');

create policy "ingresos_update_solo_admin" on income
  for update using (is_admin());

create policy "ingresos_delete_solo_admin" on income
  for delete using (is_admin());
