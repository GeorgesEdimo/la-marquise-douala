import SectionHeader from './SectionHeader'
import { openingHours, CONTACT } from '@/data/hours'

export default function HoursLocation() {
  const today = new Date().getDay()

  return (
    <section id="hours" className="bg-cream-dark py-24 md:py-32">
      <div className="container-yard">
        <SectionHeader
          eyebrow="Pratique"
          title={
            <>
              Horaires & <em className="text-gradient-gold not-italic">Localisation</em>
            </>
          }
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Hours — cartes raffinées */}
          <div className="glass-card overflow-hidden p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40">
                <span className="text-sm">🕒</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-primary">Horaires d'Ouverture</h3>
            </div>

            <ul className="divide-y divide-accent/15">
              {openingHours.map((day) => {
                const isToday = day.dayIndex === today
                return (
                  <li
                    key={day.label}
                    className={[
                      'flex items-center justify-between gap-3 rounded-sm px-4 py-3 text-sm transition-colors',
                      isToday ? 'bg-accent/10 font-semibold' : 'hover:bg-white/60',
                    ].join(' ')}
                  >
                    <span className={isToday ? 'font-semibold text-accent-dark' : 'text-ink'}>
                      {day.label}
                      {isToday && <span className="ml-1 text-accent">•</span>}
                    </span>
                    <span className="text-muted">{day.hours}</span>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 rounded-sm bg-accent/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-luxe text-primary">
                🛵 Livraison disponible jusqu'à 23h30
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="glass-card overflow-hidden">
            <div className="p-8 pb-0">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40">
                  <span className="text-sm">📍</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-primary">Nous Trouver</h3>
              </div>
              <address className="mb-5 not-italic leading-relaxed text-muted">
                <strong className="text-ink">{CONTACT.address.street}</strong>
                <br />
                {CONTACT.address.district}
                <br />
                {CONTACT.address.city}
              </address>
            </div>
            <div className="overflow-hidden">
              <iframe
                src={CONTACT.mapsEmbed}
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation La Marquise Restaurant Douala"
              />
            </div>
            <div className="p-8 pt-0">
              <a
                href={CONTACT.mapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline w-full border-primary text-primary hover:bg-primary hover:text-cream"
              >
                🗺️ Itinéraire Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
