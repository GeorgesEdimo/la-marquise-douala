import { useEffect, useState } from 'react'
import {
  listReservations,
  updateReservation,
  type Reservation,
  type ReservationStatus,
} from '@/api/reservations'
import ReplyModal from '@/components/ReplyModal'
import ReceiptSender from '@/components/ReceiptSender'

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTarget, setReplyTarget] = useState<Reservation | null>(null)
  const [receiptTarget, setReceiptTarget] = useState<Reservation | null>(null)

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = () => {
    setLoading(true)
    listReservations()
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleStatusChange = async (id: number, status: ReservationStatus) => {
    try {
      await updateReservation(id, { status })
      loadReservations()
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la mise à jour')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-primary">Réservations</h1>
        <p className="mt-2 text-muted">{reservations.length} réservations au total</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-primary/10 bg-primary/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Référence
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Heure
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Couverts
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-primary/5">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-primary">
                    {reservation.reference}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-primary">
                      {reservation.customer_name}
                    </div>
                    <div className="text-xs text-muted">{reservation.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {new Date(reservation.reservation_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {reservation.reservation_time}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {reservation.party_size}
                  </td>
                  <td className="px-6 py-4">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {reservation.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                          className="text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          Confirmer
                        </button>
                      )}
                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'seated')}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Installé
                        </button>
                      )}
                      <button
                        onClick={() => setReplyTarget(reservation)}
                        className="text-sm font-medium text-accent hover:text-accent-dark"
                      >
                        💬 Répondre
                      </button>
                      <button
                        onClick={() => setReceiptTarget(receiptTarget?.id === reservation.id ? null : reservation)}
                        className="text-sm font-medium text-accent hover:text-accent-dark"
                      >
                        📨 Reçus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reçus WhatsApp (affiche pour la réservation sélectionnée) */}
      {receiptTarget && (
        <div className="mt-6">
          <ReceiptSender kind="reservation" itemId={receiptTarget.id} />
        </div>
      )}

      {/* Répondre au client */}
      {replyTarget && (
        <ReplyModal
          kind="reservation"
          itemId={replyTarget.id}
          customerPhone={replyTarget.customer_phone}
          reference={replyTarget.reference}
          onClose={() => setReplyTarget(null)}
          onSuccess={() => loadReservations()}
        />
      )}
    </div>
  )
}

function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    seated: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800',
  }

  const labels: Record<ReservationStatus, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    seated: 'Installé',
    completed: 'Terminée',
    cancelled: 'Annulée',
    no_show: 'Absent',
  }

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
