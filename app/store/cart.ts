import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId?: string
  name: string
  price: number
  quantity: number
  maxStock: number
  imageUrl?: string
  category?: string
}

interface CartStore {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  isItemInCart: (id: string) => boolean
  getItemQuantity: (id: string) => number
}

const itemKey = (item: CartItem) => item.id || item.productId || ''

const recalculateTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (item) => {
        const key = itemKey(item)
        if (!key) return

        const existing = get().items.find((i) => itemKey(i) === key)
        let nextItems: CartItem[]

        if (existing) {
          const newQty = Math.min(existing.quantity + Math.max(item.quantity, 1), existing.maxStock || 99)
          nextItems = get().items.map((i) =>
            itemKey(i) === key ? { ...i, quantity: newQty } : i
          )
        } else {
          nextItems = [
            ...get().items,
            {
              ...item,
              id: item.id || key,
              productId: item.productId || key,
              quantity: Math.max(item.quantity, 1),
              maxStock: item.maxStock || 99,
            },
          ]
        }

        set({ items: nextItems, total: recalculateTotal(nextItems) })
      },

      removeItem: (id) => {
        const nextItems = get().items.filter((i) => itemKey(i) !== id && i.productId !== id)
        set({ items: nextItems, total: recalculateTotal(nextItems) })
      },

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id)
          return
        }
        const nextItems = get().items.map((i) =>
          itemKey(i) === id || i.productId === id
            ? { ...i, quantity: Math.min(qty, i.maxStock || 99) }
            : i
        )
        set({ items: nextItems, total: recalculateTotal(nextItems) })
      },

      clearCart: () => set({ items: [], total: 0 }),

      isItemInCart: (id) => get().items.some((i) => itemKey(i) === id || i.productId === id),

      getItemQuantity: (id) => {
        const item = get().items.find((i) => itemKey(i) === id || i.productId === id)
        return item ? item.quantity : 0
      },
    }),
    { name: 'choke-cart' }
  )
)