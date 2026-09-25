'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, Mountain, ShieldCheck } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || 'Login failed')
      toast.success(`Welcome back, ${data.user.firstName}!`)
      router.push(next)
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-12 text-white sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-[560px] overflow-hidden bg-emerald-950 p-10 lg:block">
          <img src="/choke-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <Mountain className="h-9 w-9 text-emerald-300" />
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Welcome back to Choke</p><p className="mt-3 text-3xl font-black">Your view is waiting.</p></div>
          </div>
        </div>
        <div className="p-8 text-stone-900 sm:p-12">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-stone-500 mb-6">Sign in to your Choke Panoramic account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-colors"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign in
          </button>
        </form>
        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-stone-400"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Your account and checkout are protected</p>
        <p className="text-sm text-stone-500 mt-4 text-center">
          New here?{' '}
          <Link href="/register" className="text-emerald-700 hover:underline font-semibold">
            Create an account
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}