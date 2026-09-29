import { NextResponse } from 'next/server'

const DEFAULT_API_URL = 'https://choke.onrender.com'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type CartLine = { productId: string; quantity: number }

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>
}

export async function POST(req: Request) {
  const apiUrl = (process.env.RENDER_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const items = Array.isArray(body.items) ? body.items : []
  const lines: CartLine[] = items.map((item: unknown) => {
    const line = item as Record<string, unknown>
    return {
      productId: typeof line.productId === 'string' ? line.productId.trim() : '',
      quantity: typeof line.quantity === 'number' ? line.quantity : 0,
    }
  })

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }
  if (!lines.length || lines.length > 20 || lines.some((line) =>
    !line.productId || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20
  )) {
    return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 })
  }

  try {
    const orderResponse = await fetch(`${apiUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, items: lines }),
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    })
    const order = await readJson(orderResponse)
    if (!orderResponse.ok) {
      return NextResponse.json(
        { error: typeof order.error === 'string' ? order.error : 'Could not create your order' },
        { status: orderResponse.status }
      )
    }
    if (typeof order.orderId !== 'string') {
      throw new Error('Render backend returned no order ID')
    }

    const paymentResponse = await fetch(`${apiUrl}/api/payment/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType: 'order', entityId: order.orderId, email }),
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    })
    const payment = await readJson(paymentResponse)
    if (!paymentResponse.ok) {
      console.error('Render payment initialization rejected', {
        status: paymentResponse.status,
        error: typeof payment.error === 'string' ? payment.error : 'Unknown payment error',
        orderId: order.orderId,
      })
      return NextResponse.json(
        { error: typeof payment.error === 'string' ? payment.error : 'Could not start payment' },
        { status: paymentResponse.status }
      )
    }
    if (typeof payment.checkout_url !== 'string') {
      throw new Error('Render backend returned no Chapa checkout URL')
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      checkout_url: payment.checkout_url,
      tx_ref: payment.tx_ref,
    })
  } catch (error) {
    console.error('Cart checkout proxy failed', error)
    return NextResponse.json(
      { error: 'Could not connect to the payment service. Please try again.' },
      { status: 502 }
    )
  }
}
