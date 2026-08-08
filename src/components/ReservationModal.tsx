// Modale de réservation de table — enregistre via l'API et propose l'envoi WhatsApp.

import { useState } from 'react'
import { createReservation } from '@/api/reservations'
import { CONTACT } from '@/data/hours'
import { Field, inputClass, ModalShell, SuccessPanel } from '@/components/ModalKit'

interface Props {
  onClose: () => void
}

export default function ReservationModal({ onClose }: Props) {
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    reservation_date: '',
    reservation_time: '19:30',
    party_size: 2,
    special_requests: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ reference: string; whatsappUrl: string | null } | null>(
    null
  )

  const today = new Date().toISOString().slice(0, 10)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await createReservation({
        ...form,
        customer_email: form.customer_email || undefined,
        reservation_time: `${form.reservation_time}:00`,
        party_size: Number(form.party_size),
        special_requests: form.special_requests || undefined,
      })
      setResult({
        reference: response.reservation.reference,
        whatsappUrl: response.whatsapp_url,
      })
    } catch {
      setError(
        "La réservation n'a pas pu être enregistrée. Appelez-nous directement, nous prenons le relais."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell onClose={onClose} titleId="reservation-title">
      {result ? (
        <SuccessPanel
          titleId="reservation-title"
          title="Demande enregistrée"
          reference={result.reference}
          message="Nous vous confirmons la table par téléphone."
          whatsappUrl={result.whatsappUrl}
          whatsappLabel="💬 Confirmer sur WhatsApp"
          onClose={onClose}
        />
      ) : (
        <>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <span className="eyebrow">Réservation</span>
              <h2 id="reservation-title" className="mt-3 font-heading text-3xl text-primary">
                Réserver une table
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="text-3xl leading-none text-muted transition-colors hover:text-primary"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nom complet" htmlFor="res-name">
              <input
                id="res-name"
                required
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className={inputClass}
                placeholder="Votre nom"
              />
            </Field>

            <Field label="Téléphone" htmlFor="res-phone">
              <input
                id="res-phone"
                required
                type="tel"
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                className={inputClass}
                placeholder="+237 6 XX XX XX XX"
              />
            </Field>

            <Field label="Email (facultatif)" htmlFor="res-email">
              <input
                id="res-email"
                type="email"
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                className={inputClass}
                placeholder="vous@exemple.com"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" htmlFor="res-date">
                <input
                  id="res-date"
                  required
                  type="date"
                  min={today}
                  value={form.reservation_date}
                  onChange={(e) => setForm({ ...form, reservation_date: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Heure" htmlFor="res-time">
                <input
                  id="res-time"
                  required
                  type="time"
                  value={form.reservation_time}
                  onChange={(e) => setForm({ ...form, reservation_time: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Nombre de couverts" htmlFor="res-size">
              <input
                id="res-size"
                required
                type="number"
                min={1}
                max={50}
                value={form.party_size}
                onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>

            <Field label="Demande particulière (facultatif)" htmlFor="res-notes">
              <textarea
                id="res-notes"
                rows={2}
                value={form.special_requests}
                onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                className={inputClass}
                placeholder="Table en terrasse, anniversaire…"
              />
            </Field>

            {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-gold w-full disabled:opacity-60"
            >
              {submitting ? 'Envoi…' : 'Confirmer la réservation'}
            </button>

            <p className="text-center text-sm text-muted">
              ou appelez-nous au{' '}
              <a href={CONTACT.phoneHref} className="font-medium text-accent underline">
                {CONTACT.phone}
              </a>
            </p>
          </form>
        </>
      )}
    </ModalShell>
  )
}
