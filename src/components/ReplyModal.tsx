/** Composant réutilisable : répondre au client (modal + toast). */

import { useState } from 'react'
import { replyToCustomer, type ReplyResponse } from '@/api/replies'
import { ModalShell, inputClass } from '@/components/ModalKit'

type SubjectKind = 'order' | 'reservation' | 'event'

interface ReplyModalProps {
  /** Type de demande : 'order' | 'reservation' | 'event' */
  kind: SubjectKind
  /** ID de l'entité (commande, réservation, événement) */
  itemId: number
  /** Numéro de téléphone du client (pour l'affichage) */
  customerPhone: string
  /** Référence de l'entité (pour l'affichage) */
  reference: string
  /** Callback quand le modal se ferme (succès ou annulation) */
  onClose: () => void
  /** Callback optionnel après envoi réussi (ex: rafraîchir la liste) */
  onSuccess?: (result: ReplyResponse) => void
}

/** Labels français pour le type de demande. */
const KIND_LABELS: Record<SubjectKind, string> = {
  order: 'commande',
  reservation: 'réservation',
  event: 'événement',
}

export default function ReplyModal({
  kind,
  itemId,
  customerPhone,
  reference,
  onClose,
  onSuccess,
}: ReplyModalProps) {
  const [message, setMessage] = useState('')
  const [appendToNotes, setAppendToNotes] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReplyResponse | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const response = await replyToCustomer(kind, itemId, {
        message,
        append_to_notes: appendToNotes,
      })
      setResult(response)
      if (response.error) {
        setError(response.error)
      } else {
        onSuccess?.(response)
      }
    } catch (err) {
      setError("L'envoi a échoué. Vérifiez votre connexion.")
    } finally {
      setSending(false)
    }
  }

  if (result) {
    const success = result.sent && result.whatsapp_url === null
    return (
      <ModalShell onClose={onClose} titleId="reply-title">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <span className="eyebrow">Réponse envoyée</span>
            <h2 id="reply-title" className="mt-3 font-heading text-3xl text-primary">
              {success ? 'Message envoyé' : 'Lien WhatsApp généré'}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-3xl leading-none text-muted transition-colors hover:text-primary">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <p className={success ? 'text-green-700' : 'text-orange-700'}>
            {success
              ? `Le message a été envoyé au client au ${customerPhone}.`
              : `L'API WhatsApp n'est pas configurée. Un lien a été généré pour ouvrir la conversation manuellement.`}
          </p>

          {!success && result.whatsapp_url && (
            <a
              href={result.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              💬 Ouvrir WhatsApp
            </a>
          )}
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell onClose={onClose} titleId="reply-title" wide>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <span className="eyebrow">Répondre au client</span>
          <h2 id="reply-title" className="mt-3 font-heading text-3xl text-primary">
            Répondre à la {KIND_LABELS[kind]} <span className="font-mono">{reference}</span>
          </h2>
          <p className="mt-1 text-sm text-muted">Client : {customerPhone}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer" className="text-3xl leading-none text-muted transition-colors hover:text-primary">
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-primary">Message</span>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputClass}
            placeholder="Tapez votre réponse au client…"
            disabled={sending}
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={appendToNotes}
            onChange={(e) => setAppendToNotes(e.target.checked)}
            className="h-4 w-4 rounded border-primary/30 text-accent focus:ring-accent"
          />
          <span className="text-sm text-muted">Ajouter ce message aux notes internes</span>
        </label>

        {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-outline" disabled={sending}>
            Annuler
          </button>
          <button type="submit" disabled={sending || !message.trim()} className="btn btn-gold disabled:opacity-60">
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}