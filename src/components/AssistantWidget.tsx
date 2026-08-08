/**
 * Assistant virtuel La Marquise.
 *
 * Répond aux questions fréquentes (horaires, menu, localisation, réservation,
 * événements, commande) et guide l'utilisateur vers les bonnes actions.
 *
 * Pas d'API externe : moteur de reconnaissance d'intentions + base de
 * connaissances du restaurant (données réelles du site).
 */

import { useEffect, useRef, useState } from 'react'
import { openingHours, CONTACT } from '@/data/hours'
import { useBooking } from '@/hooks/useBooking'

/* ───────────────────────── Types ───────────────────────── */

interface ChatMessage {
  id: number
  from: 'bot' | 'user'
  text: string
  action?: AssistantAction
}

interface AssistantAction {
  label: string
  kind: 'reservation' | 'event' | 'order' | 'menu' | 'hours' | 'contact'
}

type Suggestion = { label: string; text: string }

/* ─────────────────── Connaissances & moteur ─────────────────── */

function todayHours(): string {
  const day = new Date().getDay()
  const found = openingHours.find((d) => d.dayIndex === day)
  return found ? found.hours : '12h00 – 00h00'
}

const SUGGESTIONS: Suggestion[] = [
  { label: '🕐 Horaires', text: 'Quels sont vos horaires ?' },
  { label: '📍 Localisation', text: "Où se trouve La Marquise ?" },
  { label: '🍽️ Menu & prix', text: 'Que propose le menu ?' },
  { label: '📅 Réserver une table', text: 'Je veux réserver une table' },
  { label: '🎉 Organiser un événement', text: 'Je veux organiser un anniversaire' },
  { label: '🛒 Commander', text: 'Je veux commander' },
]

interface Intent {
  pattern: RegExp
  reply: () => { text: string; action?: AssistantAction }
}

const intents: Intent[] = [
  {
    // Salutations
    pattern: /\b(bonjour|bonsoir|salut|hello|hi|coucou|hey)\b/i,
    reply: () => ({
      text: "Bonjour et bienvenue chez La Marquise ! 🥂 Je suis votre assistant virtuel. Je peux vous renseigner sur nos horaires, le menu, la réservation d'une table, l'organisation d'événements ou la commande. Comment puis-je vous aider ?",
    }),
  },
  {
    // Horaires
    pattern: /\b(horaires|horaire|ouvert|ouverture|ferm|heure.*ouvr|ouvr.*heure|à quelle heure|quelle heure)\b/i,
    reply: () => {
      const hours = todayHours()
      return {
        text: `🕐 Nous sommes ouverts aujourd'hui de ${hours}. Tous les jours : 12h00 – 00h00. Livraison disponible jusqu'à 23h30.`,
        action: { label: 'Voir les horaires', kind: 'hours' },
      }
    },
  },
  {
    // Localisation
    pattern: /\b(où|ou est|localis|adresse|venir|situé|située|accès|map|plan|chemin|quartier)\b/i,
    reply: () => ({
      text: `📍 La Marquise se trouve au ${CONTACT.address.street}, quartier ${CONTACT.address.district}, à ${CONTACT.address.city}.`,
      action: { label: 'Itinéraire Google Maps', kind: 'contact' },
    }),
  },
  {
    // Contact / téléphone
    pattern: /\b(téléphone|telephone|numéro|numero|appel|appeler|contact|joindre|whatsapp|sms)\b/i,
    reply: () => ({
      text: `📞 Vous pouvez nous joindre au ${CONTACT.phone} (appel ou WhatsApp). Notre équipe répond rapidement pour toute demande.`,
      action: { label: 'Nous appeler', kind: 'contact' },
    }),
  },
  {
    // Menu
    pattern: /\b(menu|carte|plat|boisson|manger|manger|cocktail|dessert|burger|prix|tarif|frais)\b/i,
    reply: () => ({
      text: `🍽️ Notre carte propose entrées, salades, plats, fast-food, snacks, desserts, cocktails et boissons. Comptez environ 6 000 à 16 000 FCFA par personne. Découvrez la carte complète en un clic !`,
      action: { label: 'Découvrir la carte', kind: 'menu' },
    }),
  },
  {
    // Réservation table
    pattern: /\b(réserver.*table|reserver.*table|table|réservation|reservation|couvert|réserv.*(ce soir|demain|samedi)|disponibilit|table.*(ce soir|demain))\b/i,
    reply: () => ({
      text: `🪑 Bien sûr ! Réservez votre table en un instant : choisissez la date, l'heure et le nombre de couverts. Nous vous confirmons par téléphone.`,
      action: { label: 'Réserver une table', kind: 'reservation' },
    }),
  },
  {
    // Événements
    pattern: /\b(anniversaire|mariage|réunion|reunion|événement|evenement|event|séminaire|seminaire|privatis|fêter|feter|fête|fete|corporate|entreprise|groupe)\b/i,
    reply: () => ({
      text: `🎉 Parfait ! Nous organisons anniversaires, mariages, réunions, séminaires et privatisations. Salle principale, terrasse, espace de jeux ou privatisation complète. Indiquez-nous vos besoins et nous bâtissons un devis sur mesure.`,
      action: { label: 'Demander un devis événement', kind: 'event' },
    }),
  },
  {
    // Commande
    pattern: /\b(commander|commande|livraison|à emporter|a emporter|emporter|deliver|panier|takeaway|dine)\b/i,
    reply: () => ({
      text: `🛒 Vous pouvez commander sur place, à emporter ou en livraison. Choisissez vos plats et validez votre commande, on s'occupe du reste !`,
      action: { label: 'Commander maintenant', kind: 'order' },
    }),
  },
  {
    // Paiement
    pattern: /\b(payer|paiement|mobile money|mtn|orange|espèce|espece|carte|visa|mastercard|transfert|virement)\b/i,
    reply: () => ({
      text: `💳 Nous acceptons les espèces, le Mobile Money (MTN & Orange), les cartes bancaires et le virement. Règlement possible sur place ou à la commande.`,
    }),
  },
  {
    // Merci
    pattern: /\b(merci|thank|génial|genial|super|parfait|top|d'accord|ok)\b/i,
    reply: () => ({
      text: `Avec plaisir ! 😊 Si vous avez une autre question, je suis là. À très bientôt chez La Marquise !`,
    }),
  },
]

function findIntent(text: string): { text: string; action?: AssistantAction } {
  const lower = text.toLowerCase()
  for (const intent of intents) {
    if (intent.pattern.test(lower)) {
      return intent.reply()
    }
  }
  return {
    text: `Je n'ai pas tout compris, désolé ! 🤔 Je peux vous renseigner sur nos horaires, la localisation, le menu, la réservation de table, les événements ou la commande. Ou appelez-nous au ${CONTACT.phone}.`,
  }
}

/* ───────────────────────── Composant ───────────────────────── */

const INITIAL_MESSAGE: ChatMessage = {
  id: 0,
  from: 'bot',
  text: `Bonjour ! 👋 Je suis l'assistant de La Marquise. Horaires, menu, réservation, événements, commande… Je suis là pour vous aider.`,
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)
  const booking = useBooking()

  // Défilement automatique vers le dernier message.
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing, open])

  const push = (msg: Omit<ChatMessage, 'id'>) => {
    setMessages((prev) => [...prev, { ...msg, id: nextId.current++ }])
  }

  const reply = (text: string) => {
    setTyping(true)
    const result = findIntent(text)
    window.setTimeout(() => {
      setTyping(false)
      push({ from: 'bot', text: result.text, action: result.action })
    }, 600)
  }

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    push({ from: 'user', text: trimmed })
    setInput('')
    reply(trimmed)
  }

  const handleAction = (action: AssistantAction) => {
    switch (action.kind) {
      case 'reservation':
        booking.openReservation()
        break
      case 'event':
        booking.openEvent()
        break
      case 'order':
        booking.openOrder()
        break
      case 'menu':
        document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'hours':
        document.querySelector('#hours')?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'contact':
        window.open(CONTACT.mapsDirections, '_blank', 'noopener,noreferrer')
        break
    }
  }

  const buttonLabel = 'Assistant La Marquise'

  return (
    <>
      {/* Bouton flottant */}
      <button
        type="button"
        aria-label={buttonLabel}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-primary-dark text-xl text-accent shadow-lg shadow-gold transition-transform hover:scale-105"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Fenêtre de chat */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex max-h-[70vh] w-[92vw] max-w-sm flex-col overflow-hidden rounded-md border border-accent/15 bg-white shadow-2xl">
          {/* En-tête */}
          <div className="flex items-center gap-3 bg-primary-dark px-5 py-3 text-cream">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/30 bg-primary text-sm">
              LM
            </div>
            <div>
              <p className="text-sm font-semibold">Assistant La Marquise</p>
              <p className="text-[10px] uppercase tracking-luxe text-cream/60">Réponse instantanée · 24h/24</p>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={bodyRef}
            className="flex-1 space-y-3 overflow-y-auto bg-cream/40 px-3 py-4"
            style={{ minHeight: '280px' }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.from === 'bot' ? 'flex justify-start' : 'flex justify-end'}
              >
                <div
                  className={
                    msg.from === 'bot'
                      ? 'max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm text-primary shadow-sm'
                      : 'max-w-[85%] rounded-2xl rounded-tr-sm bg-accent px-3.5 py-2.5 text-sm text-primary-dark'
                  }
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  {msg.action && (
                    <button
                      type="button"
                      onClick={() => handleAction(msg.action!)}
                      className="mt-2 w-full rounded-lg bg-primary-dark px-3 py-2 text-center text-xs font-semibold text-cream transition-colors hover:bg-primary"
                    >
                      {msg.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 shadow-sm">
                  <span className="text-sm text-muted">…</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5 border-t border-primary/10 bg-white px-3 py-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => send(s.text)}
                className="rounded-full border border-accent/40 bg-accent/5 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/15"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Champ de saisie */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 border-t border-primary/10 bg-white px-3 py-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre question…"
              className="flex-1 rounded-full border border-primary/20 bg-cream/50 px-4 py-2 text-sm text-primary outline-none focus:border-accent"
            />
            <button
              type="submit"
              aria-label="Envoyer"
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary-dark transition-colors hover:bg-accent-dark disabled:opacity-40"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}
