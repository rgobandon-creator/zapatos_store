import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminLayout() {
  const { signOut, isAdmin } = useAuth()

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 text-sm rounded-full transition-colors ${
      isActive
        ? 'bg-espresso text-cream'
        : 'text-ink/60 hover:text-espresso'
    }`

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-stitch">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl text-espresso">
              Admin
            </span>
            <nav className="flex gap-1 ml-4">
              <NavLink to="/admin/productos" className={linkClass}>
                Productos
              </NavLink>
              <NavLink to="/admin/categorias" className={linkClass}>
                Categorías
              </NavLink>
              <NavLink to="/admin/pedidos" className={linkClass}>
                Pedidos
              </NavLink>
              <NavLink to="/admin/gastos" className={linkClass}>
                Gastos
              </NavLink>
              <NavLink to="/admin/ingresos" className={linkClass}>
                Ingresos
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin/usuarios" className={linkClass}>
                  Usuarios
                </NavLink>
              )}
            </nav>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-ink/50 hover:text-cognac"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
