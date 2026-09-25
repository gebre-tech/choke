import Link from 'next/link'
import { Search, Mountain, Star, Coffee, Bed, ArrowDown, ArrowUpRight, Leaf, Users } from 'lucide-react'
import { SectionBackground } from '@/components/ui/MultimediaBackground'
import MountainScene from '@/components/ui/MountainScene'

export default function Home() {
  return (
    <>
      {/* Hero with Multimedia Background */}
      <SectionBackground page="home" section="hero" className="h-screen flex items-center" overlay parallax animation="kenburns" duration={25000}>
        <div className="homepage-ambient" aria-hidden="true">
          <div className="homepage-ambient__moon" />
          <div className="homepage-ambient__grid" />
          <span className="homepage-ambient__particle homepage-ambient__particle--one" />
          <span className="homepage-ambient__particle homepage-ambient__particle--two" />
          <span className="homepage-ambient__particle homepage-ambient__particle--three" />
        </div>
        <div className="container mx-auto px-4 relative z-10 w-full">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200 backdrop-blur">
                <Leaf className="h-4 w-4" /> The highland, reimagined
              </p>
              <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                Come for the view.
                <span className="mt-2 block text-emerald-300">Stay for the feeling.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-stone-200 md:text-xl">
                A highland retreat in Ethiopia&apos;s Choke Mountains at 4,070m — a quiet base for
                mountain air, community stories, and unforgettable horizons.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/book" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3">
                  Plan your stay <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-white backdrop-blur transition hover:bg-white/20">
                  Shop local
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/75">
                <span className="flex items-center gap-2"><Mountain className="h-4 w-4 text-emerald-300" /> Panoramic summit views</span>
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-300" /> Community-led stays</span>
              </div>
            </div>
            <MountainScene />
          </div>
          <a href="#discover" className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 md:flex">
            Discover Choke <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </SectionBackground>

      <section id="discover" className="relative overflow-hidden bg-stone-950 py-8 text-white">
        <div className="container mx-auto grid gap-4 px-4 sm:grid-cols-3">
          {[
            ['4,070m', 'above sea level'],
            ['100%', 'community connected'],
            ['∞', 'ways to slow down'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <p className="text-3xl font-black text-emerald-300">{value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cottages Section */}
      <SectionBackground page="home" section="cottages" className="py-16" overlay={false}>
        <div className="container mx-auto px-4" id="stay">
          <h2 className="text-3xl font-bold text-center mb-10 animate-fade-in">Our Cottages</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Panoramic Hut', price: '2,500', cap: 2 },
              { name: "Stargazer's", price: '3,200', cap: 2 },
              { name: 'Family Hut', price: '3,800', cap: 4 },
              { name: 'Mountain Suite', price: '4,500', cap: 2 },
            ].map((c, i) => (
              <div key={i} className="group bg-white rounded-2xl p-6 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-2xl animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <Bed className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-emerald-600 font-semibold">ETB {c.price}/night</p>
                <p className="text-sm text-stone-500">{c.cap} guests</p>
                <Link href="/book" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 opacity-0 transition group-hover:opacity-100">Explore cottage <ArrowUpRight className="h-3 w-3" /></Link>
              </div>
            ))}
          </div>
        </div>
      </SectionBackground>

      {/* Experiences Section */}
      <SectionBackground page="home" section="experiences" className="py-16" overlay={false}>
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Make the mountain yours</p>
              <h2 className="mt-2 text-3xl font-bold animate-fade-in">Experiences</h2>
            </div>
            <Link href="/book" className="hidden items-center gap-1 text-sm font-semibold text-emerald-400 sm:flex">See all <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {experiences.map((exp, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-6 text-center animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <exp.icon className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
                <h3 className="font-bold">{exp.title}</h3>
                <p className="text-emerald-400">From ETB {exp.price}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionBackground>

      {/* Marketplace Preview Section */}
      <SectionBackground page="home" section="marketplace-preview" className="py-16" overlay={false}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 animate-fade-in">Local Products</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Mountain Honey', price: '450', icon: '🍯' },
              { name: 'Yirgacheffe Coffee', price: '650', icon: '☕' },
              { name: 'Bamboo Crafts', price: '350', icon: '🧺' },
              { name: 'Spice Blend', price: '280', icon: '🌿' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-5xl mb-4">{p.icon}</div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-emerald-600 font-semibold">ETB {p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionBackground>
    </>
  )
}

const experiences = [
  { icon: Search, title: 'Stargazing', price: '500' },
  { icon: Mountain, title: 'Mountain Trek', price: '750' },
  { icon: Star, title: 'City Lights', price: '400' },
  { icon: Coffee, title: 'Sunrise View', price: '300' },
]