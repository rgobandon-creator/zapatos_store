import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminOnlyRoute from './components/AdminOnlyRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import Catalog from './pages/Catalog.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderConfirmation from './pages/OrderConfirmation.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminProductForm from './pages/admin/AdminProductForm.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminExpenses from './pages/admin/AdminExpenses.jsx'
import AdminIncome from './pages/admin/AdminIncome.jsx'

function AdminIndexRedirect() {
  const { isAdmin } = useAuth()
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/admin/productos'} replace />
}

function Storefront() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/producto/:slug" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminIndexRedirect />} />
        <Route
          path="dashboard"
          element={
            <AdminOnlyRoute>
              <AdminDashboard />
            </AdminOnlyRoute>
          }
        />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="productos/nuevo" element={<AdminProductForm />} />
        <Route path="productos/:id/editar" element={<AdminProductForm />} />
        <Route path="categorias" element={<AdminCategories />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="gastos" element={<AdminExpenses />} />
        <Route path="ingresos" element={<AdminIncome />} />
        <Route
          path="usuarios"
          element={
            <AdminOnlyRoute>
              <AdminUsers />
            </AdminOnlyRoute>
          }
        />
      </Route>

      <Route path="/*" element={<Storefront />} />
    </Routes>
  )
}