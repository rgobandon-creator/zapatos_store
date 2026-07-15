import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center text-ink/50 font-display italic">
        Verificando sesión…
      </div>
    )
  }

  if (!session) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    )
  }

  return children
}
