import { useEffect, useState } from 'react'
import { listOrders, updateOrder, type Order, type OrderStatus } from '@/api/orders'
import ReplyModal from '@/components/ReplyModal'
import ReceiptSender from '@/components/ReceiptSender'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [replyTarget, setReplyTarget] = useState<Order | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = () => {
    setLoading(true)
    listOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      await updateOrder(orderId, { status })
      loadOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null)
      }
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">Commandes</h1>
          <p className="mt-2 text-muted">{orders.length} commandes au total</p>
        </div>
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
                  Total
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  WhatsApp
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-primary/5">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-primary">
                    {order.reference}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-primary">
                      {order.customer_name}
                    </div>
                    <div className="text-xs text-muted">{order.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {orderTypeLabel(order.order_type)}
                  </td>
                  <td className="px-6 py-4 font-medium text-primary">
                    {order.total.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {order.whatsapp_sent ? (
                      <span className="text-green-600">✓</span>
                    ) : order.whatsapp_error ? (
                      <span className="text-red-600" title={order.whatsapp_error}>
                        ✗
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-sm font-medium text-accent hover:text-accent-dark"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détail */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onReply={() => setReplyTarget(selectedOrder)}
        />
      )}

      {/* Répondre au client */}
      {replyTarget && (
        <ReplyModal
          kind="order"
          itemId={replyTarget.id}
          customerPhone={replyTarget.customer_phone}
          reference={replyTarget.reference}
          onClose={() => setReplyTarget(null)}
          onSuccess={() => loadOrders()}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles = {
    new: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-purple-100 text-purple-800',
    delivering: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-teal-100 text-teal-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const labels = {
    new: 'Nouvelle',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    ready: 'Prête',
    delivering: 'En livraison',
    delivered: 'Livrée',
    completed: 'Terminée',
    cancelled: 'Annulée',
  }

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onReply,
}: {
  order: Order
  onClose: () => void
  onStatusChange: (id: number, status: OrderStatus) => void
  onReply?: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/60 p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">
              Commande {order.reference}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {new Date(order.created_at).toLocaleString('fr-FR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-muted hover:text-primary"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Client */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="mb-2 font-semibold text-primary">Client</h3>
              <p className="text-sm text-muted">
                {order.customer_name} — {order.customer_phone}
              </p>
            </div>
            {onReply && (
              <button
                onClick={onReply}
                className="btn btn-gold px-4 py-2 text-sm"
              >
                💬 Répondre au client
              </button>
            )}
          </div>

          {/* Items */}
          <div>
            <h3 className="mb-2 font-semibold text-primary">Articles</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium text-primary">
                    {item.line_total.toLocaleString()} FCFA
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-primary/10 pt-3">
              <div className="flex justify-between font-semibold text-primary">
                <span>Total</span>
                <span>{order.total.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Livraison */}
          {order.order_type === 'delivery' && (
            <div>
              <h3 className="mb-2 font-semibold text-primary">Livraison</h3>
              <p className="text-sm text-muted">{order.delivery_address}</p>
              <p className="text-sm text-muted">Quartier : {order.delivery_district}</p>
              {order.courier_name && (
                <p className="text-sm text-muted">Livreur : {order.courier_name}</p>
              )}
            </div>
          )}

          {/* Changement statut */}
          <div>
            <h3 className="mb-2 font-semibold text-primary">Changer le statut</h3>
            <div className="flex flex-wrap gap-2">
              {(['confirmed', 'preparing', 'ready', 'completed'] as OrderStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(order.id, status)}
                    className="btn btn-primary text-sm"
                  >
                    {statusLabel(status)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Reçus WhatsApp */}
          <ReceiptSender kind="order" itemId={order.id} />
        </div>
      </div>
    </div>
  )
}

function orderTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    dine_in: 'Sur place',
    takeaway: 'À emporter',
    delivery: 'Livraison',
  }
  return labels[type] || type
}

function statusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    new: 'Nouvelle',
    confirmed: 'Confirmer',
    preparing: 'En préparation',
    ready: 'Prête',
    delivering: 'En livraison',
    delivered: 'Livrée',
    completed: 'Terminer',
    cancelled: 'Annuler',
  }
  return labels[status]
}
