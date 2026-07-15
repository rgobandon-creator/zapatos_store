import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'

const STATUS_OPTIONS = ['nuevo', 'confirmado', 'enviado', 'entregado', 'cancelado']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [openId, setOpenId] = useState(null)
  const [items, setItems] = useState({})
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleOpen(order) {
    if (openId === order.id) {
      setOpenId(null)
      return
    }
    setOpenId(order.id)
    if (!items[order.id]) {
      const { data } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id)
      setItems((prev) => ({ ...prev, [order.id]: data ?? [] }))
    }
  }

  async function updateStatus(order, status) {
    await supabase.from('orders').update({ status }).eq('id', order.id)
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status } : o))
    )
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-espresso mb-6">Pedidos</h1>

      {loading && <p className="text-ink/50 font-display italic">Cargando…</p>}
      {!loading && orders.length === 0 && (
        <p className="text-ink/50 font-display italic">
          Todavía no hay pedidos.
        </p>
      )}

      <div className="space-y-2">
        {orders.map((o) => (
          <div key={o.id} className="border border-stitch bg-white">
            <button
              onClick={() => toggleOpen(o)}
              className="w-full flex items-center gap-4 px-4 py-3 text-left"
            >
              <span className="font-mono text-xs text-ink/40">
                #{o.id.slice(0, 8)}
              </span>
              <span className="flex-1 truncate">{o.customer_name}</span>
              <span className="text-xs text-ink/50">
                {new Date(o.created_at).toLocaleDateString('es-EC')}
              </span>
              <span className="font-mono text-sm">${o.total.toFixed(2)}</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  o.payment_status === 'pagado'
                    ? 'border-green-700/30 text-green-800'
                    : 'border-ink/20 text-ink/40'
                }`}
              >
                {o.payment_status}
              </span>
            </button>

            {openId === o.id && (
              <div className="border-t border-stitch px-4 py-4 bg-parchment/40">
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-ink/50">Teléfono</p>
                    <p>{o.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-ink/50">Dirección</p>
                    <p>
                      {o.customer_address}
                      {o.city ? `, ${o.city}` : ''}
                    </p>
                  </div>
                  {o.notes && (
                    <div className="col-span-2">
                      <p className="text-ink/50">Notas</p>
                      <p>{o.notes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  {(items[o.id] ?? []).map((it) => (
                    <p key={it.id} className="text-sm">
                      {it.quantity}x {it.product_name}
                      {it.size ? ` — Talla ${it.size}` : ''}
                      {it.color ? ` — ${it.color}` : ''} — $
                      {it.subtotal.toFixed(2)}
                    </p>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-ink/50">Estado:</label>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o, e.target.value)}
                    className="border border-espresso/20 px-2 py-1 text-sm bg-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
