import { CONTACT } from '@/data/hours'

const NAV = [
  { href: '#about', label: 'Notre Histoire' },
  { href: '#menu', label: 'La Carte' },
  { href: '#gallery', label: 'Galerie' },
  { href: '#hours', label: 'Horaires' },
]

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-cream">
      {/* Fine ligne dorée supérieure */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="container-yard grid gap-10 py-16 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/40">
              <span className="font-heading text-lg font-bold text-accent">LM</span>
            </div>
            <span className="font-heading text-2xl font-bold text-gold">La Marquise</span>
          </div>
          <p className="mt-4 font-accent text-[11px] font-semibold uppercase tracking-noblesse text-cream/60">
            Restaurant · Bar · Cocktails
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
            {CONTACT.address.street}, {CONTACT.address.district}
            <br />
            {CONTACT.address.city}
          </p>
          <div className="mt-4 flex items-center gap-3 text-cream/40">
            <span className="h-px w-8 bg-accent/40" />
            <span className="text-xs">Eat • Enjoy • Win</span>
            <span className="h-px w-8 bg-accent/40" />
          </div>
        </div>

        {/* Nav */}
        <div>
          <h4 className="mb-5 font-accent text-[11px] font-bold uppercase tracking-noblesse text-accent">
            Navigation
          </h4>
          <ul className="space-y-3">
            {NAV.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm text-cream/70 transition-colors hover:text-accent">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-5 font-accent text-[11px] font-bold uppercase tracking-noblesse text-accent">
            Contact
          </h4>
          <ul className="space-y-3 text-sm text-cream/70">
            <li>
              <a href={CONTACT.phoneHref} className="transition-colors hover:text-accent">
                {CONTACT.phone}
              </a>
            </li>
            <li>
              <a href={CONTACT.phoneReservationsHref} className="transition-colors hover:text-accent">
                Réservations : {CONTACT.phoneReservations}
              </a>
            </li>
            <li>
              <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
                Instagram
              </a>
            </li>
            <li>
              <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
                Facebook
              </a>
            </li>
            <li>
              <a href={CONTACT.tripadvisor} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
                TripAdvisor
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 py-6">
        <div className="container-yard flex flex-col items-center justify-between gap-3 text-center md:flex-row">
          <p className="text-xs text-cream/50">
            © {new Date().getFullYear()} La Marquise Restaurant, Douala — Tous droits réservés
          </p>
          <p className="flex items-center gap-2 text-xs text-cream/40">
            <span>4,3 / 5</span>
            <span className="text-accent">★</span>
            <span>sur Google · plus de 680 avis</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
