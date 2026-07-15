-- ============================================
-- GASTOS
-- Ejecutar en el SQL Editor de Supabase, DESPUÉS de roles-setup.sql
-- ============================================

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  amount numeric(10,2) not null,
  description text,
  expense_date date not null default current_date,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_date on expenses(expense_date);

alter table expenses enable row level security;

-- Cualquiera del equipo (admin o empleado) puede ver y registrar gastos
create policy "gastos_select_autenticados" on expenses
  for select using (auth.role() = 'authenticated');

create policy "gastos_insert_autenticados" on expenses
  for insert with check (auth.role() = 'authenticated');

-- Solo admin puede editar o borrar un gasto ya registrado
-- (un empleado que se equivoca registra uno nuevo o le avisa al admin,
-- así queda rastro de todo)
create policy "gastos_update_solo_admin" on expenses
  for update using (is_admin());

create policy "gastos_delete_solo_admin" on expenses
  for delete using (is_admin());
