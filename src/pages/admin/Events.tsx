import { useEffect, useState } from 'react'
import {
  listEvents,
  updateEvent,
  type EventBooking,
  type EventStatus,
} from '@/api/events'
import ReplyModal from '@/components/ReplyModal'
import ReceiptSender from '@/components/ReceiptSender'

export default function Events() {
  const [events, setEvents] = useState<EventBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTarget, setReplyTarget] = useState<EventBooking | null>(null)
  const [receiptTarget, setReceiptTarget] = useState<EventBooking | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = () => {
    setLoading(true)
    listEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleStatusChange = async (id: number, status: EventStatus) => {
    try {
      await updateEvent(id, { status })
      loadEvents()
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
        <h1 className="font-heading text-4xl font-bold text-primary">Événements</h1>
        <p className="mt-2 text-muted">{events.length} événements au total</p>
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
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Invités
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Devis
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
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-primary/5">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-primary">
                    {event.reference}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-primary">
                      {event.customer_name}
                    </div>
                    <div className="text-xs text-muted">{event.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{event.event_type}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {new Date(event.event_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{event.guest_count}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-primary">
                      {event.quote_amount.toLocaleString()} FCFA
                    </div>
                    {event.balance_due > 0 && (
                      <div className="text-xs text-orange-600">
                        Reste : {event.balance_due.toLocaleString()} FCFA
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <EventStatusBadge status={event.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {event.status === 'quote' && (
                        <button
                          onClick={() =>
                            handleStatusChange(event.id, 'pending_deposit')
                          }
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Attente acompte
                        </button>
                      )}
                      {event.status === 'pending_deposit' && (
                        <button
                          onClick={() => handleStatusChange(event.id, 'confirmed')}
                          className="text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          Confirmer
                        </button>
                      )}
                      <button
                        onClick={() => setReplyTarget(event)}
                        className="text-sm font-medium text-accent hover:text-accent-dark"
                      >
                        💬 Répondre
                      </button>
                      <button
                        onClick={() => setReceiptTarget(receiptTarget?.id === event.id ? null : event)}
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

      {/* Reçus WhatsApp (affiche pour l'événement sélectionné) */}
      {receiptTarget && (
        <div className="mt-6">
          <ReceiptSender kind="event" itemId={receiptTarget.id} />
        </div>
      )}

      {/* Répondre au client */}
      {replyTarget && (
        <ReplyModal
          kind="event"
          itemId={replyTarget.id}
          customerPhone={replyTarget.customer_phone}
          reference={replyTarget.reference}
          onClose={() => setReplyTarget(null)}
          onSuccess={() => loadEvents()}
        />
      )}
    </div>
  )
}

function EventStatusBadge({ status }: { status: EventStatus }) {
  const styles = {
    quote: 'bg-blue-100 text-blue-800',
    pending_deposit: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-green-100 text-green-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const labels: Record<EventStatus, string> = {
    quote: 'Devis envoyé',
    pending_deposit: 'Acompte attendu',
    confirmed: 'Confirmé',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
  }

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
