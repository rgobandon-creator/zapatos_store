import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } =
    useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-espresso/40"
        onClick={() => setIsOpen(false)}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-cream flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stitch">
          <h2 className="font-display text-xl">Tu carrito</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-sm text-ink/60 hover:text-ink"
            aria-label="Cerrar carrito"
          >
            Cerrar
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-ink/50 font-display italic">
            Tu carrito está vacío
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product_id}-${item.size}-${item.color}`}
                className="flex gap-3"
              >
                <div className="w-16 h-16 bg-parchment flex-shrink-0 overflow-hidden">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-ink/50">
                    {item.size && `Talla ${item.size}`}
                    {item.size && item.color && ' · '}
                    {item.color}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      className="w-6 h-6 border border-espresso/20 text-sm"
                    >
                      −
                    </button>
                    <span className="text-sm font-mono w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      className="w-6 h-6 border border-espresso/20 text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item)}
                      className="text-xs text-ink/40 hover:text-cognac ml-2"
                    >
                      quitar
                    </button>
                  </div>
                </div>
                <p className="font-mono text-sm">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-stitch px-5 py-4 space-y-3">
          <div className="flex justify-between font-display text-lg">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <Link
            to="/checkout"
            onClick={() => setIsOpen(false)}
            className={`block text-center py-3 font-medium transition-colors ${
              items.length === 0
                ? 'bg-ink/10 text-ink/30 pointer-events-none'
                : 'bg-espresso text-cream hover:bg-cognac'
            }`}
          >
            Ir a pagar
          </Link>
        </div>
      </aside>
    </div>
  )
}
