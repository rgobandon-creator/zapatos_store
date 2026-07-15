import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminOnlyRoute({ children }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <p className="text-ink/50 font-display italic">Verificando permisos…</p>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin/productos" replace />
  }

  return children
}
