import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import ProductCard from '../components/ProductCard.jsx'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: cats }, { data: prods, error: prodsError }] =
        await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
        ])
      if (prodsError) setError(prodsError.message)
      setCategories(cats ?? [])
      setProducts(prods ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-espresso mb-2">
          Catálogo
        </h1>
        <p className="text-ink/60">Hecho a mano, hecho para durar.</p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 text-sm border rounded-full transition-colors ${
              activeCategory === null
                ? 'bg-espresso text-cream border-espresso'
                : 'border-espresso/20 hover:border-cognac'
            }`}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-1.5 text-sm border rounded-full transition-colors ${
                activeCategory === c.id
                  ? 'bg-espresso text-cream border-espresso'
                  : 'border-espresso/20 hover:border-cognac'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-ink/50 font-display italic">Cargando…</p>}
      {error && <p className="text-red-700 text-sm">Error: {error}</p>}

      {!loading && filtered.length === 0 && !error && (
        <p className="text-ink/50 font-display italic">
          Todavía no hay productos aquí. Agrega algunos desde Supabase.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
