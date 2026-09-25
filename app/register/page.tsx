'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, Mountain, Sparkles } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || 'Registration failed')
      toast.success(`Account created — welcome, ${data.user.firstName}!`)
      router.push('/marketplace')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-12 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-[620px] overflow-hidden bg-emerald-950 p-10 text-white lg:block">
          <img src="/choke-community.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <Mountain className="h-9 w-9 text-emerald-300" />
            <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200"><Sparkles className="h-4 w-4" /> Join the community</p><p className="mt-3 text-3xl font-black">More mountain.<br />More meaning.</p></div>
          </div>
        </div>
        <div className="p-8 text-stone-900 sm:p-12">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-stone-500 mb-6">Book cottages, join experiences and shop local goods</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
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
              minLength={8}
              className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-stone-400 mt-1">At least 8 characters</p>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-colors"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Create account
          </button>
        </form>
        <p className="text-sm text-stone-500 mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-700 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
      </div>
    </div>
  )
}