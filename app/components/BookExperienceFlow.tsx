'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Check,
  Flame,
  Home,
  Mountain,
  Sparkles,
  Telescope,
  Users,
} from 'lucide-react'
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
type Step = 'selection' | 'booking'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-ET', { maximumFractionDigits: 0 }).format(price)

export default function BookExperienceFlow({
  cottages,
  experiences,
  initialCottageId,
  initialExperienceId,
}: {
  cottages: Cottage[]
  experiences: Experience[]
  initialCottageId?: string
  initialExperienceId?: string
}) {
  const [selectedCottageId, setSelectedCottageId] = useState(
    initialCottageId ?? cottages[0]?.id ?? '',
  )
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(
    initialExperienceId ?? null,
  )
  const [step, setStep] = useState<Step>(
    initialCottageId || initialExperienceId ? 'booking' : 'selection',
  )
  const selectedCottage = cottages.find((cottage) => cottage.id === selectedCottageId)
  const selectedExperience = experiences.find((item) => item.id === selectedExperienceId)

  if (step === 'booking') {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-white/60 bg-white p-5 shadow-xl sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Your cottage</p>
                <p className="mt-1 font-bold text-stone-950">
                  {selectedCottage?.name ?? 'Choose your cottage'}
                  {selectedCottage && <span className="ml-2 text-sm font-medium text-stone-500">ETB {formatPrice(selectedCottage.pricePerNight)} / night</span>}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Experience</p>
                <p className="mt-1 font-bold text-stone-950">
                  {selectedExperience
                    ? <>{selectedExperience.name}<span className="ml-2 text-sm font-medium text-stone-500">ETB {formatPrice(selectedExperience.price)} / guest</span></>
                    : <span className="font-medium text-stone-500">None added</span>}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep('selection')}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-emerald-700 hover:text-emerald-800"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Change selections
            </button>
          </div>
        </div>
        <BookingForm
          cottages={cottages}
          experience={selectedExperience}
          initialCottageId={selectedCottage?.id}
        />
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-stone-950/10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 px-5 py-5 sm:px-8 sm:py-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Step 1 of 2 · Build your stay</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
            Stay your way
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
            Select a cottage and, if you like, add an experience. Your choices are side by side so
            you can compare everything at a glance.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-stone-50 px-4 py-2 text-sm font-medium text-stone-600 sm:flex">
          <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          Secure checkout with Chapa
        </div>
      </div>

      <div className="grid items-start lg:grid-cols-[1.45fr_0.9fr]">
        <div className="p-5 sm:p-7 lg:border-r lg:border-stone-100 lg:p-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">01 · Stay</p>
              <h4 className="mt-1 text-xl font-bold text-stone-950">Choose a cottage</h4>
            </div>
            <span className="text-xs font-medium text-stone-500">{cottages.length} stays</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {cottages.map((cottage) => {
              const active = cottage.id === selectedCottageId
              const cover = cottage.media.find((media) => media.type === 'IMAGE')
              return (
                <button
                  key={cottage.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCottageId(cottage.id)}
                  className={`group overflow-hidden rounded-2xl border text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                    active
                      ? 'border-emerald-700 bg-emerald-50/50 shadow-md ring-1 ring-emerald-700'
                      : 'border-stone-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-amber-900 sm:h-44">
                    {cover ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cover.url}
                          alt={cover.altText || `${cottage.name} representative photo`}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/65 via-transparent to-stone-950/10" />
                      </>
                    ) : (
                      <Mountain className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-emerald-100/70" aria-hidden="true" />
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-stone-950/65 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
                      <Home className="h-3.5 w-3.5" aria-hidden="true" />
                      {cottage.availableUnits} available
                    </span>
                    {active && (
                      <span className="absolute right-3 top-3 rounded-full bg-emerald-600 p-1.5 text-white shadow-lg">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
                      <h5 className="text-lg font-bold drop-shadow">{cottage.name}</h5>
                      <p className="shrink-0 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-bold text-stone-950 shadow">
                        ETB {formatPrice(cottage.pricePerNight)}<span className="ml-1 font-medium text-stone-600">/ night</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <p className="line-clamp-2 min-h-10 text-xs leading-5 text-stone-600">{cottage.description}</p>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 border-t border-stone-100 pt-3 text-[11px] font-medium text-stone-600">
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5 text-emerald-800" aria-hidden="true" />Up to {cottage.capacity}</span>
                      {cottage.hasPrivateDeck && <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-emerald-800" aria-hidden="true" />Deck</span>}
                      {cottage.hasTelescope && <span className="inline-flex items-center gap-1"><Telescope className="h-3.5 w-3.5 text-emerald-800" aria-hidden="true" />Telescope</span>}
                      {cottage.hasFireplace && <span className="inline-flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-emerald-800" aria-hidden="true" />Fireplace</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="border-t border-stone-100 bg-stone-50/70 p-5 sm:p-7 lg:border-l-0 lg:border-t-0 lg:p-8">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">02 · Add a little more</p>
            <h4 className="mt-1 text-xl font-bold text-stone-950">Experiences</h4>
            <p className="mt-1 text-sm leading-5 text-stone-600">Optional extras for your mountain stay.</p>
          </div>
          <div className="space-y-3">
            {experiences.length ? experiences.map((item) => {
              const active = item.id === selectedExperienceId
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedExperienceId(active ? null : item.id)}
                  className={`group flex w-full gap-3 rounded-2xl border p-3 text-left transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                    active
                      ? 'border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700'
                      : 'border-stone-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950 to-slate-800">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <Sparkles className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-amber-200" aria-hidden="true" />
                    )}
                    {active && (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-emerald-600 p-1 text-white">
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <span className="min-w-0 flex-1 py-0.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">{item.type.replaceAll('_', ' ')}</span>
                    <span className="mt-0.5 block font-bold leading-5 text-stone-950">{item.name}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-4 text-stone-600">{item.description}</span>
                    <span className="mt-2 block text-xs font-bold text-emerald-800">
                      ETB {formatPrice(item.price)} / guest{item.duration ? ` · ${item.duration} min` : ''}
                    </span>
                  </span>
                </button>
              )
            }) : (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">
                No experiences are available right now. You can still book a cottage.
              </div>
            )}
          </div>
          {selectedExperience && (
            <button
              type="button"
              onClick={() => setSelectedExperienceId(null)}
              className="mt-3 text-xs font-semibold text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-900"
            >
              Remove {selectedExperience.name}
            </button>
          )}
        </aside>
      </div>

      <div className="flex flex-col gap-4 border-t border-stone-100 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="text-sm text-stone-600">
          {selectedCottage ? (
            <>
              <p><strong className="text-stone-950">{selectedCottage.name}</strong> · ETB {formatPrice(selectedCottage.pricePerNight)} / night</p>
              <p className="mt-0.5 text-xs">
                {selectedExperience
                  ? `${selectedExperience.name} · ETB ${formatPrice(selectedExperience.price)} per guest`
                  : 'No experience added'}
              </p>
            </>
          ) : 'Choose a cottage to continue'}
        </div>
        <button
          type="button"
          disabled={!selectedCottage}
          onClick={() => setStep('booking')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/15 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Choose dates & guests <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
