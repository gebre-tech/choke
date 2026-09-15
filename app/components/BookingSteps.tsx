'use client'

import { useState, useCallback, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Loader2, Calendar, Users, Mail, Phone, MessageSquare, ArrowRight, ArrowLeft, Check, Star, Home, Flame } from 'lucide-react'
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

type Step = 'cottage' | 'dates' | 'guests' | 'details' | 'review'
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

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'cottage', label: 'Choose Cottage', icon: <Home className="w-5 h-5" /> },
  { id: 'dates', label: 'Dates', icon: <Calendar className="w-5 h-5" /> },
  { id: 'guests', label: 'Guests', icon: <Users className="w-5 h-5" /> },
  { id: 'details', label: 'Your Details', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'review', label: 'Review', icon: <Check className="w-5 h-5" /> },
]

export function BookingSteps({ cottages }: { cottages: CottageOption[] }) {
  const [currentStep, setCurrentStep] = useState<Step>('cottage')
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
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

  const estimate = selected && nights > 0 ? selected.pricePerNight * nights : null
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

  const validateStep = useCallback((step: Step): boolean => {
    const newErrors: FormErrors = {}
    let hasError = false

    switch (step) {
      case 'cottage':
        if (!cottageId) { newErrors.cottageId = 'Please choose a cottage'; hasError = true }
        break
      case 'dates':
        if (!checkIn) { newErrors.checkIn = 'Check-in date is required'; hasError = true }
        if (!checkOut) { newErrors.checkOut = 'Check-out date is required'; hasError = true }
        else if (checkOut <= checkIn) { newErrors.checkOut = 'Check-out must be after check-in'; hasError = true }
        break
      case 'guests':
        if (guestCount < 1) { newErrors.guestCount = 'At least 1 guest required'; hasError = true }
        else if (selected && guestCount > selected.capacity) { newErrors.guestCount = `This cottage sleeps up to ${selected.capacity} guests`; hasError = true }
        break
      case 'details':
        if (!name.trim()) { newErrors.name = 'Full name is required'; hasError = true }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { newErrors.email = 'Enter a valid email'; hasError = true }
        if (phone && !/^[\d\s\-\+\(\)]{7,}$/.test(phone)) { newErrors.phone = 'Enter a valid phone number'; hasError = true }
        break
    }

    setErrors(newErrors)
    return !hasError
  }, [cottageId, checkIn, checkOut, guestCount, name, email, phone, selected])

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

  const goNext = () => {
    if (!validateStep(currentStep)) return
    const currentIndex = STEPS.findIndex(s => s.id === currentStep)
    if (currentIndex < STEPS.length - 1) {
      setDirection('forward')
      setCurrentStep(STEPS[currentIndex + 1].id)
    }
  }

  const goBack = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep)
    if (currentIndex > 0) {
      setDirection('backward')
      setCurrentStep(STEPS[currentIndex - 1].id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep('details') || !validateStep('guests') || !validateStep('dates') || !validateStep('cottage')) return

    setSubmitting('creating')
    try {
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cottageId,
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

  const stepVariants = {
    forward: { initial: { x: 300, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -300, opacity: 0 } },
    backward: { initial: { x: -300, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 300, opacity: 0 } },
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

  const renderStepContent = (step: Step) => {
    switch (step) {
      case 'cottage':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-2">Choose Your Cottage</h2>
            <p className="text-stone-500 mb-6">Select the perfect cottage for your stay</p>
            <div className="grid md:grid-cols-2 gap-4">
              {cottages.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setCottageId(c.id); setTimeout(goNext, 300) }}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    cottageId === c.id
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                      : 'border-stone-200 hover:border-emerald-300 hover:shadow-md'
                  }`}
                >
                  <div className="aspect-video rounded-xl overflow-hidden bg-stone-100 mb-4">
                    {c.media[0] && c.media[0].type === 'IMAGE' ? (
                      <img src={c.media[0].url} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
                        <Home className="w-12 h-12 text-emerald-300" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <p className="text-emerald-600 font-semibold">ETB {c.pricePerNight.toLocaleString()}/night</p>
                  <p className="text-sm text-stone-500 mt-1">Sleeps {c.capacity}</p>
                  {cottageId === c.id && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )
      case 'dates':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-2">Select Dates</h2>
            <p className="text-stone-500 mb-6">When would you like to stay?</p>
            <div className="grid sm:grid-cols-2 gap-4">
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
                hint="Arrival date"
                leadingIcon={<Calendar className="w-4 h-4" />}
              />
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
                hint="Departure date"
                leadingIcon={<Calendar className="w-4 h-4" />}
              />
            </div>
            {nights > 0 && (
              <p className="text-lg font-semibold text-emerald-700 animate-fade-in">
                {nights} night{nights > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )
      case 'guests':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-2">Number of Guests</h2>
            <p className="text-stone-500 mb-6">How many people will be staying?</p>
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
              leadingIcon={<Users className="w-4 h-4" />}
            />
            {selected && (
              <p className="text-sm text-stone-500 flex flex-wrap gap-3" aria-label="Cottage amenities">
                {selected.hasTelescope && <span className="flex items-center gap-1"><Star className="w-4 h-4" /> Telescope</span>}
                {selected.hasPrivateDeck && <span className="flex items-center gap-1"><Home className="w-4 h-4" /> Private deck</span>}
                {selected.hasFireplace && <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> Fireplace</span>}
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {selected.availableUnits} unit(s) available</span>
              </p>
            )}
          </div>
        )
      case 'details':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-2">Your Details</h2>
            <p className="text-stone-500 mb-6">We'll send your confirmation to this email</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id={nameId}
                type="text"
                label="Full name"
                value={name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={(e) => handleBlur('name', e.target.value)}
                required
                error={touched.name ? errors.name : undefined}
                leadingIcon={<span className="w-4 h-4">👤</span>}
              />
              <Input
                id={phoneId}
                type="tel"
                label="Phone (optional)"
                value={phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={(e) => handleBlur('phone', e.target.value)}
                error={touched.phone ? errors.phone : undefined}
                hint="Include country code"
                leadingIcon={<Phone className="w-4 h-4" />}
              />
            </div>
            <Input
              id={emailId}
              type="email"
              label="Email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              required
              error={touched.email ? errors.email : undefined}
              hint="Booking confirmation sent here"
              leadingIcon={<Mail className="w-4 h-4" />}
            />
            <Textarea
              id={specialRequestsId}
              label="Special requests (optional)"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={2}
              placeholder="Dietary requirements, accessibility needs, etc."
            />
          </div>
        )
      case 'review':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-2">Review Your Booking</h2>
            <p className="text-stone-500 mb-6">Please verify all details before confirming</p>
            <div className="bg-stone-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="aspect-video w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
                  {selected?.media[0] && selected.media[0].type === 'IMAGE' ? (
                    <img src={selected.media[0].url} alt={selected.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
                      <Home className="w-10 h-10 text-emerald-300" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selected?.name}</h3>
                  <p className="text-emerald-600 font-semibold">ETB {selected?.pricePerNight.toLocaleString()}/night</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-stone-500">Check-in:</span> <span className="font-medium ml-2">{checkIn}</span></div>
                <div><span className="text-stone-500">Check-out:</span> <span className="font-medium ml-2">{checkOut}</span></div>
                <div><span className="text-stone-500">Nights:</span> <span className="font-medium ml-2">{nights}</span></div>
                <div><span className="text-stone-500">Guests:</span> <span className="font-medium ml-2">{guestCount}</span></div>
                <div><span className="text-stone-500">Name:</span> <span className="font-medium ml-2">{name}</span></div>
                <div><span className="text-stone-500">Email:</span> <span className="font-medium ml-2">{email}</span></div>
                {phone && <div><span className="text-stone-500">Phone:</span> <span className="font-medium ml-2">{phone}</span></div>}
              </div>
              {specialRequests && (
                <div><span className="text-stone-500">Requests:</span> <span className="font-medium ml-2">{specialRequests}</span></div>
              )}
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-emerald-700">
                {estimate !== null ? `ETB ${estimate.toLocaleString()}` : 'Select dates to see total'}
              </p>
              <p className="text-stone-500 mt-1">for {nights} night{nights > 1 ? 's' : ''}</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl overflow-hidden" noValidate>
      {/* Step Indicator */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                key={step.id}
                layoutId={`step-${step.id}`}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  STEPS.findIndex(s => s.id === currentStep) >= index
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/20 text-white/60'
                }`}
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {STEPS.findIndex(s => s.id === currentStep) > index ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </motion.div>
              {index < STEPS.length - 1 && (
                <motion.div
                  className={`h-0.5 w-16 transition-all ${
                    STEPS.findIndex(s => s.id === currentStep) > index
                      ? 'bg-white'
                      : 'bg-white/20'
                  }`}
                  initial={false}
                  animate={{ scaleX: STEPS.findIndex(s => s.id === currentStep) > index ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  style={{ transformOrigin: 'left' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={stepVariants[direction]}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="p-6 md:p-8"
        >
          {renderStepContent(currentStep)}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          Step {STEPS.findIndex(s => s.id === currentStep) + 1} of {STEPS.length}
        </div>
        <div className="flex items-center gap-3">
          {currentStep !== 'cottage' && (
            <Button
              variant="secondary"
              onClick={goBack}
              icon={<ArrowLeft className="w-4 h-4" />}
              iconPosition="left"
              disabled={submitting !== 'idle'}
            >
              Back
            </Button>
          )}
          {currentStep === 'review' ? (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting !== 'idle'}
              icon={submitting !== 'idle' ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
              disabled={submitting !== 'idle'}
            >
              {submitting === 'creating' && 'Checking availability…'}
              {submitting === 'paying' && 'Redirecting to payment…'}
              {submitting === 'idle' && 'Book & Pay'}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              variant="primary"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              disabled={!validateStep(currentStep) || submitting !== 'idle'}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}