/**
 * Page publique /receipt/{reference} — reçu client + formulaire de feedback.
 *
 * Pointée par le QR code : le client y découvre son reçu et peut noter son expérience.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getReceiptDetail, type ReceiptDetail } from '@/api/receipts'
import { submitFeedback, getFeedback, type Feedback } from '@/api/feedback'
import { CONTACT } from '@/data/hours'

const KIND_LABELS: Record<string, string> = {
  order: 'Commande',
  reservation: 'Réservation',
  event: 'Événement',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouvelle',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  delivering: 'En livraison',
  delivered: 'Livrée',
  completed: 'Terminée',
  cancelled: 'Annulée',
  pending: 'En attente',
  seated: 'Installé',
  no_show: 'Absent',
  quote: 'Devis envoyé',
  pending_deposit: 'Acompte attendu',
  in_progress: 'En cours',
}

function StarRating({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-3xl transition-colors ${
            n <= rating ? 'text-accent' : 'text-primary/20 hover:text-accent/50'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ReceiptPage() {
  const { reference } = useParams<{ reference: string }>()
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Formulaire
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!reference) return
    setLoading(true)
    Promise.all([
      getReceiptDetail(reference),
      getFeedback(reference).catch(() => null),
    ])
      .then(([r, fb]) => {
        setReceipt(r)
        setFeedback(fb)
      })
      .catch(() => setError('Référence introuvable ou serveur indisponible.'))
      .finally(() => setLoading(false))
  }, [reference])

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fb = await submitFeedback(reference!, { rating: rating || null, comment })
      setFeedback(fb)
      setSubmitted(true)
    } catch {
      setError('Une erreur est survenue lors de l\'envoi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error && !receipt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <p className="text-lg text-muted">{error}</p>
          <a href="/" className="btn btn-primary mt-4 inline-block">Retour à l'accueil</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-dark py-12">
      <div className="mx-auto max-w-lg px-4">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <img src="/images/logo_lamarquise_transparent.svg" alt="La Marquise" className="mx-auto mb-4 h-16 w-auto" />
          <h1 className="font-heading text-3xl font-bold text-primary">
            {KIND_LABELS[receipt!.kind]} {receipt!.reference}
          </h1>
          <p className="mt-1 text-sm text-muted">Statut : {STATUS_LABELS[receipt!.status] || receipt!.status}</p>
        </div>

        {/* QR + détails */}
        <div className="mb-8 rounded-xl border border-primary/10 bg-white p-6 shadow-soft">
          <div className="flex items-start gap-5">
            <img
              src={`data:image/png;base64,${receipt!.qr_base64}`}
              alt="QR Code reçu"
              className="h-32 w-32 shrink-0 rounded-lg border border-primary/10"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">{receipt!.customer_name}</p>
              {receipt!.date_info && <p className="mt-1 text-sm text-muted">{receipt!.date_info}</p>}
              {receipt!.items_summary && (
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-muted">{receipt!.items_summary}</pre>
              )}
              {receipt!.total && (
                <p className="mt-2 text-lg font-bold text-accent">{receipt!.total}</p>
              )}
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-soft">
          {feedback && !submitted ? (
            <div>
              <p className="text-sm text-muted">Merci ! Vous avez déjà laissé votre avis :</p>
              <div className="mt-2 flex items-center gap-2">
                {feedback.rating && (
                  <span className="text-accent">{'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}</span>
                )}
                {feedback.comment && <span className="text-sm text-muted">« {feedback.comment} »</span>}
              </div>
            </div>
          ) : submitted ? (
            <div className="text-center">
              <p className="text-xl text-primary">Merci pour votre retour ! 🙏</p>
              <p className="mt-2 text-sm text-muted">Vos commentaires nous aident à nous améliorer.</p>
            </div>
          ) : (
            <>
              <h2 className="mb-4 font-heading text-xl font-bold text-primary">Votre avis compte</h2>
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-muted">Note</p>
                  <StarRating rating={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">Commentaire (facultatif)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="Partagez votre expérience…"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-gold w-full disabled:opacity-60"
                >
                  {submitting ? 'Envoi…' : 'Envoyer mon avis'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted">
            La Marquise — {CONTACT.phone}
          </p>
          <a href="/" className="mt-2 text-xs text-accent hover:underline">Retour au site</a>
        </div>
      </div>
    </div>
  )
}
