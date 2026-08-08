/** Page dashboard : retours clients reçus via les QR codes. */

import { useEffect, useState } from 'react'
import { listFeedbacks, type Feedback } from '@/api/feedback'

const KIND_LABELS: Record<string, string> = {
  order: 'Commande',
  reservation: 'Réservation',
  event: 'Événement',
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-muted">—</span>
  return (
    <span className="text-accent">
      {'★'.repeat(rating)}
      <span className="text-primary/20">{'☆'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'order' | 'reservation' | 'event'>('all')

  useEffect(() => {
    listFeedbacks()
      .then(setFeedbacks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const visible = filter === 'all' ? feedbacks : feedbacks.filter((f) => f.kind === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">Retours clients</h1>
          <p className="mt-1 text-sm text-muted">
            {feedbacks.length} avis reçus via les QR codes
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'order', 'reservation', 'event'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-accent text-primary-dark'
                  : 'bg-white text-muted hover:bg-primary/5'
              }`}
            >
              {f === 'all' ? 'Tous' : KIND_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-primary/10 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Référence</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Note</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Commentaire</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  Aucun retour pour l'instant.
                </td>
              </tr>
            ) : (
              visible.map((fb) => (
                <tr key={fb.id} className="hover:bg-cream/30">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-primary">{fb.reference}</td>
                  <td className="px-4 py-3 text-sm text-muted">{KIND_LABELS[fb.kind] || fb.kind}</td>
                  <td className="px-4 py-3 text-sm text-muted">{fb.customer_name || fb.customer_phone}</td>
                  <td className="px-4 py-3"><Stars rating={fb.rating} /></td>
                  <td className="px-4 py-3 text-sm text-muted">{fb.comment || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(fb.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
