import SectionHeader from './SectionHeader'
import { CONTACT } from '@/data/hours'
import { useBooking } from '@/hooks/useBooking'

const CARDS = [
  {
    icon: '📞',
    title: 'Téléphone',
    value: CONTACT.phone,
    href: CONTACT.phoneHref,
    sub: 'Appel & WhatsApp',
  },
  {
    icon: '💬',
    title: 'Réservations',
    value: CONTACT.phoneReservations,
    href: CONTACT.phoneReservationsHref,
    sub: 'Réservation de table & événements',
  },
  {
    icon: '📸',
    title: 'Instagram',
    value: CONTACT.instagramHandle,
    href: CONTACT.instagram,
    sub: 'Photos, vidéos & actualités',
    external: true,
  },
  {
    icon: '⭐',
    title: 'TripAdvisor',
    value: 'Voir les avis',
    href: CONTACT.tripadvisor,
    sub: 'Partagez votre expérience',
    external: true,
  },
]

export default function Contact() {
  const { openReservation, openEvent, openOrder } = useBooking()

  return (
    <section id="contact" className="relative overflow-hidden py-24 md:py-32">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/exterieur-1.webp')" }}
      />
      <div className="absolute inset-0 bg-primary-dark/70 backdrop-blur-[2px]" />

      <div className="container-yard relative z-10">
        <SectionHeader
          light
          eyebrow="Réservation"
          title={
            <>
              Réservez Votre <em className="text-gradient-gold not-italic">Expérience</em>
            </>
          }
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {CARDS.map((card) => (
            <a
              key={card.title}
              href={card.href}
              target={card.external ? '_blank' : undefined}
              rel={card.external ? 'noopener noreferrer' : undefined}
              className="glass-card-dark group flex flex-col items-center p-8 text-center text-cream transition-all duration-300 ease-out-quart hover:-translate-y-1.5 hover:border-accent/40"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 text-2xl transition-all duration-300 group-hover:bg-accent/10">
                <span aria-hidden>{card.icon}</span>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold">{card.title}</h3>
              <span className="mt-2 font-accent text-base font-semibold text-accent">{card.value}</span>
              <p className="mt-1 text-sm text-cream/60">{card.sub}</p>
            </a>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
          <button type="button" onClick={openReservation} className="btn btn-gold btn-lg">
            Réserver une table
          </button>
          <button type="button" onClick={openEvent} className="btn btn-outline btn-lg text-cream">
            🎉 Réserver un événement
          </button>
          <button type="button" onClick={openOrder} className="btn btn-outline btn-lg text-cream">
            🛒 Commander
          </button>
        </div>
      </div>
    </section>
  )
}
