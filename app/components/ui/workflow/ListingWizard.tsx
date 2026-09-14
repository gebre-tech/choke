'use client'

import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { Package, Image, Link2, Settings, CheckCircle, Loader2 } from 'lucide-react'
import { Stepper, Step, StepperProps } from './Stepper'
import { MediaUploader } from '@/components/ui/forms/MediaUploader'
import { LinkManager } from '@/components/ui/forms/LinkManager'
import { FormSection } from '@/components/ui/forms/FormSection'
import { Input, Textarea, Select, Checkbox } from '@/components/ui/design-system'
import { useDraft } from '@/hooks/useDraft'
import { useToastHelpers } from '@/components/ui/design-system/Toast'
import { Button } from '@/components/ui/design-system'
import { Modal } from '@/components/ui/design-system/Modal'
import { Input as InputComponent, Textarea as TextareaComponent, Select as SelectComponent, Checkbox as CheckboxComponent } from '@/components/ui/design-system'

export type ListingType = 'product' | 'cottage' | 'experience'

export interface ListingData {
  // Basic details
  name: string
  description: string
  category?: string
  type?: string
  price: number
  pricePerNight?: number
  
  // Product specific
  stock?: number
  minimumStock?: number
  producerName?: string
  producerLocation?: string
  isOrganic?: boolean
  weight?: number
  
  // Cottage specific
  capacity?: number
  bedrooms?: number
  beds?: number
  bathrooms?: number
  hasTelescope?: boolean
  hasFireplace?: boolean
  hasPrivateDeck?: boolean
  hasKitchenette?: boolean
  hasHeatedFloors?: boolean
  hasWifi?: boolean
  totalUnits?: number
  availableUnits?: number
  altitude?: number
  viewDescription?: string
  
  // Experience specific
  duration?: number
  startTime?: string
  endTime?: string
  difficultyLevel?: string
  ageRequirement?: number
  includedItems?: string[]
  maxBookingsPerDay?: number
  cottageId?: string
  
  // Media & Links
  media: MediaItem[]
  links: LinkItem[]
  
  // Status
  isActive: boolean
  publicationStatus: 'draft' | 'pending' | 'published' | 'rejected'
}

export interface MediaItem {
  id: string
  type: 'IMAGE' | 'VIDEO' | 'AUDIO'
  url: string
  title: string
  caption?: string
  altText?: string
  sortOrder: number
  isCover: boolean
  file?: File
}

export interface LinkItem {
  id: string
  type: 'WEBSITE' | 'BOOKING' | 'PURCHASE' | 'LOCATION' | 'SOCIAL' | 'VIDEO' | 'OTHER'
  title: string
  url: string
  description?: string
  openInNewTab: boolean
  sortOrder: number
}

interface ListingWizardProps {
  type: ListingType
  initialData?: Partial<ListingData>
  onPublish: (data: ListingData) => Promise<void>
  onSaveDraft: (data: ListingData) => Promise<void>
  onCancel: () => void
  cottageOptions?: { id: string; name: string }[]
  existingDraftId?: string
}

const PRODUCT_CATEGORIES = ['HONEY', 'COFFEE', 'CRAFTS', 'SPICES', 'BAMBOO', 'OTHER']
const EXPERIENCE_TYPES = ['STARGAZING', 'TREKKING', 'CITY_LIGHTS', 'SUNRISE_SUNSET', 'CULTURAL_TOUR', 'BIRD_WATCHING']

const getSteps = (type: ListingType): Step[] => {
  const commonSteps: Step[] = [
    { id: 'details', label: 'Details', description: 'Basic information about your listing', icon: <Package className="w-5 h-5" /> },
    { id: 'media', label: 'Media', description: 'Photos, videos, and cover image', icon: <Image className="w-5 h-5" /> },
    { id: 'links', label: 'Links', description: 'External links for booking, website, etc.', icon: <Link2 className="w-5 h-5" />, optional: true },
    { id: 'additional', label: 'Additional', description: 'Type-specific details and settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'review', label: 'Review', description: 'Final review before publishing', icon: <CheckCircle className="w-5 h-5" /> },
  ]

  return commonSteps
}

const getDetailsFields = (type: ListingType, data: ListingData, setData: (data: Partial<ListingData>) => void) => {
  const commonFields = (
    <>
      <InputComponent
        label="Name"
        value={data.name}
        onChange={(e) => setData({ name: e.target.value })}
        required
        placeholder="Enter listing name"
      />
      <TextareaComponent
        label="Description"
        value={data.description}
        onChange={(e) => setData({ description: e.target.value })}
        required
        rows={3}
        placeholder="Describe your listing..."
      />
      <InputComponent
        label="Price (ETB)"
        type="number"
        min="1"
        step="0.01"
        value={data.price}
        onChange={(e) => setData({ price: Number(e.target.value) })}
        required
      />
    </>
  )

  if (type === 'product') {
    return (
      <>
        {commonFields}
        <SelectComponent
          label="Category"
          value={data.category || ''}
          onChange={(e) => setData({ category: e.target.value })}
          required
          options={PRODUCT_CATEGORIES.map(c => ({ value: c, label: c }))}
          placeholder="Select category"
        />
        <InputComponent
          label="Stock"
          type="number"
          min="0"
          value={data.stock || 0}
          onChange={(e) => setData({ stock: Number(e.target.value) })}
        />
        <InputComponent
          label="Minimum Stock Alert"
          type="number"
          min="0"
          value={data.minimumStock || 5}
          onChange={(e) => setData({ minimumStock: Number(e.target.value) })}
        />
        <InputComponent
          label="Producer Name"
          value={data.producerName || 'Taeme Abakidan Community'}
          onChange={(e) => setData({ producerName: e.target.value })}
        />
        <InputComponent
          label="Producer Location"
          value={data.producerLocation || 'Dega Damot, Ethiopia'}
          onChange={(e) => setData({ producerLocation: e.target.value })}
        />
        <CheckboxComponent
          label="Organic"
          checked={data.isOrganic ?? true}
          onChange={(e) => setData({ isOrganic: e.target.checked })}
        />
        <InputComponent
          label="Weight (kg)"
          type="number"
          min="0"
          step="0.01"
          value={data.weight || ''}
          onChange={(e) => setData({ weight: e.target.value ? Number(e.target.value) : undefined })}
        />
      </>
    )
  }

  if (type === 'cottage') {
    return (
      <>
        {commonFields}
        <InputComponent
          label="Price per Night (ETB)"
          type="number"
          min="1"
          step="0.01"
          value={data.pricePerNight || data.price}
          onChange={(e) => setData({ pricePerNight: Number(e.target.value), price: Number(e.target.value) })}
          required
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <InputComponent
            label="Capacity"
            type="number"
            min="1"
            value={data.capacity || 2}
            onChange={(e) => setData({ capacity: Number(e.target.value) })}
          />
          <InputComponent
            label="Bedrooms"
            type="number"
            min="0"
            value={data.bedrooms || 1}
            onChange={(e) => setData({ bedrooms: Number(e.target.value) })}
          />
          <InputComponent
            label="Beds"
            type="number"
            min="0"
            value={data.beds || 1}
            onChange={(e) => setData({ beds: Number(e.target.value) })}
          />
          <InputComponent
            label="Bathrooms"
            type="number"
            min="0"
            value={data.bathrooms || 1}
            onChange={(e) => setData({ bathrooms: Number(e.target.value) })}
          />
          <InputComponent
            label="Total Units"
            type="number"
            min="1"
            value={data.totalUnits || 1}
            onChange={(e) => setData({ totalUnits: Number(e.target.value) })}
          />
          <InputComponent
            label="Available Units"
            type="number"
            min="0"
            value={data.availableUnits || 1}
            onChange={(e) => setData({ availableUnits: Number(e.target.value) })}
          />
          <InputComponent
            label="Altitude (m)"
            type="number"
            value={data.altitude || ''}
            onChange={(e) => setData({ altitude: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <CheckboxComponent label="Telescope" checked={data.hasTelescope} onChange={(e) => setData({ hasTelescope: e.target.checked })} />
          <CheckboxComponent label="Fireplace" checked={data.hasFireplace} onChange={(e) => setData({ hasFireplace: e.target.checked })} />
          <CheckboxComponent label="Private Deck" checked={data.hasPrivateDeck} onChange={(e) => setData({ hasPrivateDeck: e.target.checked })} />
          <CheckboxComponent label="Kitchenette" checked={data.hasKitchenette} onChange={(e) => setData({ hasKitchenette: e.target.checked })} />
          <CheckboxComponent label="Heated Floors" checked={data.hasHeatedFloors} onChange={(e) => setData({ hasHeatedFloors: e.target.checked })} />
          <CheckboxComponent label="Wi-Fi" checked={data.hasWifi} onChange={(e) => setData({ hasWifi: e.target.checked })} />
        </div>
        <TextareaComponent
          label="View Description"
          value={data.viewDescription || ''}
          onChange={(e) => setData({ viewDescription: e.target.value })}
          rows={2}
        />
      </>
    )
  }

  if (type === 'experience') {
    return (
      <>
        {commonFields}
        <SelectComponent
          label="Type"
          value={data.type || ''}
          onChange={(e) => setData({ type: e.target.value })}
          required
          options={EXPERIENCE_TYPES.map(t => ({ value: t, label: t }))}
          placeholder="Select type"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <InputComponent
            label="Duration (minutes)"
            type="number"
            min="1"
            value={data.duration || ''}
            onChange={(e) => setData({ duration: e.target.value ? Number(e.target.value) : undefined })}
          />
          <InputComponent
            label="Capacity"
            type="number"
            min="1"
            value={data.capacity || 10}
            onChange={(e) => setData({ capacity: Number(e.target.value) })}
          />
          <InputComponent
            label="Max Bookings/Day"
            type="number"
            min="1"
            value={data.maxBookingsPerDay || 5}
            onChange={(e) => setData({ maxBookingsPerDay: Number(e.target.value) })}
          />
          <InputComponent
            label="Start Time (HH:MM)"
            type="time"
            value={data.startTime || ''}
            onChange={(e) => setData({ startTime: e.target.value || undefined })}
          />
          <InputComponent
            label="End Time (HH:MM)"
            type="time"
            value={data.endTime || ''}
            onChange={(e) => setData({ endTime: e.target.value || undefined })}
          />
          <SelectComponent
            label="Linked Cottage (optional)"
            value={data.cottageId || ''}
onChange={(e) => setData({ cottageId: e.target.value || undefined })}
            options={[
              { value: '', label: 'None' },
              // Will be populated by wizard
            ]}
          />
        </div>
        <TextareaComponent
          label="Included Items (one per line)"
          value={data.includedItems?.join('\n') || ''}
          onChange={(e) => setData({ includedItems: e.target.value.split('\n').filter(Boolean) })}
          rows={2}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <InputComponent
            label="Difficulty Level"
            value={data.difficultyLevel || ''}
            onChange={(e) => setData({ difficultyLevel: e.target.value })}
            placeholder="Easy / Moderate / Hard"
          />
          <InputComponent
            label="Minimum Age"
            type="number"
            min="0"
            value={data.ageRequirement || 0}
            onChange={(e) => setData({ ageRequirement: Number(e.target.value) })}
          />
        </div>
      </>
    )
  }

  return commonFields
}

export const ListingWizard = ({
  type,
  initialData = {},
  onPublish,
  onSaveDraft,
  onCancel,
  cottageOptions = [],
  existingDraftId,
}: ListingWizardProps) => {
  const { error: toastError, success: toastSuccess } = useToastHelpers()
  const draftKey = `listing-wizard-${type}-${existingDraftId || 'new'}`

  const { data, setData, isDirty, saveDraft, loadDraft, clearDraft } = useDraft<ListingData>({
    key: draftKey,
    initialData: {
      name: '',
      description: '',
      price: 0,
      media: [],
      links: [],
      isActive: true,
      publicationStatus: 'draft',
      ...initialData,
    },
  })

  const steps = getSteps(type)
  const [currentStep, setCurrentStep] = useState(0)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  const validateStep = useCallback((stepIndex: number): boolean => {
    const step = steps[stepIndex]
    const errors: string[] = []

    if (step.id === 'details') {
      if (!data.name.trim()) errors.push('Name is required')
      if (!data.description.trim()) errors.push('Description is required')
      if (!data.price || data.price < 1) errors.push('Price must be greater than 0')

      if (type === 'product') {
        if (!data.category) errors.push('Category is required')
        if ((data.stock ?? 0) < 0) errors.push('Stock cannot be negative')
      }
      if (type === 'cottage') {
        if (!data.pricePerNight || data.pricePerNight < 1) errors.push('Price per night is required')
        if ((data.capacity ?? 0) < 1) errors.push('Capacity must be at least 1')
      }
      if (type === 'experience') {
        if (!data.type) errors.push('Experience type is required')
        if ((data.capacity ?? 0) < 1) errors.push('Capacity must be at least 1')
      }
    }

    if (step.id === 'media') {
      const images = data.media.filter(m => m.type === 'IMAGE')
      if (images.length === 0) {
        errors.push('At least one cover image is required')
      }
    }

    if (step.id === 'links') {
      if (data.links.length === 0) {
        // Links are optional for drafts, but required for publish
      }
    }

    setValidationErrors(prev => ({ ...prev, [step.id]: errors }))
    return errors.length === 0
  }, [data, steps, type])

  const canProceed = useCallback(() => {
    return validateStep(currentStep)
  }, [validateStep, currentStep])

  const handleNext = useCallback(() => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [validateStep, currentStep, steps.length])

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }, [])

  const handleSaveDraft = useCallback(async () => {
    setIsSavingDraft(true)
    try {
      const draftData = { ...data, publicationStatus: 'draft' as const }
      await saveDraft(draftData)
      await onSaveDraft(draftData)
      toastSuccess('Draft saved successfully')
    } catch (error) {
      toastError('Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }, [data, saveDraft, onSaveDraft, toastSuccess, toastError])

  const renderStepContent = useCallback((step: Step, isActive: boolean, isCompleted: boolean, validationErrors?: string[]) => {
    switch (step.id) {
      case 'details':
        return getDetailsFields(type, data, setData)
      case 'media':
        return <MediaUploader media={data.media} onChange={(media) => setData({ media })} />
      case 'links':
        return <LinkManager links={data.links} onChange={(links) => setData({ links })} />
      case 'additional':
        return <AdditionalDetails type={type} data={data} setData={setData} cottageOptions={cottageOptions} />
      case 'review':
        return <ReviewStep type={type} data={data} />
      default:
        return null
    }
  }, [type, data, setData, cottageOptions])

  const handlePublish = useCallback(async () => {
    const allValid = steps.every((_, i) => validateStep(i))
    if (!allValid) {
      const firstInvalid = steps.findIndex((_, i) => !validateStep(i))
      if (firstInvalid >= 0) setCurrentStep(firstInvalid)
      return
    }

    setIsSubmitting(true)
    try {
      const publishData = { ...data, publicationStatus: 'published' as const }
      await clearDraft()
      await onPublish(publishData)
      toastSuccess('Listing published successfully!')
    } catch (error) {
      toastError('Failed to publish listing')
    } finally {
      setIsSubmitting(false)
    }
  }, [data, steps, validateStep, clearDraft, onPublish, toastSuccess, toastError])

  useEffect(() => {
    loadDraft()
  }, [loadDraft])

  const canProceedNow = validateStep(currentStep)

  return (
    <div className="max-w-4xl mx-auto">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSubmit={handlePublish}
        onSaveDraft={handleSaveDraft}
        canProceed={canProceedNow}
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingDraft}
        showSaveDraft={true}
        validationErrors={validationErrors}
        renderStep={renderStepContent}
      />
    </div>
  )
}

const AdditionalDetails = ({ type, data, setData, cottageOptions }: { type: ListingType; data: ListingData; setData: (d: Partial<ListingData>) => void; cottageOptions: { id: string; name: string }[] }) => {
  if (type === 'product') {
    return (
      <div className="space-y-4">
        <CheckboxComponent
          label="Active (visible in marketplace)"
          checked={data.isActive}
          onChange={(e) => setData({ isActive: e.target.checked })}
        />
        <TextareaComponent
          label="Additional Notes"
          value={data.viewDescription || ''}
          onChange={(e) => setData({ viewDescription: e.target.value })}
          rows={2}
          placeholder="Internal notes..."
        />
      </div>
    )
  }

  if (type === 'cottage') {
    return (
      <div className="space-y-4">
        <CheckboxComponent
          label="Available for booking"
          checked={data.isActive}
          onChange={(e) => setData({ isActive: e.target.checked })}
        />
        <TextareaComponent
          label="View Description"
          value={data.viewDescription || ''}
          onChange={(e) => setData({ viewDescription: e.target.value })}
          rows={2}
        />
      </div>
    )
  }

  if (type === 'experience') {
    return (
      <div className="space-y-4">
        <SelectComponent
          label="Linked Cottage"
          value={data.cottageId || ''}
          onChange={(e) => setData({ cottageId: e.target.value || undefined })}
          options={[{ value: '', label: 'None' }, ...cottageOptions.map(c => ({ value: c.id, label: c.name }))]}
        />
        <CheckboxComponent
          label="Active"
          checked={data.isActive}
          onChange={(e) => setData({ isActive: e.target.checked })}
        />
      </div>
    )
  }

  return null
}

const ReviewStep = ({ type, data }: { type: ListingType; data: ListingData }) => {
  const images = data.media.filter(m => m.type === 'IMAGE')
  const videos = data.media.filter(m => m.type === 'VIDEO')

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-stone-900">Basic Information</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Name</dt><dd className="font-medium">{data.name}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Type</dt><dd className="font-medium capitalize">{type}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Price</dt><dd className="font-medium">ETB {data.price.toLocaleString()}</dd></div>
            {type === 'product' && <div className="flex justify-between"><dt className="text-stone-500">Stock</dt><dd className="font-medium">{data.stock}</dd></div>}
            {type === 'cottage' && <div className="flex justify-between"><dt className="text-stone-500">Capacity</dt><dd className="font-medium">{data.capacity} guests</dd></div>}
            {type === 'experience' && <div className="flex justify-between"><dt className="text-stone-500">Duration</dt><dd className="font-medium">{data.duration} min</dd></div>}
          </dl>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-stone-900">Media</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Images</dt><dd className="font-medium">{images.length}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Videos</dt><dd className="font-medium">{videos.length}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Cover Set</dt><dd className="font-medium">{data.media.some(m => m.isCover) ? 'Yes' : 'No'}</dd></div>
          </dl>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-stone-900">Links</h4>
          <dl className="space-y-2 text-sm">
            {data.links.length === 0 ? (
              <dd className="text-stone-500">No links added</dd>
            ) : (
              data.links.map((link, i) => (
                <div key={i} className="flex justify-between">
                  <dt className="text-stone-500 capitalize">{link.type.toLowerCase()}</dt>
                  <dd className="font-medium truncate max-w-[200px]">{link.title}</dd>
                </div>
              ))
            )}
          </dl>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-stone-900">Status</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Active</dt><dd className="font-medium">{data.isActive ? 'Yes' : 'No'}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Publication</dt><dd className="font-medium capitalize">{data.publicationStatus}</dd></div>
          </dl>
        </div>
      </div>

      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-sm text-emerald-800">
          <strong>Ready to publish!</strong> Your listing will be visible to customers immediately after publishing.
        </p>
      </div>
    </div>
  )
}

export default ListingWizard