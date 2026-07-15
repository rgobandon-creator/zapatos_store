import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useCart } from '../context/CartContext.jsx'
import { buildPayphoneCheckoutUrl } from '../lib/payphone.js'
import { buildWhatsappOrderUrl } from '../lib/whatsapp.js'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    city: '',
    notes: ''
  })
  const [method, setMethod] = useState('whatsapp') // 'whatsapp' | 'payphone'
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (items.length === 0) return
    setSubmitting(true)
    setError(null)

    try {
      // 1. Crear la orden
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...form,
          payment_method: method,
          subtotal,
          total: subtotal // agrega envío/impuestos aquí si aplica
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Crear los items de la orden
      const { error: itemsError } = await supabase.from('order_items').insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.product_id,
          product_name: i.name,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          unit_price: i.price,
          subtotal: i.price * i.quantity
        }))
      )
      if (itemsError) throw itemsError

      // 3. Redirigir según método de pago
      if (method === 'whatsapp') {
        const url = buildWhatsappOrderUrl({ order, items })
        clearCart()
        window.location.href = url
      } else {
        const responseUrl = `${window.location.origin}/pedido-confirmado?order=${order.id}`
        const url = buildPayphoneCheckoutUrl({ order, responseUrl })
        clearCart()
        window.location.href = url
      }
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        <p className="font-display text-2xl text-espresso mb-2">
          Tu carrito está vacío
        </p>
        <button
          onClick={() => navigate('/')}
          className="text-cognac underline"
        >
          Ver catálogo
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl text-espresso mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre completo</label>
          <input
            required
            value={form.customer_name}
            onChange={(e) => update('customer_name', e.target.value)}
            className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono (WhatsApp)</label>
          <input
            required
            value={form.customer_phone}
            onChange={(e) => update('customer_phone', e.target.value)}
            placeholder="0991234567"
            className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Correo (opcional)</label>
          <input
            type="email"
            value={form.customer_email}
            onChange={(e) => update('customer_email', e.target.value)}
            className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input
              value={form.customer_address}
              onChange={(e) => update('customer_address', e.target.value)}
              className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad</label>
            <input
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={2}
            className="w-full border border-espresso/20 px-3 py-2 bg-white focus-visible:border-cognac"
          />
        </div>

        <div className="stitch-divider" />

        <div>
          <p className="text-sm font-medium mb-2">Método de pago</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod('whatsapp')}
              className={`px-4 py-3 border text-sm text-left transition-colors ${
                method === 'whatsapp'
                  ? 'bg-espresso text-cream border-espresso'
                  : 'border-espresso/20 hover:border-cognac'
              }`}
            >
              <span className="block font-medium">Pedir por WhatsApp</span>
              <span className="block text-xs opacity-70 mt-0.5">
                Coordinas el pago directamente
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMethod('payphone')}
              className={`px-4 py-3 border text-sm text-left transition-colors ${
                method === 'payphone'
                  ? 'bg-espresso text-cream border-espresso'
                  : 'border-espresso/20 hover:border-cognac'
              }`}
            >
              <span className="block font-medium">Pagar en línea</span>
              <span className="block text-xs opacity-70 mt-0.5">
                Tarjeta vía PayPhone
              </span>
            </button>
          </div>
        </div>

        <div className="flex justify-between font-display text-xl pt-2">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {error && <p className="text-red-700 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-espresso text-cream font-medium hover:bg-cognac transition-colors disabled:opacity-50"
        >
          {submitting
            ? 'Procesando…'
            : method === 'whatsapp'
            ? 'Enviar pedido por WhatsApp'
            : 'Continuar al pago'}
        </button>
      </form>
    </div>
  )
}
