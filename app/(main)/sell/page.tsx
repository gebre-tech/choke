import { prisma } from '@/lib/prisma'
import SellersClient from '@/components/sell/SellersClient'
import Image from 'next/image'
import { ArrowDown, HandHeart, Store } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SellPage() {
  const cottages = await prisma.cottage.findMany({
    where: { isAvailable: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative overflow-hidden bg-emerald-950 text-white">
        <Image src="/choke-community.jpg" alt="Choke Mountains community" fill priority className="object-cover opacity-35" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/90 to-emerald-900/40" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100 backdrop-blur"><HandHeart className="h-4 w-4" /> Keep value local</p>
            <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl">Your story belongs<br /><span className="text-emerald-300">on the mountain.</span></h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50">List products, meals, stays, and experiences. Share what makes your corner of Choke special with travelers who care.</p>
            <a href="#seller-tools" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-50">Start a listing <ArrowDown className="h-4 w-4" /></a>
          </div>
        </div>
      </section>
      <section id="seller-tools" className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.65fr_1.35fr] lg:px-8">
        <aside className="h-fit rounded-3xl bg-stone-900 p-6 text-white shadow-xl lg:sticky lg:top-24">
          <Store className="h-8 w-8 text-emerald-300" />
          <h2 className="mt-5 text-2xl font-bold">Built for local makers</h2>
          <p className="mt-3 text-sm leading-6 text-stone-300">Add photos, videos, pricing, and availability. Every submission is reviewed before publishing so the marketplace stays trustworthy.</p>
          <div className="mt-6 space-y-3 text-sm text-stone-300">
            <p>01 <span className="ml-3 text-white">Create your listing</span></p>
            <p>02 <span className="ml-3 text-white">Share the details</span></p>
            <p>03 <span className="ml-3 text-white">Get reviewed and go live</span></p>
          </div>
        </aside>
        <SellersClient cottages={cottages} />
      </section>
    </div>
  )
}