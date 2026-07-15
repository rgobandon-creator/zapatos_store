import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="group block stitch-border"
    >
      <div className="aspect-[4/5] overflow-hidden bg-parchment mb-3">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-espresso/30 font-display italic">
            Sin imagen
          </div>
        )}
      </div>
      <h3 className="font-display text-lg leading-tight text-espresso">
        {product.name}
      </h3>
      <div className="font-mono text-sm mt-1 flex items-center gap-2">
        <span className="text-leather">${product.price.toFixed(2)}</span>
        {hasDiscount && (
          <span className="text-ink/40 line-through">
            ${product.compare_at_price.toFixed(2)}
          </span>
        )}
      </div>
    </Link>
  )
}
