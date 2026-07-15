import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'

const LOW_STOCK_THRESHOLD = 5

function monthBounds() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    label: start.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })
  }
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [salesTotal, setSalesTotal] = useState(0)
  const [expensesTotal, setExpensesTotal] = useState(0)
  const [manualIncomeTotal, setManualIncomeTotal] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [lowStock, setLowStock] = useState([])
  const { start, end, label } = monthBounds()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [orders, expenses, income, pending, products] = await Promise.all([
        supabase
          .from('orders')
          .select('total')
          .eq('payment_status', 'pagado')
          .gte('created_at', start)
          .lt('created_at', end),
        supabase
          .from('expenses')
          .select('amount')
          .gte('expense_date', start)
          .lt('expense_date', end),
        supabase
          .from('income')
          .select('amount')
          .gte('income_date', start)
          .lt('income_date', end),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'nuevo'),
        supabase
          .from('products')
          .select('id, name, stock')
          .lte('stock', LOW_STOCK_THRESHOLD)
          .eq('is_active', true)
          .order('stock', { ascending: true })
      ])

      setSalesTotal(
        (orders.data ?? []).reduce((sum, o) => sum + Number(o.total), 0)
      )
      setExpensesTotal(
        (expenses.data ?? []).reduce((sum, e) => sum + Number(e.amount), 0)
      )
      setManualIncomeTotal(
        (income.data ?? []).reduce((sum, i) => sum + Number(i.amount), 0)
      )
      setPendingOrders(pending.count ?? 0)
      setLowStock(products.data ?? [])
      setLoading(false)
    }
    load()
  }, [start, end])

  const totalIncome = salesTotal + manualIncomeTotal
  const profit = totalIncome - expensesTotal

  if (loading) {
    return <p className="text-ink/50 font-display italic">Cargando…</p>
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-espresso mb-1">Dashboard</h1>
      <p className="text-sm text-ink/50 mb-6 capitalize">{label}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card label="Ventas de la tienda" value={salesTotal} />
        <Card label="Ingresos manuales" value={manualIncomeTotal} />
        <Card label="Gastos" value={expensesTotal} negative />
        <Card
          label="Utilidad del mes"
          value={profit}
          highlight
          negative={profit < 0}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-stitch bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-espresso">
              Pedidos por atender
            </h2>
            <Link
              to="/admin/pedidos"
              className="text-xs text-cognac hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <p className="font-display text-3xl text-espresso">
            {pendingOrders}
          </p>
          <p className="text-xs text-ink/50 mt-1">
            pedidos con estado "nuevo"
          </p>
        </div>

        <div className="border border-stitch bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-espresso">
              Stock bajo (≤ {LOW_STOCK_THRESHOLD})
            </h2>
            <Link
              to="/admin/productos"
              className="text-xs text-cognac hover:underline"
            >
              Ver productos
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-ink/50">
              Todo tu inventario activo está bien abastecido.
            </p>
          ) : (
            <ul className="space-y-1">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="font-mono text-cognac">{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function Card({ label, value, highlight, negative }) {
  return (
    <div
      className={`border border-stitch px-4 py-3 ${
        highlight ? 'bg-espresso text-cream' : 'bg-white'
      }`}
    >
      <p className={`text-xs ${highlight ? 'text-cream/60' : 'text-ink/50'}`}>
        {label}
      </p>
      <p
        className={`font-display text-2xl ${
          negative && !highlight ? 'text-red-700' : ''
        }`}
      >
        ${value.toFixed(2)}
      </p>
    </div>
  )
}