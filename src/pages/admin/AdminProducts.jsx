import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleActive(product) {
    await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    load()
  }

  async function remove(product) {
    if (!confirm(`¿Borrar "${product.name}"? Esto no se puede deshacer.`)) return
    await supabase.from('products').delete().eq('id', product.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-espresso">Productos</h1>
        <Link
          to="/admin/productos/nuevo"
          className="px-4 py-2 bg-espresso text-cream text-sm font-medium hover:bg-cognac transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      {loading && <p className="text-ink/50 font-display italic">Cargando…</p>}
      {error && <p className="text-red-700 text-sm">{error}</p>}

      {!loading && products.length === 0 && (
        <p className="text-ink/50 font-display italic">
          Todavía no tienes productos. Crea el primero.
        </p>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 border border-stitch bg-white px-4 py-3"
          >
            <div className="w-14 h-14 bg-parchment flex-shrink-0 overflow-hidden">
              {p.images?.[0] && (
                <img
                  src={p.images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.name}</p>
              <p className="text-xs text-ink/50">
                {p.categories?.name ?? 'Sin categoría'} · ${p.price.toFixed(2)}{' '}
                · Stock: {p.stock}
              </p>
            </div>
            <button
              onClick={() => toggleActive(p)}
              className={`text-xs px-2.5 py-1 rounded-full border ${
                p.is_active
                  ? 'border-green-700/30 text-green-800'
                  : 'border-ink/20 text-ink/40'
              }`}
            >
              {p.is_active ? 'Activo' : 'Oculto'}
            </button>
            <Link
              to={`/admin/productos/${p.id}/editar`}
              className="text-sm text-cognac hover:underline"
            >
              Editar
            </Link>
            <button
              onClick={() => remove(p)}
              className="text-sm text-ink/40 hover:text-red-700"
            >
              Borrar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
