// Modale de commande — panier, type de service, envoi API + WhatsApp.

import { useState } from 'react'
import { createOrder, type OrderType, type PaymentMethod } from '@/api/orders'
import { CONTACT } from '@/data/hours'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/data/menuItems'
import { Field, inputClass, ModalShell, SuccessPanel } from '@/components/ModalKit'

const ORDER_TYPES: { value: OrderType; label: string; hint: string }[] = [
  { value: 'dine_in', label: 'Sur place', hint: 'Vous mangez au restaurant' },
  { value: 'takeaway', label: 'À emporter', hint: 'Vous passez récupérer' },
  { value: 'delivery', label: 'Livraison', hint: 'On vous livre à Douala' },
]

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'card', label: 'Carte bancaire' },
]

interface Props {
  onClose: () => void
}

export default function OrderModal({ onClose }: Props) {
  const { lines, total, setQuantity, remove, clear } = useCart()
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    order_type: 'delivery' as OrderType,
    delivery_address: '',
    delivery_district: '',
    table_number: '',
    customer_notes: '',
    payment_method: 'cash' as PaymentMethod,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ reference: string; whatsappUrl: string | null } | null>(
    null
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lines.length === 0) {
      setError('Votre panier est vide — ajoutez au moins un plat depuis la carte.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const response = await createOrder({
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        order_type: form.order_type,
        payment_method: form.payment_method,
        customer_notes: form.customer_notes || undefined,
        delivery_address:
          form.order_type === 'delivery' ? form.delivery_address : undefined,
        delivery_district:
          form.order_type === 'delivery' ? form.delivery_district : undefined,
        table_number: form.order_type === 'dine_in' ? form.table_number || undefined : undefined,
        items: lines.map((l) => ({ menu_item_id: l.menuItemId, quantity: l.quantity })),
      })

      setResult({ reference: response.order.reference, whatsappUrl: response.whatsapp_url })
      clear()
    } catch {
      setError(
        "La commande n'a pas pu être enregistrée. Appelez-nous, nous la prenons directement."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell onClose={onClose} titleId="order-title" wide>
      {result ? (
        <SuccessPanel
          titleId="order-title"
          title="Commande transmise"
          reference={result.reference}
          message="La cuisine est prévenue. Nous vous rappelons pour confirmer le délai."
          whatsappUrl={result.whatsappUrl}
          whatsappLabel="💬 Envoyer sur WhatsApp"
          onClose={onClose}
        />
      ) : (
        <>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <span className="eyebrow">Commande</span>
              <h2 id="order-title" className="mt-3 font-heading text-3xl text-primary">
                Commander
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

          {/* Panier */}
          <div className="mb-6 rounded-md border border-primary/15 bg-white p-4">
            <h3 className="mb-3 font-accent text-sm font-semibold uppercase tracking-wide text-primary">
              Votre panier
            </h3>

            {lines.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">
                Panier vide — ajoutez des plats depuis la carte ci-dessous.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-primary/10">
                  {lines.map((line) => (
                    <li key={line.menuItemId} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-primary">{line.name}</p>
                        <p className="text-sm text-muted">{formatPrice(line.price)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}
                          aria-label={`Retirer un ${line.name}`}
                          className="h-8 w-8 rounded-full border border-primary/20 text-primary transition-colors hover:border-accent"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium text-primary">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                          aria-label={`Ajouter un ${line.name}`}
                          className="h-8 w-8 rounded-full border border-primary/20 text-primary transition-colors hover:border-accent"
                        >
                          +
                        </button>
                      </div>

                      <span className="w-28 text-right font-accent font-semibold text-primary">
                        {formatPrice(line.price * line.quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() => remove(line.menuItemId)}
                        aria-label={`Supprimer ${line.name}`}
                        className="text-muted transition-colors hover:text-red-600"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex items-center justify-between border-t border-primary/15 pt-3">
                  <span className="font-accent font-semibold text-primary">Total</span>
                  <span className="font-heading text-2xl text-primary">{formatPrice(total)}</span>
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type de service */}
            <fieldset>
              <legend className="mb-2 font-accent text-sm font-medium text-primary">
                Type de commande
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {ORDER_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={[
                      'cursor-pointer rounded-md border px-3 py-2.5 text-center transition-colors',
                      form.order_type === type.value
                        ? 'border-accent bg-accent/10'
                        : 'border-primary/20 bg-white hover:border-accent/50',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="order_type"
                      value={type.value}
                      checked={form.order_type === type.value}
                      onChange={() => setForm({ ...form, order_type: type.value })}
                      className="sr-only"
                    />
                    <span className="block font-accent text-sm font-medium text-primary">
                      {type.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">{type.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet" htmlFor="ord-name">
                <input
                  id="ord-name"
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className={inputClass}
                  placeholder="Votre nom"
                />
              </Field>

              <Field label="Téléphone" htmlFor="ord-phone">
                <input
                  id="ord-phone"
                  required
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className={inputClass}
                  placeholder="+237 6 XX XX XX XX"
                />
              </Field>
            </div>

            {form.order_type === 'delivery' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Adresse de livraison" htmlFor="ord-address">
                  <input
                    id="ord-address"
                    required
                    value={form.delivery_address}
                    onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                    className={inputClass}
                    placeholder="Rue, immeuble, repère"
                  />
                </Field>

                <Field label="Quartier" htmlFor="ord-district">
                  <input
                    id="ord-district"
                    required
                    value={form.delivery_district}
                    onChange={(e) => setForm({ ...form, delivery_district: e.target.value })}
                    className={inputClass}
                    placeholder="Bonapriso, Akwa…"
                  />
                </Field>
              </div>
            )}

            {form.order_type === 'dine_in' && (
              <Field label="Numéro de table (si vous le connaissez)" htmlFor="ord-table">
                <input
                  id="ord-table"
                  value={form.table_number}
                  onChange={(e) => setForm({ ...form, table_number: e.target.value })}
                  className={inputClass}
                  placeholder="Ex. 12"
                />
              </Field>
            )}

            <Field label="Moyen de paiement" htmlFor="ord-payment">
              <select
                id="ord-payment"
                value={form.payment_method}
                onChange={(e) =>
                  setForm({ ...form, payment_method: e.target.value as PaymentMethod })
                }
                className={inputClass}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Précisions (facultatif)" htmlFor="ord-notes">
              <textarea
                id="ord-notes"
                rows={2}
                value={form.customer_notes}
                onChange={(e) => setForm({ ...form, customer_notes: e.target.value })}
                className={inputClass}
                placeholder="Sans piment, cuisson à point…"
              />
            </Field>

            {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

            <button
              type="submit"
              disabled={submitting || lines.length === 0}
              className="btn btn-gold w-full disabled:opacity-60"
            >
              {submitting ? 'Envoi…' : `Commander — ${formatPrice(total)}`}
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
