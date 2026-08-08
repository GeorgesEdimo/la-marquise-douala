// Briques partagées par les modales publiques (réservation, événement, commande).

import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-md border border-primary/20 bg-white px-4 py-2.5 text-primary transition-colors focus:border-accent focus:outline-none'

export function ModalShell({
  children,
  onClose,
  titleId,
  wide = false,
}: {
  children: ReactNode
  onClose: () => void
  titleId: string
  wide?: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className={[
          'max-h-[90vh] w-full overflow-y-auto rounded-lg bg-cream p-8 shadow-soft-lg',
          wide ? 'max-w-2xl' : 'max-w-lg',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-accent text-sm font-medium text-primary">
        {label}
      </label>
      {children}
    </div>
  )
}

export function SuccessPanel({
  titleId,
  title,
  reference,
  message,
  whatsappUrl,
  whatsappLabel,
  onClose,
}: {
  titleId: string
  title: string
  reference: string
  message: string
  whatsappUrl: string | null
  whatsappLabel: string
  onClose: () => void
}) {
  return (
    <div className="text-center">
      <span className="text-5xl" aria-hidden>
        ✅
      </span>
      <h2 id={titleId} className="mt-4 font-heading text-3xl text-primary">
        {title}
      </h2>
      <p className="mt-3 text-muted">
        Votre référence : <strong className="text-primary">{reference}</strong>
        <br />
        {message}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
            {whatsappLabel}
          </a>
        )}
        <button type="button" onClick={onClose} className="btn btn-outline text-primary">
          Fermer
        </button>
      </div>
    </div>
  )
}
