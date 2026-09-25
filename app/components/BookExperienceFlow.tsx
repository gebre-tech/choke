'use client'

import { useState } from 'react'
import { ArrowRight, Check, Clock3, Mountain, Users } from 'lucide-react'
import BookingForm from '@/components/BookingForm'

type Experience = {
  id: string
  name: string
  description: string
  type: string
  price: number
  duration: number | null
  capacity: number
  imageUrl?: string
}

type Cottage = Parameters<typeof BookingForm>[0]['cottages'][number]

export default function BookExperienceFlow({
  cottages,
  experiences,
}: {
  cottages: Cottage[]
  experiences: Experience[]
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const selected = experiences.find((item) => item.id === selectedId)

  if (started) {
    return (
      <div>
        <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-emerald-200/20 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-50">
          <span>
            <strong>{selected?.name ?? 'Stay only'}</strong> selected
          </span>
          <button
            type="button"
            onClick={() => setStarted(false)}
            className="font-semibold text-emerald-200 underline-offset-4 hover:underline"
          >
            Change choice
          </button>
        </div>
        <BookingForm cottages={cottages} experience={selected} />
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Step 1 of 2</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Choose an experience or activity</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Pick something to add to your stay. You can also continue with the cottage only.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {experiences.map((item) => {
          const active = item.id === selectedId
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`group overflow-hidden rounded-2xl border-2 text-left transition-all ${
                active
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-900/10'
                  : 'border-stone-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-emerald-900 to-slate-800">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <Mountain className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-emerald-300/70" aria-hidden="true" />
                )}
                {active && (
                  <span className="absolute right-3 top-3 rounded-full bg-emerald-500 p-1.5 text-white">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">{item.type.replaceAll('_', ' ')}</p>
                <h3 className="mt-1 font-bold text-slate-900">{item.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-stone-500">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-500">
                  <span className="font-semibold text-emerald-700">ETB {item.price.toFixed(2)} / guest</span>
                  {item.duration && <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {item.duration} min</span>}
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Up to {item.capacity}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
        >
          Continue with cottage only
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() => setStarted(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue with selected activity <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
