// Modale de réservation d'événement — rubriques conditionnelles selon le type choisi.

import { useState } from 'react'
import { createEvent } from '@/api/events'
import { CONTACT } from '@/data/hours'
import { Field, inputClass, ModalShell, SuccessPanel } from '@/components/ModalKit'

/** Chaque type d'événement affiche ses propres rubriques et options. */
const EVENT_TYPES = [
  {
    value: 'anniversaire',
    label: '🎂 Anniversaire',
    /** Champ libre principal, adapté au contexte. */
    detailsLabel: 'Déroulé souhaité',
    detailsPlaceholder: 'Arrivée surprise, moment du gâteau, discours…',
    /** Rubrique spécifique affichée uniquement pour ce type. */
    extra: { key: 'honoree', label: "Personne fêtée & âge", placeholder: 'Ex. Sarah, 30 ans' },
    options: ['Gâteau personnalisé', 'DJ / musique', 'Photographe', 'Animation', 'Feux froids'],
  },
  {
    value: 'reunion',
    label: '💼 Réunion / séminaire',
    detailsLabel: 'Programme de la réunion',
    detailsPlaceholder: 'Horaires, pauses café, temps de présentation…',
    extra: { key: 'company', label: 'Société / service', placeholder: 'Ex. Direction commerciale' },
    options: [
      'Vidéoprojecteur',
      'Écran & sonorisation',
      'Paperboard',
      'Wi-Fi dédié',
      'Pauses café',
      'Disposition en U',
    ],
  },
  {
    value: 'mariage',
    label: '💍 Mariage / réception',
    detailsLabel: 'Vos souhaits pour la réception',
    detailsPlaceholder: 'Cérémonie, ouverture de bal, plan de table…',
    extra: { key: 'honoree', label: 'Nom des mariés', placeholder: 'Ex. Awa & Éric' },
    options: [
      'Décoration florale',
      'DJ / orchestre',
      'Photographe',
      'Pièce montée',
      'Cocktail de bienvenue',
      'Voiturier',
    ],
  },
  {
    value: 'corporate',
    label: '🏢 Événement corporate',
    detailsLabel: "Objectif de l'événement",
    detailsPlaceholder: 'Lancement produit, afterwork, remise de prix…',
    extra: { key: 'company', label: 'Société', placeholder: 'Ex. La Marquise SARL' },
    options: [
      'Sonorisation',
      'Vidéoprojecteur',
      'Signalétique / branding',
      'Photographe',
      'Cocktail dînatoire',
      'Voiturier',
    ],
  },
  {
    value: 'privatisation',
    label: '🔒 Privatisation',
    detailsLabel: 'Nature de la privatisation',
    detailsPlaceholder: 'Soirée privée, tournage, dîner exclusif…',
    extra: null,
    options: ['DJ / musique', 'Sécurité', 'Voiturier', 'Bar illimité', 'Décoration sur mesure'],
  },
  {
    value: 'autre',
    label: '✨ Autre',
    detailsLabel: 'Décrivez votre événement',
    detailsPlaceholder: 'Dites-nous tout ce qui compte pour vous…',
    extra: null,
    options: ['DJ / musique', 'Photographe', 'Décoration', 'Menu sur mesure'],
  },
] as const

const SPACES = [
  { value: 'salle-principale', label: 'Salle principale', hint: "À l'intérieur, jusqu'à 80 pers." },
  { value: 'terrasse', label: 'Terrasse', hint: 'En extérieur couvert, 50 pers.' },
  { value: 'espace-jeux', label: 'Espace de jeux', hint: 'Pour vos événements familiaux' },
  { value: 'lounge', label: 'Espace lounge', hint: 'Intimiste, 25 pers.' },
  { value: 'privatisation-totale', label: 'Tout le lieu', hint: 'Privatisation complète' },
  { value: 'chez-le-client', label: 'Chez vous', hint: 'Service traiteur à domicile' },
]

const CATERING_FORMULAS = [
  { value: 'cocktail-dinatoire', label: 'Cocktail dînatoire' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'service-table', label: 'Service à table' },
  { value: 'boissons-seules', label: 'Boissons uniquement' },
  { value: 'a-definir', label: 'À définir ensemble' },
]

interface Props {
  onClose: () => void
}

export default function EventModal({ onClose }: Props) {
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    event_type: 'anniversaire',
    event_date: '',
    start_time: '18:00',
    end_time: '',
    guest_count: 20,
    space: 'salle-principale',
    catering_formula: 'cocktail-dinatoire',
    decoration_theme: '',
    decoration_colors: '',
    dietary_notes: '',
    budget_estimate: '',
    details: '',
    extraValue: '',
  })
  const [options, setOptions] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ reference: string; whatsappUrl: string | null } | null>(
    null
  )

  const today = new Date().toISOString().slice(0, 10)
  const config = EVENT_TYPES.find((t) => t.value === form.event_type) ?? EVENT_TYPES[0]

  /** Changer de type réinitialise les options : elles diffèrent d'un type à l'autre. */
  const handleTypeChange = (value: string) => {
    setForm((prev) => ({ ...prev, event_type: value, extraValue: '' }))
    setOptions([])
  }

  const toggleOption = (option: string) =>
    setOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    // La rubrique spécifique au type est préfixée dans les détails, pour rester lisible au staff.
    const detailsParts = []
    if (config.extra && form.extraValue) {
      detailsParts.push(`${config.extra.label} : ${form.extraValue}`)
    }
    if (form.details) detailsParts.push(form.details)

    try {
      const response = await createEvent({
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email || undefined,
        event_type: form.event_type,
        event_date: form.event_date,
        start_time: `${form.start_time}:00`,
        end_time: form.end_time ? `${form.end_time}:00` : undefined,
        guest_count: Number(form.guest_count),
        space: form.space,
        catering_formula: form.catering_formula,
        decoration_theme: form.decoration_theme || undefined,
        decoration_colors: form.decoration_colors || undefined,
        dietary_notes: form.dietary_notes || undefined,
        budget_estimate: form.budget_estimate ? Number(form.budget_estimate) : undefined,
        options,
        details: detailsParts.join('\n') || undefined,
      })
      setResult({ reference: response.event.reference, whatsappUrl: response.whatsapp_url })
    } catch {
      setError(
        "La demande n'a pas pu être enregistrée. Appelez-nous, nous organisons tout avec vous."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell onClose={onClose} titleId="event-title" wide>
      {result ? (
        <SuccessPanel
          titleId="event-title"
          title="Demande envoyée"
          reference={result.reference}
          message="Notre équipe vous rappelle pour construire le devis."
          whatsappUrl={result.whatsappUrl}
          whatsappLabel="💬 En discuter sur WhatsApp"
          onClose={onClose}
        />
      ) : (
        <>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <span className="eyebrow">Événements</span>
              <h2 id="event-title" className="mt-3 font-heading text-3xl text-primary">
                Réserver pour un événement
              </h2>
              <p className="mt-1 text-sm text-muted">
                Anniversaire, réunion, mariage — on adapte le lieu à votre occasion.
              </p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Type d'événement — pilote les rubriques suivantes */}
            <fieldset>
              <legend className="mb-2 font-accent text-sm font-medium text-primary">
                Type d'événement
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {EVENT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={[
                      'cursor-pointer rounded-md border px-3 py-2.5 text-center text-sm transition-colors',
                      form.event_type === type.value
                        ? 'border-accent bg-accent/10 font-medium text-primary'
                        : 'border-primary/20 bg-white text-muted hover:border-accent/50',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="event_type"
                      value={type.value}
                      checked={form.event_type === type.value}
                      onChange={() => handleTypeChange(type.value)}
                      className="sr-only"
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 2. Coordonnées */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet" htmlFor="ev-name">
                <input
                  id="ev-name"
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className={inputClass}
                  placeholder="Votre nom ou société"
                />
              </Field>

              <Field label="Téléphone" htmlFor="ev-phone">
                <input
                  id="ev-phone"
                  required
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className={inputClass}
                  placeholder="+237 6 XX XX XX XX"
                />
              </Field>
            </div>

            <Field label="Email (facultatif)" htmlFor="ev-email">
              <input
                id="ev-email"
                type="email"
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                className={inputClass}
                placeholder="vous@exemple.com"
              />
            </Field>

            {/* Rubrique conditionnelle propre au type choisi */}
            {config.extra && (
              <Field label={config.extra.label} htmlFor="ev-extra">
                <input
                  id="ev-extra"
                  value={form.extraValue}
                  onChange={(e) => setForm({ ...form, extraValue: e.target.value })}
                  className={inputClass}
                  placeholder={config.extra.placeholder}
                />
              </Field>
            )}

            {/* 3. Quand & combien */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" htmlFor="ev-date">
                <input
                  id="ev-date"
                  required
                  type="date"
                  min={today}
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Nombre d'invités" htmlFor="ev-guests">
                <input
                  id="ev-guests"
                  required
                  type="number"
                  min={1}
                  max={500}
                  value={form.guest_count}
                  onChange={(e) => setForm({ ...form, guest_count: Number(e.target.value) })}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heure de début" htmlFor="ev-start">
                <input
                  id="ev-start"
                  required
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Heure de fin (facultatif)" htmlFor="ev-end">
                <input
                  id="ev-end"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>

            {/* 4. La pièce choisie */}
            <fieldset>
              <legend className="mb-2 font-accent text-sm font-medium text-primary">
                Espace souhaité
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {SPACES.map((space) => (
                  <label
                    key={space.value}
                    className={[
                      'cursor-pointer rounded-md border px-3 py-2.5 text-center transition-colors',
                      form.space === space.value
                        ? 'border-accent bg-accent/10'
                        : 'border-primary/20 bg-white hover:border-accent/50',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="space"
                      value={space.value}
                      checked={form.space === space.value}
                      onChange={() => setForm({ ...form, space: space.value })}
                      className="sr-only"
                    />
                    <span className="block font-accent text-sm font-medium text-primary">
                      {space.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">{space.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 5. Décoration */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Thème de décoration (facultatif)" htmlFor="ev-theme">
                <input
                  id="ev-theme"
                  value={form.decoration_theme}
                  onChange={(e) => setForm({ ...form, decoration_theme: e.target.value })}
                  className={inputClass}
                  placeholder="Tropical, chic, années 80…"
                />
              </Field>

              <Field label="Couleurs souhaitées (facultatif)" htmlFor="ev-colors">
                <input
                  id="ev-colors"
                  value={form.decoration_colors}
                  onChange={(e) => setForm({ ...form, decoration_colors: e.target.value })}
                  className={inputClass}
                  placeholder="Or & blanc, bleu nuit…"
                />
              </Field>
            </div>

            {/* 6. Formule repas */}
            <Field label="Formule repas" htmlFor="ev-catering">
              <select
                id="ev-catering"
                value={form.catering_formula}
                onChange={(e) => setForm({ ...form, catering_formula: e.target.value })}
                className={inputClass}
              >
                {CATERING_FORMULAS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>

            {/* 7. Options — dépendent du type d'événement */}
            <fieldset>
              <legend className="mb-2 font-accent text-sm font-medium text-primary">
                Prestations souhaitées
              </legend>
              <div className="flex flex-wrap gap-2">
                {config.options.map((option) => (
                  <label
                    key={option}
                    className={[
                      'cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors',
                      options.includes(option)
                        ? 'border-accent bg-accent text-primary-dark'
                        : 'border-primary/20 bg-white text-muted hover:border-accent/50',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={options.includes(option)}
                      onChange={() => toggleOption(option)}
                      className="sr-only"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Allergies / régimes (facultatif)" htmlFor="ev-dietary">
              <input
                id="ev-dietary"
                value={form.dietary_notes}
                onChange={(e) => setForm({ ...form, dietary_notes: e.target.value })}
                className={inputClass}
                placeholder="Végétarien, sans porc, allergie arachide…"
              />
            </Field>

            <Field label="Budget indicatif en FCFA (facultatif)" htmlFor="ev-budget">
              <input
                id="ev-budget"
                type="number"
                min={0}
                step={50000}
                value={form.budget_estimate}
                onChange={(e) => setForm({ ...form, budget_estimate: e.target.value })}
                className={inputClass}
                placeholder="Ex. 1 500 000"
              />
            </Field>

            <Field label={config.detailsLabel} htmlFor="ev-details">
              <textarea
                id="ev-details"
                rows={3}
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                className={inputClass}
                placeholder={config.detailsPlaceholder}
              />
            </Field>

            {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-gold w-full disabled:opacity-60"
            >
              {submitting ? 'Envoi…' : 'Demander un devis'}
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
