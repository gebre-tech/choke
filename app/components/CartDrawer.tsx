'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Trash2, Loader2, Plus, Minus, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { FocusTrap } from '@/components/ui/design-system/FocusTrap'
import { generateId } from '@/lib/a11y'

type Stage = 'idle' | 'creating' | 'paying'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [emailError, setEmailError] = useState('')
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const emailId = generateId('cart-email')

  const handleQuantityChange = (itemId: string, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      removeItem(itemId)
      return
    }
    updateQuantity(itemId, nextQuantity)
  }

  const validateEmail = (value: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Enter a valid email')
      return false
    }
    setEmailError('')
    return true
  }

  const handleCheckout = async () => {
    if (!validateEmail(email)) return

    setStage('creating')
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: items.map((i) => ({ productId: i.productId || i.id, quantity: i.quantity })),
        }),
      })
      const order = await orderRes.json()
      if (!orderRes.ok) return toast.error(order.error || 'Could not create your order')

      setStage('paying')
      const payRes = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'order',
          entityId: order.orderId,
          email,
        }),
      })
      const pay = await payRes.json()
      if (!payRes.ok) return toast.error(pay.error || 'Could not start payment')

      if (pay.checkout_url) {
        clearCart()
        onClose()
        toast.success('Redirecting to secure payment…')
        window.location.href = pay.checkout_url
      } else {
        clearCart()
        onClose()
        toast.success(`Order created (ref ${order.orderId}). Complete your payment.`)
      }
    } catch {
      toast.error('Something went wrong — please try again')
    } finally {
      setStage('idle')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      setTimeout(() => drawerRef.current?.focus(), 0)
    } else {
      document.body.style.overflow = ''
      previousActiveElement.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <FocusTrap active={open} onDeactivate={onClose}>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="fixed right-0 top-0 h-full w-96 bg-white z-50 shadow-xl p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onKeyDown={handleKeyDown}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cart</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-stone-500 text-center py-8" aria-live="polite">Your cart is empty</p>
        ) : (
          <>
            <ul className="space-y-3" role="list" aria-label="Cart items">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3 border-b" role="listitem">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-emerald-600">ETB {item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1" role="group" aria-label={`Quantity for ${item.name}`}>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="border rounded w-8 h-8 flex items-center justify-center hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        aria-label={`Decrease quantity of ${item.name}`}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center" aria-live="polite">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="border rounded w-8 h-8 flex items-center justify-center hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        aria-label={`Increase quantity of ${item.name}`}
                        disabled={item.quantity >= item.maxStock}
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t space-y-3">
              <p className="text-xl font-bold" aria-live="polite">Total: ETB {total.toFixed(2)}</p>
              <Input
                id={emailId}
                type="email"
                label="Email for payment receipt"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                onBlur={(e) => validateEmail(e.target.value)}
                placeholder="you@example.com"
                required
                error={emailError}
                leadingIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
              />
              <Button
                onClick={handleCheckout}
                disabled={stage !== 'idle'}
                className="w-full mt-3"
                size="lg"
                loading={stage !== 'idle'}
                icon={stage !== 'idle' ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
              >
                {stage === 'idle' && 'Checkout'}
                {stage === 'creating' && 'Creating order…'}
                {stage === 'paying' && 'Redirecting…'}
              </Button>
              <Button
                variant="ghost"
                onClick={clearCart}
                className="w-full mt-2"
                size="sm"
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </div>
    </FocusTrap>
  )
}