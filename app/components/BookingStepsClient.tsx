'use client'

import dynamic from 'next/dynamic'
import { BookingSteps as BookingStepsComponent } from '@/components/BookingSteps'

const BookingStepsClient = dynamic(() => import('@/components/BookingSteps').then(m => m.BookingSteps), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-stone-200 rounded-xl h-64" />
})

export function BookingSteps({ cottages }: { cottages: React.ComponentProps<typeof BookingStepsComponent>['cottages'] }) {
  return <BookingStepsClient cottages={cottages} />
}