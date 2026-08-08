import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { listMenuItems, type MenuItem as ApiMenuItem } from '@/api/menu'
import { menuItems as staticMenuItems } from '@/data/menuItems'
import { drinkSections } from '@/data/drinks'
import { useBooking } from '@/hooks/useBooking'
import type { MenuItem, MenuCategory } from '@/types/menu'

/* ─────────── Helpers ─────────── */

function priceLabel(n: number) {
  return `${n.toLocaleString('fr-FR')} CFA`
}

function mapApiToPublic(item: ApiMenuItem): MenuItem {
  return {
    id: String(item.id),
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    image: item.image ?? undefined,
    badge: item.badge ?? undefined,
  }
}

/* ─────────── Composants de rendu ─────────── */

function FoodSection({
  title,
  subtitle,
  cat,
  items,
}: {
  title: string
  subtitle?: string
  cat: MenuCategory
  items: MenuItem[]
}) {
  const filtered = items.filter((i) => i.category === cat)
  if (!filtered.length) return null
  return (
    <section className="mb-5">
      <h3 className="mb-2 border-b border-accent/40 pb-1 font-accent text-sm font-bold uppercase tracking-wider text-primary">
        {title}
        {subtitle && <em className="ml-2 font-normal normal-case text-muted">/ {subtitle}</em>}
      </h3>
      <ul>
        {filtered.map((item) => (
          <li key={item.id} className="mb-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold leading-snug text-primary">{item.name}</span>
              <span className="whitespace-nowrap font-accent text-xs font-bold text-accent-dark">
                {priceLabel(item.price)}
              </span>
            </div>
            <p className="text-[11px] leading-snug text-muted">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DrinkSection({ id }: { id: string }) {
  const section = drinkSections.find((s) => s.id === id)
  if (!section) return null
  return (
    <section className="mb-5">
      <h3 className="mb-2 border-b border-accent/40 pb-1 font-accent text-sm font-bold uppercase tracking-wider text-primary">
        {section.title}
        {section.subtitle && (
          <em className="ml-2 font-normal normal-case text-muted">/ {section.subtitle}</em>
        )}
      </h3>
      <ul>
        {section.items.map((item, i) => (
          <li key={`${item.name}-${i}`} className="mb-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-primary">{item.name}</span>
              <span className="whitespace-nowrap font-accent text-xs font-bold text-accent-dark">
                {item.glassPrice && (
                  <span className="mr-1 font-normal text-muted">{priceLabel(item.glassPrice)}</span>
                )}
                {item.price ? priceLabel(item.price) : 'Sur demande'}
              </span>
            </div>
            {item.detail && (
              <p className="text-[11px] leading-snug text-muted">{item.detail}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ─────────── Couvertures ─────────── */

const Cover = () => (
  <div className="flex h-full flex-col items-center justify-center bg-primary text-cream">
    <img src="/images/logo_lamarquise_transparent.svg" alt="La Marquise" className="mb-8 h-32 w-auto brightness-0 invert" />
    <div className="h-px w-20 bg-accent" />
    <h2 className="mt-6 font-heading text-5xl font-semibold">La Carte</h2>
    <p className="mt-3 font-accent text-xs uppercase tracking-[0.3em] text-cream/60">
      Fast-Food & Fine Dining · Cocktail Bar
    </p>
    <p className="mt-10 text-xs text-cream/40">Tournez la page →</p>
  </div>
)

const BackCover = () => {
  const { openReservation } = useBooking()
  return (
    <div className="flex h-full flex-col items-center justify-center bg-primary px-8 text-center text-cream">
      <img src="/images/logo_lamarquise_transparent.svg" alt="La Marquise" className="mb-6 h-24 w-auto brightness-0 invert" />
      <p className="font-heading text-2xl italic text-accent">Bon appétit</p>
      <div className="my-6 h-px w-16 bg-accent/50" />
      <p className="text-sm text-cream/70">Rue Tokoto, Bonapriso</p>
      <p className="text-sm text-cream/70">Douala, Cameroun</p>
      <p className="mt-2 text-xs text-cream/50">Eat • Enjoy • Win</p>
      <button type="button" onClick={openReservation} className="btn btn-gold mt-8">
        Réserver une table
      </button>
    </div>
  )
}

const Paper = ({ children, num }: { children?: ReactNode; num?: number }) => (
  <div className="flex h-full flex-col bg-[#fbfaf6] px-7 py-6">
    <div className="min-h-0 flex-1 overflow-y-auto pr-1 text-[13px]">{children}</div>
    {num !== undefined && (
      <span className="mt-2 shrink-0 text-center font-accent text-[10px] text-muted">{num}</span>
    )}
  </div>
)

/* ─────────── Construction automatique des pages ─────────── */

function buildPages(items: MenuItem[]): ReactNode[] {
  // Groupes de catégories alimentaires
  const FOOD_GROUPS: { title: string; subtitle?: string; cat: MenuCategory }[] = [
    { title: 'Starters & Entrées', subtitle: 'Apéritifs & Snacks', cat: 'entree' },
    { title: 'Salades', cat: 'salade' },
    { title: 'Burgers & Sandwiches', subtitle: 'Beef & Chicken', cat: 'burger' },
    { title: 'Plats Principaux', subtitle: 'Fine Dining & Pizza', cat: 'plat' },
    { title: 'Fried Chicken & Kids', subtitle: 'Snacks & Enfants', cat: 'snack' },
    { title: 'Desserts & Waffles', cat: 'dessert' },
  ]

  // Pages food : on répartit les catégories qui ont du contenu
  const foodPages: ReactNode[] = []
  for (const group of FOOD_GROUPS) {
    const count = items.filter((i) => i.category === group.cat).length
    if (count > 0) {
      foodPages.push(
        <FoodSection
          key={group.cat}
          title={group.title}
          subtitle={group.subtitle}
          cat={group.cat}
          items={items}
        />
      )
    }
  }

  // Répartir les sections food sur des pages (max 2 sections par page)
  const foodPaperPages: ReactNode[] = []
  for (let i = 0; i < foodPages.length; i += 2) {
    const chunk = foodPages.slice(i, i + 2)
    foodPaperPages.push(
      <Paper key={`food-${foodPaperPages.length}`} num={foodPaperPages.length + 1}>
        {chunk}
      </Paper>
    )
  }

  // Pages boissons : chaque section = une page
  const drinkPaperPages: ReactNode[] = []
  for (const section of drinkSections) {
    drinkPaperPages.push(
      <Paper key={`drink-${section.id}`} num={foodPaperPages.length + drinkPaperPages.length + 1}>
        <DrinkSection id={section.id} />
      </Paper>
    )
  }

  return [<Cover key="cover" />, ...foodPaperPages, ...drinkPaperPages, <BackCover key="back" />]
}

function buildSheets(pages: ReactNode[]) {
  const list = [...pages]
  if (list.length % 2 !== 0) list.push(<Paper key="blank" />)
  const sheets: { front: ReactNode; back: ReactNode }[] = []
  for (let i = 0; i < list.length; i += 2) {
    sheets.push({ front: list[i], back: list[i + 1] })
  }
  return sheets
}

/* ─────────── Composant principal ─────────── */

interface FlipBookProps {
  onClose: () => void
}

export default function FlipBook({ onClose }: FlipBookProps) {
  const [flipped, setFlipped] = useState(0)
  const [foodItems, setFoodItems] = useState<MenuItem[]>(staticMenuItems)

  useEffect(() => {
    listMenuItems(true)
      .then((apiItems) => {
        if (apiItems.length > 0) setFoodItems(apiItems.map(mapApiToPublic))
      })
      .catch(() => { /* API indisponible : données statiques. */ })
  }, [])

  const sheets = buildSheets(buildPages(foodItems))
  const total = sheets.length

  const next = () => setFlipped((f) => Math.min(f + 1, total))
  const prev = () => setFlipped((f) => Math.max(f - 1, 0))

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, total])

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="La carte complète de La Marquise"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer la carte"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-cream transition-colors hover:bg-white/20"
      >
        &times;
      </button>

      <div
        className="relative w-full max-w-[880px] [perspective:2200px]"
        style={{ height: 'min(78vh, 620px)' }}
      >
        <div className="absolute inset-y-0 left-0 hidden w-1/2 overflow-hidden rounded-l-md bg-[#fbfaf6] shadow-soft-lg md:block">
          {flipped > 0 && sheets[flipped - 1].back}
        </div>

        {sheets.map((sheet, k) => {
          const isFlipped = k < flipped
          return (
            <div
              key={k}
              className="absolute inset-y-0 right-0 w-full origin-left transition-transform duration-700 ease-out-expo [transform-style:preserve-3d] md:w-1/2"
              style={{
                transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                zIndex: isFlipped ? k : total - k,
                pointerEvents: k === flipped || k === flipped - 1 ? 'auto' : 'none',
              }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-r-md bg-[#fbfaf6] shadow-soft-lg [backface-visibility:hidden]">
                {sheet.front}
              </div>
              <div
                className="absolute inset-0 overflow-hidden rounded-l-md bg-[#fbfaf6] shadow-soft-lg [backface-visibility:hidden]"
                style={{ transform: 'rotateY(180deg)' }}
              >
                {sheet.back}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex items-center gap-6">
        <button
          type="button" onClick={prev} disabled={flipped === 0}
          aria-label="Page précédente"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl text-cream transition-colors hover:bg-white/20 disabled:opacity-30"
        >
          &#10094;
        </button>
        <span className="font-accent text-sm text-cream/70">
          {flipped} / {total}
        </span>
        <button
          type="button" onClick={next} disabled={flipped === total}
          aria-label="Page suivante"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl text-cream transition-colors hover:bg-white/20 disabled:opacity-30"
        >
          &#10095;
        </button>
      </div>
    </div>
  )
}
