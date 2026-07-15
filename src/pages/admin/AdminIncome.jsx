import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { useAuth } from '../../context/AuthContext.jsx'

const SOURCES = ['Venta en local', 'Abono', 'Otro']

const emptyForm = {
  source: 'Venta en local',
  amount: '',
  description: '',
  income_date: new Date().toISOString().slice(0, 10)
}

export default function AdminIncome() {
  const { isAdmin, profile } = useAuth()
  const [income, setIncome] = useState([])
  const [salesTotal, setSalesTotal] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    const [{ data: incomeData }, { data: orders }] = await Promise.all([
      supabase.from('income').select('*').order('income_date', { ascending: false }),
      supabase.from('orders').select('total').eq('payment_status', 'pagado')
    ])
    setIncome(incomeData ?? [])
    setSalesTotal((orders ?? []).reduce((sum, o) => sum + Number(o.total), 0))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase.from('income').insert({
      source: form.source,
      amount: Number(form.amount),
      description: form.description || null,
      income_date: form.income_date,
      created_by: profile?.id
    })

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setForm({ ...emptyForm, source: form.source })
    load()
  }

  async function remove(entry) {
    if (!confirm('¿Borrar este ingreso?')) return
    await supabase.from('income').delete().eq('id', entry.id)
    load()
  }

  const manualTotal = income.reduce((sum, i) => sum + Number(i.amount), 0)

  return (
    <div>
      <h1 className="font-display text-3xl text-espresso mb-6">Ingresos</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-stitch bg-white px-4 py-3">
          <p className="text-xs text-ink/50">Ventas de la tienda (pagadas)</p>
          <p className="font-display text-2xl text-espresso">
            ${salesTotal.toFixed(2)}
          </p>
        </div>
        <div className="border border-stitch bg-white px-4 py-3">
          <p className="text-xs text-ink/50">Ingresos manuales</p>
          <p className="font-display text-2xl text-espresso">
            ${manualTotal.toFixed(2)}
          </p>
        </div>
        <div className="border border-stitch bg-espresso text-cream px-4 py-3">
          <p className="text-xs text-cream/60">Total</p>
          <p className="font-display text-2xl">
            ${(salesTotal + manualTotal).toFixed(2)}
          </p>
        </div>
      </div>

      <p className="text-xs text-ink/50 mb-3">
        Las ventas hechas por WhatsApp o pagadas en línea ya se registran
        solas — revísalas en <strong>Pedidos</strong>. Aquí solo agregas
        ingresos que no pasaron por el checkout de la tienda.
      </p>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 items-end"
      >
        <div>
          <label className="block text-xs text-ink/50 mb-1">Origen</label>
          <select
            value={form.source}
            onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            className="w-full border border-espresso/20 px-2 py-2 bg-white text-sm"
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Monto</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="w-full border border-espresso/20 px-2 py-2 bg-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Fecha</label>
          <input
            required
            type="date"
            value={form.income_date}
            onChange={(e) =>
              setForm((f) => ({ ...f, income_date: e.target.value }))
            }
            className="w-full border border-espresso/20 px-2 py-2 bg-white text-sm"
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs text-ink/50 mb-1">
            Descripción (opcional)
          </label>
          <input
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full border border-espresso/20 px-2 py-2 bg-white text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-espresso text-cream text-sm font-medium hover:bg-cognac transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Registrar'}
        </button>
      </form>

      {error && <p className="text-red-700 text-sm mb-4">{error}</p>}
      {loading && <p className="text-ink/50 font-display italic">Cargando…</p>}

      {!loading && (
        <div className="space-y-2">
          {income.map((i) => (
            <div
              key={i.id}
              className="flex items-center gap-4 border border-stitch bg-white px-4 py-2.5"
            >
              <span className="text-xs text-ink/50 w-24 flex-shrink-0">
                {i.income_date}
              </span>
              <span className="text-xs px-2 py-0.5 border border-espresso/20 rounded-full flex-shrink-0">
                {i.source}
              </span>
              <span className="flex-1 text-sm text-ink/70 truncate">
                {i.description}
              </span>
              <span className="font-mono text-sm">
                ${Number(i.amount).toFixed(2)}
              </span>
              {isAdmin && (
                <button
                  onClick={() => remove(i)}
                  className="text-xs text-ink/40 hover:text-red-700"
                >
                  Borrar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
