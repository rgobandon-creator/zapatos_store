export function buildWhatsappOrderUrl({ order, items }) {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER // ej: 593999999999 (sin +)

  const lines = [
    `*Nuevo pedido* #${order.id.slice(0, 8)}`,
    '',
    ...items.map(
      (i) =>
        `• ${i.quantity}x ${i.name}${i.size ? ` — Talla ${i.size}` : ''}${
          i.color ? ` — ${i.color}` : ''
        } ($${(i.price * i.quantity).toFixed(2)})`
    ),
    '',
    `*Total:* $${order.total.toFixed(2)}`,
    '',
    `*Cliente:* ${order.customer_name}`,
    `*Teléfono:* ${order.customer_phone}`,
    order.customer_address && `*Dirección:* ${order.customer_address}, ${order.city ?? ''}`,
    order.notes && `*Notas:* ${order.notes}`
  ].filter(Boolean)

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${number}?text=${text}`
}
