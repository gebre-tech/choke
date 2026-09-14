'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const [ref, setRef] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'failed' | 'pending'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    searchParams.then(async (params) => {
      const txRef = (params.ref as string | undefined) ?? null
      setRef(txRef)

      if (!txRef) {
        setStatus('pending')
        return
      }

      try {
        const res = await fetch(`/api/payment/verify/${encodeURIComponent(txRef)}`)
        const data = await res.json()
        if (res.ok && data.status === 'CONFIRMED') setStatus('confirmed')
        else if (res.ok && data.status === 'FAILED') setStatus('failed')
        else setStatus('pending')
      } catch {
        setError('We could not confirm your payment right now. Check your email for a receipt.')
        setStatus('pending')
      }
    })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900 to-stone-800 text-white flex items-center justify-center">
      <div className="bg-white text-slate-800 rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-xl">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold">Confirming your payment…</h1>
            <p className="text-stone-500 mt-2">
              {ref ? `Reference: ${ref}` : 'No payment reference provided'}
            </p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Payment confirmed</h1>
            <p className="text-stone-500 mt-2">
              Your booking is confirmed.
              {ref && <span className="block text-sm mt-1">Reference: {ref}</span>}
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Payment not completed</h1>
            <p className="text-stone-500 mt-2">We could not verify your payment. Please try again.</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Almost there</h1>
            <p className="text-stone-500 mt-2">
              {error || 'Your payment is being processed. You will receive a confirmation email.'}
            </p>
          </>
        )}

        <div className="flex gap-3 justify-center mt-6">
          <Link href="/" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full transition-colors">
            Back to home
          </Link>
          <Link href="/marketplace" className="text-emerald-700 hover:underline py-2.5">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}