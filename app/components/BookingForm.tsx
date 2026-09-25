'use client'

import { useState, useId } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Calendar, Users, Mail, Phone, MessageSquare, Star, Home, Flame, User } from 'lucide-react'
import { Button } from '@/components/ui/design-system/Button'
import { Input, Textarea } from '@/components/ui/design-system/Input'
import { generateId } from '@/lib/a11y'

type CottageOption = {
  id: string
  name: string
  description: string
  pricePerNight: number
  capacity: number
  hasTelescope: boolean
  hasPrivateDeck: boolean
  hasFireplace: boolean
  availableUnits: number
  media: {
    id: string
    title: string
    type: string
    url: string
    provider: string | null
    videoId: string | null
    caption: string | null
    altText: string | null
    sortOrder: number
  }[]
  links: {
    id: string
    type: string
    title: string
    url: string
    description: string | null
    openInNewTab: boolean
  }[]
}

type ExperienceOption = {
  id: string
  name: string
  description: string
  type: string
  price: number
  duration: number | null
  capacity: number
  imageUrl?: string
}

type Submitting = 'idle' | 'creating' | 'paying'

interface FormErrors {
  cottageId?: string
  checkIn?: string
  checkOut?: string
  guestCount?: string
  name?: string
  email?: string
  phone?: string
}

export default function BookingForm({
  cottages,
  experience,
}: {
  cottages: CottageOption[]
  experience?: ExperienceOption
}) {
  const [cottageId, setCottageId] = useState(cottages[0]?.id ?? '')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestCount, setGuestCount] = useState(2)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [submitting, setSubmitting] = useState<Submitting>('idle')
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const selected = cottages.find((c) => c.id === cottageId)

  const nights = (() => {
    if (!checkIn || !checkOut) return 0
    const a = new Date(checkIn + 'T12:00:00')
    const b = new Date(checkOut + 'T12:00:00')
    return Math.round((b.getTime() - a.getTime()) / 86400000)
  })()

  const estimate = selected && nights > 0
    ? selected.pricePerNight * nights + (experience ? experience.price * guestCount : 0)
    : null

  const today = new Date().toISOString().split('T')[0]

  const validateField = (field: keyof FormErrors, value: string | number) => {
    let error = ''
    const strValue = String(value)
    switch (field) {
      case 'cottageId':
        if (!strValue) error = 'Please choose a cottage'
        break
      case 'checkIn':
        if (!strValue) error = 'Check-in date is required'
        break
      case 'checkOut':
        if (!strValue) error = 'Check-out date is required'
        else if (checkIn && strValue <= checkIn) error = 'Check-out must be after check-in'
        break
      case 'guestCount':
        const numValue = Number(value)
        if (numValue < 1) error = 'At least 1 guest required'
        else if (selected && numValue > selected.capacity) error = `This cottage sleeps up to ${selected.capacity} guests`
        break
      case 'name':
        if (!strValue.trim()) error = 'Full name is required'
        break
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) error = 'Enter a valid email'
        break
      case 'phone':
        if (strValue && !/^[\d\s\-\+\(\)]{7,}$/.test(strValue)) error = 'Enter a valid phone number'
        break
    }
    return error
  }

  const handleBlur = (field: keyof FormErrors, value: string | number) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const error = validateField(field, value)
    setErrors((prev) => ({ ...prev, [field]: error || undefined }))
  }

  const handleChange = (field: keyof FormErrors, value: string | number) => {
    const error = validateField(field, value)
    setErrors((prev) => ({ ...prev, [field]: error || undefined }))

    switch (field) {
      case 'cottageId': setCottageId(String(value)); break
      case 'checkIn': setCheckIn(String(value)); break
      case 'checkOut': setCheckOut(String(value)); break
      case 'guestCount': setGuestCount(Number(value)); break
      case 'name': setName(String(value)); break
      case 'email': setEmail(String(value)); break
      case 'phone': setPhone(String(value)); break
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}
    let hasError = false

    if (!cottageId) { newErrors.cottageId = 'Please choose a cottage'; hasError = true }
    if (!checkIn) { newErrors.checkIn = 'Check-in date is required'; hasError = true }
    if (!checkOut) { newErrors.checkOut = 'Check-out date is required'; hasError = true }
    else if (checkOut <= checkIn) { newErrors.checkOut = 'Check-out must be after check-in'; hasError = true }
    if (guestCount < 1) { newErrors.guestCount = 'At least 1 guest required'; hasError = true }
    else if (selected && guestCount > selected.capacity) { newErrors.guestCount = `This cottage sleeps up to ${selected.capacity} guests`; hasError = true }
    if (!name.trim()) { newErrors.name = 'Full name is required'; hasError = true }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { newErrors.email = 'Enter a valid email'; hasError = true }
    if (phone && !/^[\d\s\-\+\(\)]{7,}$/.test(phone)) { newErrors.phone = 'Enter a valid phone number'; hasError = true }

    setErrors(newErrors)
    setTouched({ cottageId: true, checkIn: true, checkOut: true, guestCount: true, name: true, email: true, phone: true })
    return !hasError
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting('creating')
    try {
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cottageId,
          experienceId: experience?.id,
          checkIn,
          checkOut,
          guestCount,
          name,
          email,
          phone: phone || undefined,
          specialRequests: specialRequests || undefined,
        }),
      })
      const booking = await bookingRes.json()
      if (!bookingRes.ok) return toast.error(booking.error || 'Could not create booking')

      setSubmitting('paying')
      const payRes = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'booking',
          entityId: booking.bookingId,
          email,
          name,
          phoneNumber: phone || undefined,
        }),
      })
      const pay = await payRes.json()
      if (!payRes.ok) return toast.error(pay.error || 'Could not start payment')

      if (pay.checkout_url) {
        toast.success('Redirecting to secure payment…')
        window.location.href = pay.checkout_url
      } else {
        toast.success(`Booking created (ref ${booking.bookingId}). Complete your payment.`)
      }
    } catch {
      toast.error('Something went wrong — please try again')
    } finally {
      setSubmitting('idle')
    }
  }

  const cottageIdId = useId()
  const checkInId = useId()
  const checkOutId = useId()
  const guestCountId = useId()
  const nameId = useId()
  const emailId = useId()
  const phoneId = useId()
  const specialRequestsId = useId()

  const amenityIcons = {
    telescope: Star,
    privateDeck: Home,
    fireplace: Flame,
  } as const

  return (
    <form onSubmit={handleSubmit} className="bg-white text-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6" noValidate>
      <div>
        <label htmlFor={cottageIdId} className="block font-semibold mb-2">Cottage</label>
        <select
          id={cottageIdId}
          value={cottageId}
          onChange={(e) => handleChange('cottageId', e.target.value)}
          onBlur={(e) => handleBlur('cottageId', e.target.value)}
          className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-describedby={errors.cottageId ? `${cottageIdId}-error` : undefined}
          aria-invalid={touched.cottageId && !!errors.cottageId}
        >
          {cottages.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — ETB {c.pricePerNight}/night · sleeps {c.capacity}
            </option>
          ))}
        </select>
        {touched.cottageId && errors.cottageId && (
          <p id={`${cottageIdId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">{errors.cottageId}</p>
        )}
        {selected && (
          <div className="mt-4 space-y-4">
            {selected.media.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Photos & Videos</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" role="list" aria-label="Cottage media">
                  {selected.media.map((m) => (
                    <div key={m.id} className="aspect-video rounded-xl overflow-hidden bg-stone-100 relative" role="listitem">
                      {m.type === 'VIDEO' ? (
                        <div className="absolute inset-0 flex items-center justify-center text-emerald-700" aria-label={`Video: ${m.provider || 'Video'}`}>
                          <span className="text-lg">▶ {m.provider || 'Video'}</span>
                        </div>
                      ) : (
                        <img src={m.url} alt={m.altText || m.title} className="w-full h-full object-cover" loading="lazy" />
                      )}
                      {m.caption && <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs">{m.caption}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selected.links.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Links</p>
                <div className="flex flex-wrap gap-2" role="list" aria-label="External links">
                  {selected.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target={link.openInNewTab ? '_blank' : '_self'}
                      rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 hover:bg-emerald-100"
                      role="listitem"
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-stone-500 flex flex-wrap gap-3" aria-label="Cottage amenities">
              {selected.hasTelescope && (
                <span className="flex items-center gap-1"><Star className="w-4 h-4" aria-hidden="true" /> Telescope</span>
              )}
              {selected.hasPrivateDeck && (
                <span className="flex items-center gap-1"><Home className="w-4 h-4" aria-hidden="true" /> Private deck</span>
              )}
              {selected.hasFireplace && (
                <span className="flex items-center gap-1"><Flame className="w-4 h-4" aria-hidden="true" /> Fireplace</span>
              )}
              <span className="flex items-center gap-1"><Users className="w-4 h-4" aria-hidden="true" /> {selected.availableUnits} unit(s) available</span>
            </p>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Input
            id={checkInId}
            type="date"
            label="Check-in"
            value={checkIn}
            onChange={(e) => handleChange('checkIn', e.target.value)}
            onBlur={(e) => handleBlur('checkIn', e.target.value)}
            min={today}
            required
            error={touched.checkIn ? errors.checkIn : undefined}
            hint="Select your arrival date"
            leadingIcon={<Calendar className="w-4 h-4" aria-hidden="true" />}
          />
        </div>
        <div>
          <Input
            id={checkOutId}
            type="date"
            label="Check-out"
            value={checkOut}
            onChange={(e) => handleChange('checkOut', e.target.value)}
            onBlur={(e) => handleBlur('checkOut', e.target.value)}
            min={checkIn || today}
            required
            error={touched.checkOut ? errors.checkOut : undefined}
            hint="Select your departure date"
            leadingIcon={<Calendar className="w-4 h-4" aria-hidden="true" />}
          />
        </div>
      </div>

      <div>
        <Input
          id={guestCountId}
          type="number"
          label="Guests"
          value={guestCount}
          onChange={(e) => handleChange('guestCount', Number(e.target.value))}
          onBlur={(e) => handleBlur('guestCount', Number(e.target.value))}
          min={1}
          max={selected?.capacity ?? 6}
          required
          error={touched.guestCount ? errors.guestCount : undefined}
          hint={`Maximum ${selected?.capacity ?? 6} guests`}
          leadingIcon={<Users className="w-4 h-4" aria-hidden="true" />}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Input
            id={nameId}
            type="text"
            label="Full name"
            value={name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={(e) => handleBlur('name', e.target.value)}
            required
            error={touched.name ? errors.name : undefined}
            leadingIcon={<User className="w-4 h-4" aria-hidden="true" />}
          />
        </div>
        <div>
          <Input
            id={phoneId}
            type="tel"
            label="Phone (optional)"
            value={phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={(e) => handleBlur('phone', e.target.value)}
            error={touched.phone ? errors.phone : undefined}
            hint="Include country code if international"
            leadingIcon={<Phone className="w-4 h-4" aria-hidden="true" />}
          />
        </div>
      </div>

      <div>
        <Input
          id={emailId}
          type="email"
          label="Email"
          value={email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={(e) => handleBlur('email', e.target.value)}
          required
          error={touched.email ? errors.email : undefined}
          hint="Booking confirmation will be sent here"
          leadingIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
        />
      </div>

      <div>
        <Textarea
          id={specialRequestsId}
          label="Special requests (optional)"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={2}
          placeholder="Dietary requirements, accessibility needs, etc."
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200 pt-4">
        <p className="text-lg" aria-live="polite">
          {estimate !== null ? (
            <>
              <span className="font-bold text-emerald-700">ETB {estimate.toLocaleString()}</span>{' '}
              <span className="text-stone-500 text-sm">for {nights} night{nights > 1 ? 's' : ''}</span>
            </>
          ) : (
            <span className="text-stone-400">Select dates to see the total</span>
          )}
        </p>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting !== 'idle'}
          icon={submitting !== 'idle' ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
          iconPosition="left"
          disabled={submitting !== 'idle'}
        >
          {submitting === 'creating' && 'Checking availability…'}
          {submitting === 'paying' && 'Redirecting to payment…'}
          {submitting === 'idle' && 'Book & Pay'}
        </Button>
      </div>
    </form>
  )
}