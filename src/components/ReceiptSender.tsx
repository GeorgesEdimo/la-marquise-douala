/**
 * Composant réutilisable : envoi de reçus au client (3 étapes).
 *
 * Utilisé dans Orders, Reservations, Events pages.
 * Affiche 3 boutons + le QR code généré.
 */

import { useState } from 'react'
import { sendReceipt, type ReceiptStage, type SendReceiptResponse, type SubjectKind } from '@/api/receipts'

const STAGE_CONFIG: Record<ReceiptStage, { label: string; icon: string; color: string }> = {
  created: { label: 'Demande reçue', icon: '📨', color: 'text-blue-600 hover:text-blue-700' },
  confirmed: { label: 'Confirmation', icon: '✅', color: 'text-green-600 hover:text-green-700' },
  completed: { label: 'Complétion', icon: '🎉', color: 'text-purple-600 hover:text-purple-700' },
}

interface Props {
  kind: SubjectKind
  itemId: number
  /** Stages déjà envoyés (pour désactiver les boutons correspondants). */
  sentStages?: ReceiptStage[]
}

export default function ReceiptSender({ kind, itemId, sentStages = [] }: Props) {
  const [sending, setSending] = useState<ReceiptStage | null>(null)
  const [lastResult, setLastResult] = useState<SendReceiptResponse | null>(null)
  const [error, setError] = useState('')

  const handleSend = async (stage: ReceiptStage) => {
    setSending(stage)
    setError('')
    try {
      const result = await sendReceipt(kind, itemId, stage)
      setLastResult(result)
    } catch {
      setError(`Échec de l'envoi « ${stage} »`)
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="rounded-lg border border-primary/10 bg-cream/50 p-4">
      <h4 className="mb-3 font-semibold text-primary">Reçus WhatsApp</h4>
      <div className="flex flex-wrap gap-2">
        {(['created', 'confirmed', 'completed'] as ReceiptStage[]).map((stage) => {
          const config = STAGE_CONFIG[stage]
          const alreadySent = sentStages.includes(stage)
          const isSending = sending === stage
          return (
            <button
              key={stage}
              onClick={() => handleSend(stage)}
              disabled={isSending || alreadySent}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                alreadySent
                  ? 'cursor-default bg-green-50 text-green-700'
                  : isSending
                    ? 'bg-primary/10 text-muted'
                    : `hover:bg-primary/5 ${config.color}`
              }`}
            >
              {alreadySent ? '✓' : config.icon} {config.label}
              {alreadySent ? ' envoyé' : isSending ? '…' : ''}
            </button>
          )
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {/* Dernier QR généré */}
      {lastResult && (
        <div className="mt-4 flex items-start gap-4 rounded-md bg-white p-3">
          <img
            src={`data:image/png;base64,${lastResult.qr_base64}`}
            alt="QR Code reçu"
            className="h-28 w-28 rounded-md border border-primary/10"
          />
          <div className="flex-1 text-sm text-muted">
            <p className="font-medium text-primary">Reçu « {lastResult.stage} » généré</p>
            <p className="mt-1 break-all text-xs">{lastResult.receipt_url}</p>
            {lastResult.whatsapp_url && (
              <a
                href={lastResult.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold mt-2 inline-flex items-center gap-1 text-sm"
              >
                💬 Envoyer sur WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
