import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminOnlyRoute from './components/AdminOnlyRoute.jsx'
import Catalog from './pages/Catalog.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderConfirmation from './pages/OrderConfirmation.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminProductForm from './pages/admin/AdminProductForm.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'

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
        <Route index element={<Navigate to="productos" replace />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="productos/nuevo" element={<AdminProductForm />} />
        <Route path="productos/:id/editar" element={<AdminProductForm />} />
        <Route path="categorias" element={<AdminCategories />} />
        <Route path="pedidos" element={<AdminOrders />} />
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
