// Contexte panier — persiste dans localStorage, alimente le checkout commande.

import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface CartLine {
  menuItemId: number
  name: string
  price: number
  quantity: number
}

export interface CartContextValue {
  lines: CartLine[]
  count: number
  total: number
  add: (item: { menuItemId: number; name: string; price: number }) => void
  setQuantity: (menuItemId: number, quantity: number) => void
  remove: (menuItemId: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEY = 'yard_cart'

function readStoredLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartLine[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStoredLines)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue['add'] = (item) =>
      setLines((prev) => {
        const existing = prev.find((l) => l.menuItemId === item.menuItemId)
        if (existing) {
          return prev.map((l) =>
            l.menuItemId === item.menuItemId ? { ...l, quantity: l.quantity + 1 } : l
          )
        }
        return [...prev, { ...item, quantity: 1 }]
      })

    const setQuantity: CartContextValue['setQuantity'] = (menuItemId, quantity) =>
      setLines((prev) =>
        quantity <= 0
          ? prev.filter((l) => l.menuItemId !== menuItemId)
          : prev.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l))
      )

    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      total: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      add,
      setQuantity,
      remove: (menuItemId) =>
        setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId)),
      clear: () => setLines([]),
    }
  }, [lines])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export { CartContext }
