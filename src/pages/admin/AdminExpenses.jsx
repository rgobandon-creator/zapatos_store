import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { useAuth } from '../../context/AuthContext.jsx'

const CATEGORIES = [
  'Inventario',
  'Arriendo',
  'Servicios',
  'Nómina',
  'Transporte',
  'Marketing',
  'Otro'
]

const emptyForm = {
  category: 'Inventario',
  amount: '',
  description: '',
  expense_date: new Date().toISOString().slice(0, 10)
}

export default function AdminExpenses() {
  const { isAdmin, profile } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
    setExpenses(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase.from('expenses').insert({
      category: form.category,
      amount: Number(form.amount),
      description: form.description || null,
      expense_date: form.expense_date,
      created_by: profile?.id
    })

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setForm({ ...emptyForm, category: form.category })
    load()
  }

  async function remove(expense) {
    if (!confirm('¿Borrar este gasto?')) return
    await supabase.from('expenses').delete().eq('id', expense.id)
    load()
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div>
      <h1 className="font-display text-3xl text-espresso mb-6">Gastos</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 items-end"
      >
        <div>
          <label className="block text-xs text-ink/50 mb-1">Categoría</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full border border-espresso/20 px-2 py-2 bg-white text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
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
            value={form.expense_date}
            onChange={(e) =>
              setForm((f) => ({ ...f, expense_date: e.target.value }))
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
        <>
          <div className="flex justify-between items-baseline mb-3 border-b border-stitch pb-2">
            <span className="text-sm text-ink/50">
              {expenses.length} registro{expenses.length !== 1 ? 's' : ''}
            </span>
            <span className="font-display text-xl text-espresso">
              Total: ${total.toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            {expenses.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-4 border border-stitch bg-white px-4 py-2.5"
              >
                <span className="text-xs text-ink/50 w-24 flex-shrink-0">
                  {e.expense_date}
                </span>
                <span className="text-xs px-2 py-0.5 border border-espresso/20 rounded-full flex-shrink-0">
                  {e.category}
                </span>
                <span className="flex-1 text-sm text-ink/70 truncate">
                  {e.description}
                </span>
                <span className="font-mono text-sm">
                  ${Number(e.amount).toFixed(2)}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => remove(e)}
                    className="text-xs text-ink/40 hover:text-red-700"
                  >
                    Borrar
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
