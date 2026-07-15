-- ============================================
-- USUARIOS Y ROLES
-- Ejecutar en el SQL Editor de Supabase, DESPUÉS de admin-setup.sql
-- ============================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'empleado' check (role in ('admin', 'empleado')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Función auxiliar: ¿el usuario actual es admin? (security definer para
-- evitar recursión infinita al leer la propia tabla profiles desde una policy)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Cualquier usuario logueado puede ver la lista de perfiles (equipo pequeño,
-- no es información sensible ver nombres/roles de tus compañeros)
create policy "profiles_select_autenticados" on profiles
  for select using (auth.role() = 'authenticated');

-- Solo un admin puede cambiar el rol de alguien (incluido asignar el primer admin)
create policy "profiles_update_solo_admin" on profiles
  for update using (is_admin());

-- Trigger: cuando se crea un usuario en Supabase Auth, se crea su perfil
-- automáticamente con rol 'empleado' por defecto.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- IMPORTANTE — hazlo UNA vez, a mano, después de correr todo esto:
--
-- 1. Crea tu usuario en Authentication → Users → Add user (si no lo
--    habías creado ya).
-- 2. En el SQL Editor, conviértelo en admin (reemplaza el correo):
--
--    update profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
--
-- Sin este paso, tu propio usuario queda como 'empleado' por defecto
-- y no vas a poder entrar a la sección de Usuarios del panel.
-- ============================================
