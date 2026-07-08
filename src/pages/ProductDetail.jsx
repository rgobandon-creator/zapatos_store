import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useCart } from '../context/CartContext.jsx'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()
      setProduct(data)
      if (data?.sizes?.length) setSize(data.sizes[0])
      if (data?.colors?.length) setColor(data.colors[0])
    }
    load()
  }, [slug])

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16 text-ink/50 font-display italic">
        Cargando…
      </div>
    )
  }

  function handleAdd() {
    addItem(product, { size, color, quantity: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <Link to="/" className="text-sm text-ink/50 hover:text-cognac">
        ← Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mt-6">
        <div className="aspect-[4/5] bg-parchment overflow-hidden stitch-border">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-espresso/30 font-display italic">
              Sin imagen
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl text-espresso mb-2">
            {product.name}
          </h1>
          <p className="font-mono text-xl text-leather mb-6">
            ${product.price.toFixed(2)}
          </p>

          {product.description && (
            <p className="text-ink/70 mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          {product.sizes?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium mb-2">Talla</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-10 h-10 border text-sm transition-colors ${
                      size === s
                        ? 'bg-espresso text-cream border-espresso'
                        : 'border-espresso/20 hover:border-cognac'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-medium mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-3 py-1.5 border text-sm transition-colors ${
                      color === c
                        ? 'bg-espresso text-cream border-espresso'
                        : 'border-espresso/20 hover:border-cognac'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="w-full py-3 bg-espresso text-cream font-medium hover:bg-cognac transition-colors disabled:bg-ink/10 disabled:text-ink/30"
          >
            {product.stock <= 0
              ? 'Agotado'
              : added
              ? 'Agregado ✓'
              : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  )
}
