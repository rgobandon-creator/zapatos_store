// Cloudflare Pages Function — corre en el servidor (edge), NUNCA en el navegador.
// Ruta: /api/payphone-confirm
//
// Variables de entorno requeridas (Cloudflare Pages → Settings → Environment variables,
// como "Secret", NO como VITE_*):
//   PAYPHONE_TOKEN            -> token secreto de PayPhone
//   SUPABASE_URL              -> mismo valor que VITE_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY -> service_role key de Supabase (Settings → API)
//                                 (esta clave SÍ puede escribir saltándose RLS,
//                                  por eso solo vive aquí, nunca en el frontend)

export async function onRequestPost({ request, env }) {
  try {
    const { id, clientTransactionId } = await request.json()

    if (!id || !clientTransactionId) {
      return json({ ok: false, error: 'Faltan id o clientTransactionId' }, 400)
    }

    // 1. Confirmar la transacción con PayPhone
    const confirmRes = await fetch(
      'https://pay.payphonetodoesposible.com/api/button/V2/Confirm',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.PAYPHONE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: Number(id), clientTxId: clientTransactionId })
      }
    )

    const result = await confirmRes.json()

    if (!confirmRes.ok || result.transactionStatus !== 'Approved') {
      await updateOrder(env, clientTransactionId, {
        payment_status: 'fallido'
      })
      return json({ ok: false, error: 'Pago no aprobado', detail: result }, 402)
    }

    // 2. Marcar la orden como pagada en Supabase (con service role, salta RLS)
    await updateOrder(env, clientTransactionId, {
      payment_status: 'pagado',
      status: 'confirmado'
    })

    return json({ ok: true, transaction: result })
  } catch (err) {
    return json({ ok: false, error: err.message }, 500)
  }
}

async function updateOrder(env, orderId, fields) {
  await fetch(`${env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(fields)
  })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
