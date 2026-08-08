import SectionHeader from './SectionHeader'
import { useReveal } from '@/hooks/useFilters'

const FEATURES = [
  { icon: '🍽️', title: 'Fine Dining', text: 'Une gastronomie raffinée et créative' },
  { icon: '🍹', title: 'Cocktail Bar', text: 'Des cocktails signatures et des happy hours' },
  { icon: '🎮', title: 'Playing Area', text: 'Un espace de jeux pour petits et grands' },
  { icon: '🍔', title: 'Fast-Food Premium', text: 'Snacks et burgers généreux, toute la journée' },
]

export default function About() {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section id="about" className="relative bg-cream py-24 md:py-32">
      {/* Fine bordure décorative en haut */}
      <div className="absolute inset-x-0 top-0 flex justify-center">
        <div className="h-px w-40 bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      </div>

      <div className="container-yard">
        <SectionHeader
          eyebrow="Bienvenue à La Marquise"
          title={
            <>
              L'Art de Recevoir <em className="text-gradient-gold not-italic">à la Marquise</em>
            </>
          }
        />

        <div
          ref={ref}
          className={[
            'grid items-center gap-14 lg:grid-cols-2',
            visible ? 'animate-fade-up' : 'opacity-0',
          ].join(' ')}
        >
          {/* Images — avec cadres dorés */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 relative">
                <img
                  src="/images/interieur-0.webp"
                  alt="L'intérieur raffiné de La Marquise"
                  loading="lazy"
                  className="h-72 w-full rounded-lg border border-accent/25 object-cover shadow-soft"
                />
                <div className="pointer-events-none absolute inset-3 rounded-md border border-accent/25" />
              </div>
              <div className="relative">
                <img
                  src="/images/cocktail-strawberry.webp"
                  alt="Un cocktail signature de La Marquise"
                  loading="lazy"
                  className="h-48 w-full rounded-lg border border-accent/25 object-cover shadow-soft"
                />
                <div className="pointer-events-none absolute inset-2 rounded-md border border-accent/20" />
              </div>
              <div className="relative">
                <img
                  src="/images/filet-mignon.webp"
                  alt="Un plat gourmand de La Marquise"
                  loading="lazy"
                  className="h-48 w-full rounded-lg border border-accent/25 object-cover shadow-soft"
                />
                <div className="pointer-events-none absolute inset-2 rounded-md border border-accent/20" />
              </div>
            </div>

            {/* Monogramme flottant */}
            <div className="absolute -bottom-8 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border border-accent/40 bg-primary-dark shadow-gold">
              <span className="font-heading text-xl font-bold text-accent">LM</span>
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="font-accent text-[11px] font-semibold uppercase tracking-noblesse text-accent-dark">
              Bonapriso · Douala
            </span>
            <p className="mt-4 font-heading text-2xl leading-relaxed text-ink md:text-3xl">
              Au cœur de <strong className="text-primary">Bonapriso</strong>, La Marquise est une
              adresse où l'on vient <em className="text-gradient-gold not-italic">manger, se détendre et s'amuser</em>.
            </p>
            <p className="mt-5 leading-relaxed text-muted">
              Notre formule « Eat • Enjoy • Win » vous promet une cuisine variée et savoureuse, des
              cocktails excellents, un cadre élégant et un espace de jeux pour toute la famille. Du
              déjeuner rapide au dîner raffiné, chacun y trouve son bonheur.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="group flex gap-4 rounded-md border border-transparent p-3 transition-colors duration-300 hover:border-accent/25 hover:bg-white/60">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/30 text-xl transition-all duration-300 group-hover:bg-accent/10">
                    {f.icon}
                  </span>
                  <div>
                    <h4 className="font-heading text-lg font-semibold text-primary">{f.title}</h4>
                    <p className="text-sm text-muted">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
