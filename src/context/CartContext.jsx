import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'zapatos_store_cart'

// Un item se identifica por producto + talla + color
function lineKey(item) {
  return `${item.product_id}__${item.size ?? ''}__${item.color ?? ''}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(product, { size, color, quantity = 1 }) {
    setItems((prev) => {
      const newItem = {
        product_id: product.id,
        name: product.name,
        image: product.images?.[0] ?? null,
        price: product.price,
        size,
        color,
        quantity
      }
      const key = lineKey(newItem)
      const existing = prev.find((i) => lineKey(i) === key)
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, newItem]
    })
    setIsOpen(true)
  }

  function updateQuantity(item, quantity) {
    if (quantity <= 0) return removeItem(item)
    setItems((prev) =>
      prev.map((i) => (lineKey(i) === lineKey(item) ? { ...i, quantity } : i))
    )
  }

  function removeItem(item) {
    setItems((prev) => prev.filter((i) => lineKey(i) !== lineKey(item)))
  }

  function clearCart() {
    setItems([])
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
        isOpen,
        setIsOpen
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
