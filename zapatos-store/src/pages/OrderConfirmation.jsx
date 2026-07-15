import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

export default function OrderConfirmation() {
  const [params] = useSearchParams()
  const orderId = params.get('order')
  // PayPhone agrega estos dos al volver de su checkout
  const payphoneId = params.get('id')
  const clientTransactionId = params.get('clientTransactionId')

  // 'skip' = pedido por WhatsApp, no hay nada que confirmar
  const [status, setStatus] = useState(
    payphoneId && clientTransactionId ? 'confirming' : 'skip'
  )

  useEffect(() => {
    if (status !== 'confirming') return

    fetch('/api/payphone-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: payphoneId, clientTransactionId })
    })
      .then((r) => r.json())
      .then((data) => setStatus(data.ok ? 'paid' : 'failed'))
      .catch(() => setStatus('failed'))
  }, [status, payphoneId, clientTransactionId])

  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      {status === 'confirming' && (
        <p className="font-display text-2xl italic text-ink/50 mb-6">
          Confirmando tu pago…
        </p>
      )}

      {status === 'failed' && (
        <>
          <h1 className="font-display text-3xl text-espresso mb-3">
            No pudimos confirmar el pago
          </h1>
          <p className="text-ink/60 mb-8">
            Si el dinero salió de tu cuenta, contáctanos con el número de
            pedido para verificarlo.
          </p>
        </>
      )}

      {(status === 'paid' || status === 'skip') && (
        <h1 className="font-display text-3xl text-espresso mb-3">
          ¡Gracias por tu compra!
        </h1>
      )}

      <p className="text-ink/60 mb-1">
        Pedido <span className="font-mono">#{orderId?.slice(0, 8)}</span>
      </p>
      <p className="text-ink/60 mb-8">
        Te contactaremos pronto para coordinar la entrega.
      </p>
      <Link to="/" className="text-cognac underline">
        Volver al catálogo
      </Link>
    </div>
  )
}
