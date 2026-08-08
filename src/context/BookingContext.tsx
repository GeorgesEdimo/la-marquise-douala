// Pilote l'ouverture des modales publiques depuis n'importe quel bouton du site.

import { createContext, useMemo, useState, type ReactNode } from 'react'
import ReservationModal from '@/components/ReservationModal'
import EventModal from '@/components/EventModal'
import OrderModal from '@/components/OrderModal'

type ModalKind = 'reservation' | 'event' | 'order' | null

export interface BookingContextValue {
  openReservation: () => void
  openEvent: () => void
  openOrder: () => void
  close: () => void
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ModalKind>(null)

  const value = useMemo<BookingContextValue>(
    () => ({
      openReservation: () => setActive('reservation'),
      openEvent: () => setActive('event'),
      openOrder: () => setActive('order'),
      close: () => setActive(null),
    }),
    []
  )

  const close = () => setActive(null)

  return (
    <BookingContext.Provider value={value}>
      {children}
      {active === 'reservation' && <ReservationModal onClose={close} />}
      {active === 'event' && <EventModal onClose={close} />}
      {active === 'order' && <OrderModal onClose={close} />}
    </BookingContext.Provider>
  )
}

export { BookingContext }
