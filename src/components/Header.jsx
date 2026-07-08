import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function Header() {
  const { itemCount, setIsOpen } = useCart()

  return (
    <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b border-stitch">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-tight text-espresso">
          Taller<span className="text-cognac">.</span>
        </Link>

        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2 border border-espresso/20 rounded-full pl-4 pr-3 py-2 text-sm hover:border-cognac transition-colors"
          aria-label="Abrir carrito"
        >
          Carrito
          {itemCount > 0 && (
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-cognac text-cream text-xs font-mono">
              {itemCount}
            </span>
          )}
        </button>
      </div>
      <div className="stitch-divider" />
    </header>
  )
}
