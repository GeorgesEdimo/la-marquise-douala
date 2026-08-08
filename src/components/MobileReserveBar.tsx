import { useBooking } from '@/hooks/useBooking'
import { useCart } from '@/hooks/useCart'

/** Sticky reservation bar shown only on mobile. */
export default function MobileReserveBar() {
  const { openReservation, openEvent, openOrder } = useBooking()
  const { count } = useCart()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-accent/20 bg-primary-dark/95 p-3 backdrop-blur-md lg:hidden">
      <div className="flex gap-2">
        <button type="button" onClick={openReservation} className="btn btn-gold flex-1 px-3 text-[10px]">
          Table
        </button>
        <button type="button" onClick={openEvent} className="btn btn-outline flex-1 px-3 text-[10px] text-cream">
          🎉 Réserver
        </button>
        <button type="button" onClick={openOrder} className="btn btn-outline flex-1 px-3 text-[10px] text-cream">
          🛒 Commander{count > 0 ? ` (${count})` : ''}
        </button>
      </div>
    </div>
  )
}
