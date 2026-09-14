'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, AlertCircle, Loader2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/design-system'
import { Tooltip } from '@/components/ui/design-system/Tooltip'

export interface Step {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  optional?: boolean
  disabled?: boolean
  helpContent?: ReactNode
}

export interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit?: () => void
  onSaveDraft?: () => void
  canProceed?: boolean
  isSubmitting?: boolean
  isSavingDraft?: boolean
  showSaveDraft?: boolean
  showReview?: boolean
  validationErrors?: Record<string, string[]>
  className?: string
  renderStep?: (step: Step, isActive: boolean, isCompleted: boolean, validationErrors?: string[]) => ReactNode
}

export interface StepContentProps {
  step: Step
  isActive: boolean
  isCompleted: boolean
  validationErrors?: string[]
}

const stepStatusStyles = {
  active: 'bg-emerald-600 text-white border-emerald-600',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  pending: 'bg-stone-100 text-stone-400 border-stone-200',
  error: 'bg-red-50 text-red-600 border-red-200',
}

export const Stepper = ({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onSubmit,
  onSaveDraft,
  canProceed = true,
  isSubmitting = false,
  isSavingDraft = false,
  showSaveDraft = true,
  showReview = true,
  validationErrors = {},
  className = '',
  renderStep,
}: StepperProps) => {
  const getStepStatus = (index: number) => {
    if (validationErrors[steps[index]?.id]?.length) return 'error'
    if (index < currentStep) return 'completed'
    if (index === currentStep) return 'active'
    return 'pending'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (currentStep === steps.length - 1) {
        onSubmit?.()
      } else {
        onNext()
      }
    }
  }

  const currentStepData = steps[currentStep]
  const isCompleted = currentStep > 0
  const stepValidationErrors = validationErrors[currentStepData?.id]

  return (
    <div className={className} onKeyDown={handleKeyDown}>
      <div className="mb-6" role="navigation" aria-label="Creation progress">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-stone-900">Create Listing</h2>
          <span className="text-sm text-stone-500">Step {currentStep + 1} of {steps.length}</span>
        </div>

        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-200 z-0" />
          <div className="relative flex items-center justify-between z-10">
            {steps.map((step, index) => {
              const status = getStepStatus(index)
              const isLast = index === steps.length - 1

              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2
                      transition-all duration-300
                      ${stepStatusStyles[status]}
                    `}
                    aria-current={index === currentStep ? 'step' : undefined}
                    aria-label={`Step ${index + 1}: ${step.label}${step.optional ? ' (optional)' : ''}`}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : status === 'error' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`
                        absolute top-5 left-[calc(50%+5px)] right-[calc(50%+5px)] h-0.5 z-0
                        ${index < currentStep ? 'bg-emerald-300' : 'bg-stone-200'}
                      `}
                    />
                  )}
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${status === 'error' ? 'text-red-600' : 'text-stone-500'}`}>
                      {step.label}
                    </p>
                    {step.optional && <span className="text-[10px] text-stone-400">Optional</span>}
                    {validationErrors[step.id]?.length && (
                      <Tooltip content={validationErrors[step.id].join(', ')}>
                        <AlertCircle className="w-3 h-3 text-red-500 mx-auto mt-0.5" />
                      </Tooltip>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          {currentStep > 0 && (
            <Button
              variant="secondary"
              onClick={onPrevious}
              disabled={isSubmitting || isSavingDraft}
              icon={<ChevronRight className="w-4 h-4 rotate-180" />}
              iconPosition="left"
            >
              Previous
            </Button>
          )}

          <div className="flex-1 flex justify-end gap-3">
            {showSaveDraft && currentStep < steps.length - 1 && (
              <Button
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSavingDraft}
                loading={isSavingDraft}
              >
                Save Draft
              </Button>
            )}

            {currentStep === steps.length - 1 ? (
              <Button
                variant="primary"
                onClick={onSubmit}
                disabled={!canProceed || isSubmitting}
                loading={isSubmitting}
                icon={<Loader2 className="w-4 h-4 animate-spin" />}
              >
                {isSubmitting ? 'Publishing…' : 'Publish'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={onNext}
                disabled={!canProceed || isSubmitting || isSavingDraft}
                icon={<ChevronRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mt-6"
        >
          {renderStep ? (
            renderStep(currentStepData, true, isCompleted, stepValidationErrors)
          ) : (
            <StepContent
              step={currentStepData}
              isActive={true}
              isCompleted={isCompleted}
              validationErrors={stepValidationErrors}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const StepContent = ({ step, isActive, isCompleted, validationErrors }: StepContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          {step.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-stone-900">{step.label}</h3>
          {step.description && <p className="text-sm text-stone-500 mt-1">{step.description}</p>}
          {step.optional && <span className="inline-flex items-center gap-1 text-xs text-stone-400 mt-1">
            <HelpCircle className="w-3 h-3" />
            Optional step
          </span>}
        </div>
      </div>

      {validationErrors?.length && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Please fix the following:
          </h4>
          <ul className="space-y-1 text-sm text-red-700">
            {validationErrors.map((err, i) => (
              <li key={i} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.helpContent && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Need help?
          </h4>
          <div className="text-sm text-blue-700">{step.helpContent}</div>
        </div>
      )}
    </div>
  )
}

export const StepIndicator = ({ steps, currentStep, compact = false }: { steps: Step[]; currentStep: number; compact?: boolean }) => {
  return (
    <div className="flex items-center gap-1" role="navigation" aria-label="Step progress">
      {steps.map((step, index) => {
        const status = index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending'
        return (
          <div key={step.id} className="flex items-center gap-1">
            <div className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold
              transition-all duration-300 ${stepStatusStyles[status]}
              ${compact ? 'w-6 h-6 text-[10px]' : ''}
            `}>
              {status === 'completed' ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 flex-1 max-w-16 ${index < currentStep ? 'bg-emerald-300' : 'bg-stone-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}