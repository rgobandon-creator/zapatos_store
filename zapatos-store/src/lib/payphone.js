/**
 * PayPhone "Botón de Pago" — flujo por redirección.
 *
 * 1) El cliente arma esta URL (no requiere el token secreto) y el navegador
 *    redirige a PayPhone para pagar.
 * 2) PayPhone redirige de vuelta a `responseUrl` con ?id=...&clientTransactionId=...
 * 3) Para CONFIRMAR el pago (obligatorio) hay que llamar a la API de PayPhone
 *    con el token secreto — eso NO debe hacerse desde el navegador.
 *    Esto ya está resuelto en `functions/api/payphone-confirm.js`
 *    (Cloudflare Pages Function), que corre en el servidor y la llama
 *    automáticamente desde `OrderConfirmation.jsx`.
 *
 * Variables necesarias (.env):
 *   VITE_PAYPHONE_STORE_ID   -> Store ID público (sí puede ir en el frontend)
 *   El token secreto NUNCA va en el frontend/.env de Vite.
 */
export function buildPayphoneCheckoutUrl({ order, responseUrl }) {
  const params = new URLSearchParams({
    storeId: import.meta.env.VITE_PAYPHONE_STORE_ID ?? '',
    clientTransactionId: order.id,
    amount: Math.round(order.total * 100), // PayPhone usa centavos
    amountWithTax: Math.round(order.total * 100),
    tax: '0',
    currency: 'USD',
    reference: `Pedido ${order.id.slice(0, 8)}`,
    responseUrl
  })
  return `https://pay.payphonetodoesposible.com/?${params.toString()}`
}
