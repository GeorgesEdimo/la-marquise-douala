import { useCounter } from '@/hooks/useCounter'

const STATS = [
  { target: 30, plus: true, label: 'Cocktails' },
  { target: 15, plus: true, label: 'Spiritueux' },
  { target: 5, plus: false, label: 'Heures de Happy Hour' },
]

function Stat({ target, plus, label }: (typeof STATS)[number]) {
  const { ref, value } = useCounter(target)
  return (
    <div className="text-center">
      <div className="font-heading text-5xl font-bold text-accent md:text-6xl">
        <span ref={ref}>{value}</span>
        {plus && <span>+</span>}
      </div>
      <span className="mt-2 block font-accent text-[11px] font-semibold uppercase tracking-luxe text-cream/60">
        {label}
      </span>
    </div>
  )
}

export default function CocktailsBanner() {
  return (
    <section className="relative overflow-hidden py-28">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/interieur-1.webp')" }}
      />
      <div className="absolute inset-0 bg-primary-dark/65 backdrop-blur-[1px]" />

      <div className="container-yard relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div className="text-cream">
          <span className="font-accent text-[11px] font-semibold uppercase tracking-noblesse text-accent-dark">
            Le Bar à Cocktails
          </span>
          <h2 className="mt-5 font-heading text-4xl font-bold md:text-5xl">
            Happy Hour <em className="text-gradient-gold not-italic">& Cocktails</em>
          </h2>
          <div className="ornament mt-5 flex justify-start">
            <span className="text-accent text-sm">◆</span>
          </div>
          <p className="mt-5 max-w-md text-base leading-relaxed text-cream/70">
            Profitez de nos remises Happy Hour et laissez-vous tenter par des cocktails
            artisanaux, des smoothies fraîchement pressés et des boissons rafraîchissantes
            toute la journée.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {STATS.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
