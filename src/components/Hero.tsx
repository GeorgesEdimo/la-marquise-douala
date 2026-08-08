import { useSlideshow } from '@/hooks/useSlideshow'
import { useBooking } from '@/hooks/useBooking'

const SLIDES = [
  '/images/interieur-0.webp',
  '/images/exterieur-0.webp',
  '/images/pizza-marquise.webp',
  '/images/cocktail-strawberry.webp',
]

export default function Hero() {
  const current = useSlideshow(SLIDES.length)
  const { openReservation } = useBooking()

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Slideshow */}
      <div className="absolute inset-0">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className={[
              'absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-out-expo',
              i === current ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            style={{ backgroundImage: `url('${src}')` }}
            aria-hidden={i !== current}
          />
        ))}
      </div>

      {/* Subtle dark overlay — lets the image shine */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      {/* Content */}
      <div className="container-yard relative z-10 flex flex-col items-center text-center text-cream animate-fade-up">
        {/* Monogramme médaillon */}
        <div className="relative mb-8">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-accent/40 backdrop-blur-sm md:h-36 md:w-36">
            <span className="font-heading text-5xl font-bold text-accent md:text-6xl">LM</span>
          </div>
          {/* Ornements autour du médaillon */}
          <svg className="absolute -left-6 -top-6 h-[calc(100%+48px)] w-[calc(100%+48px)]" viewBox="0 0 200 200" fill="none" aria-hidden>
            <circle cx="100" cy="100" r="96" stroke="#c9a24b" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 8" />
          </svg>
        </div>

        {/* Titre — Playfair Display, style noble */}
        <h1 className="font-heading text-6xl font-bold leading-none md:text-[8rem]">
          <span className="block text-cream/90">La</span>
          <span className="block text-gradient-gold">Marquise</span>
        </h1>

        {/* Ligne dorée ornementale */}
        <div className="mt-8 flex items-center gap-4">
          <span className="h-px w-12 bg-accent/50" />
          <span className="text-accent">✦</span>
          <span className="h-px w-12 bg-accent/50" />
        </div>

        {/* Slogan — uppercase Montserrat */}
        <p className="mt-6 font-accent text-sm uppercase tracking-noblesse text-cream/70">
          Eat • Enjoy • Win
        </p>

        {/* Sous-titre */}
        <p className="mt-4 max-w-lg font-heading text-xl italic text-cream/50">
          Fast-Food & Fine Dining · Playing Area · Cocktail Bar
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button type="button" onClick={openReservation} className="btn btn-gold btn-lg">
            Réserver une table
          </button>
          <a href="#menu" className="btn btn-outline btn-lg text-cream">
            Découvrir la Carte
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-cream/40 transition-colors hover:text-accent"
        aria-label="Défiler vers le bas"
      >
        <span className="text-[10px] font-accent uppercase tracking-[0.3em]">Découvrir</span>
        <svg className="h-4 w-4 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14m-6-6l6 6 6-6" />
        </svg>
      </a>
    </section>
  )
}
