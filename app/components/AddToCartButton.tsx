'use client'

import { useCartStore } from '@/store/cart'
import { useState } from 'react'

type CartProduct = {
  id: string
  productId: string
  name: string
  price: number
  category: string
  imageUrl?: string
  maxStock: number
  quantity?: number
}

export default function AddToCartButton({
  product,
  className = '',
}: {
  product: CartProduct
  className?: string
}) {
  const { addItem, isItemInCart, getItemQuantity } = useCartStore()
  const [added, setAdded] = useState(false)

  const inCart = isItemInCart(product.id)
  const quantity = getItemQuantity(product.id)

  const handleAdd = () => {
    addItem({ ...product, quantity: product.quantity ?? 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2">
      {inCart && (
        <span className="inline-block w-fit bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full">
          In cart: {quantity}
        </span>
      )}
      <button
        onClick={handleAdd}
        className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-full transition-colors ${className}`}
      >
        {added ? '✓ Added!' : 'Add to Cart'}
      </button>
    </div>
  )
}