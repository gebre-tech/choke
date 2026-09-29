import { NextResponse } from 'next/server'

const DEFAULT_API_URL = 'https://choke.onrender.com'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESERVED_DOMAINS = ['example.com', 'example.net', 'example.org', 'localhost']
const RESERVED_SUFFIXES = ['.test', '.invalid', '.localhost', '.local']

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>
}

function isChapaEmail(email: string) {
  if (!EMAIL_RE.test(email)) return false
  const domain = email.split('@')[1]
  return !RESERVED_DOMAINS.some((reserved) => domain === reserved || domain.endsWith(`.${reserved}`)) &&
    !RESERVED_SUFFIXES.some((suffix) => domain.endsWith(suffix))
}

export async function POST(req: Request) {
  const apiUrl = (process.env.RENDER_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid booking request' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  if (!isChapaEmail(email)) {
    return NextResponse.json(
      { error: 'Enter a valid email address that Chapa can use for this test payment.' },
      { status: 400 }
    )
  }
  if (typeof body.cottageId !== 'string' || !body.cottageId.trim()) {
    return NextResponse.json({ error: 'Please choose a cottage' }, { status: 400 })
  }

  const bookingPayload = {
    cottageId: body.cottageId.trim(),
    ...(typeof body.experienceId === 'string' && body.experienceId.trim()
      ? { experienceId: body.experienceId.trim() }
      : {}),
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    guestCount: body.guestCount,
    email,
    name,
    ...(phone ? { phone } : {}),
    ...(typeof body.specialRequests === 'string' && body.specialRequests.trim()
      ? { specialRequests: body.specialRequests.trim() }
      : {}),
  }

  try {
    const bookingResponse = await fetch(`${apiUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    })
    const booking = await readJson(bookingResponse)
    if (!bookingResponse.ok) {
      return NextResponse.json(
        { error: typeof booking.error === 'string' ? booking.error : 'Could not create your booking' },
        { status: bookingResponse.status }
      )
    }
    if (typeof booking.bookingId !== 'string') throw new Error('Render backend returned no booking ID')

    const paymentResponse = await fetch(`${apiUrl}/api/payment/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'booking',
        entityId: booking.bookingId,
        email,
        name,
        ...(phone ? { phoneNumber: phone } : {}),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    })
    const payment = await readJson(paymentResponse)
    if (!paymentResponse.ok) {
      console.error('Render booking payment initialization rejected', {
        status: paymentResponse.status,
        error: typeof payment.error === 'string' ? payment.error : 'Unknown payment error',
        bookingId: booking.bookingId,
      })
      return NextResponse.json(
        { error: typeof payment.error === 'string' ? payment.error : 'Could not start payment' },
        { status: paymentResponse.status }
      )
    }
    if (typeof payment.checkout_url !== 'string') throw new Error('Render backend returned no Chapa checkout URL')

    return NextResponse.json({
      success: true,
      bookingId: booking.bookingId,
      checkout_url: payment.checkout_url,
      tx_ref: payment.tx_ref,
    })
  } catch (error) {
    console.error('Booking checkout proxy failed', error)
    return NextResponse.json(
      { error: 'Could not connect to the payment service. Please try again.' },
      { status: 502 }
    )
  }
}
