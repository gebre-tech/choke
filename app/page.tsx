import Link from 'next/link'
import { Search, Mountain, Star, Coffee, Bed } from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-screen flex items-center bg-gradient-to-b from-slate-900 via-emerald-900 to-stone-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-emerald-400">Choke</span> Panoramic
          </h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-2xl mx-auto">
            Ethiopia's highest-altitude eco-lodge at 4,070m
          </p>
          <div className="flex gap-4 justify-center mt-8 flex-wrap">
            <Link href="/book" className="btn-primary">Book Now</Link>
            <Link href="/marketplace" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full">
              Shop Local
            </Link>
          </div>
        </div>
      </section>

      {/* Cottages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Our Cottages</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Panoramic Hut', price: '2,500', cap: 2 },
              { name: "Stargazer's", price: '3,200', cap: 2 },
              { name: 'Family Hut', price: '3,800', cap: 4 },
              { name: 'Mountain Suite', price: '4,500', cap: 2 },
            ].map((c, i) => (
              <div key={i} className="bg-stone-50 rounded-2xl p-6 text-center hover:shadow-xl transition">
                <Bed className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-emerald-600 font-semibold">ETB {c.price}/night</p>
                <p className="text-sm text-stone-500">{c.cap} guests</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Experiences</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {experiences.map((exp, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-6 text-center">
                <exp.icon className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
                <h3 className="font-bold">{exp.title}</h3>
                <p className="text-emerald-400">From ETB {exp.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <section className="py-16 bg-emerald-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Local Products</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Mountain Honey', price: '450', icon: '🍯' },
              { name: 'Yirgacheffe Coffee', price: '650', icon: '☕' },
              { name: 'Bamboo Crafts', price: '350', icon: '🧺' },
              { name: 'Spice Blend', price: '280', icon: '🌿' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow">
                <div className="text-5xl mb-4">{p.icon}</div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-emerald-600 font-semibold">ETB {p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

const experiences = [
  { icon: Search, title: 'Stargazing', price: '500' },
  { icon: Mountain, title: 'Mountain Trek', price: '750' },
  { icon: Star, title: 'City Lights', price: '400' },
  { icon: Coffee, title: 'Sunrise View', price: '300' },
]