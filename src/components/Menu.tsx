import { useEffect, useMemo, useState } from 'react'
import SectionHeader from './SectionHeader'
import FilterButton from './FilterButton'
import MenuCard from './MenuCard'
import FlipBook from './FlipBook'
import { useFilters } from '@/hooks/useFilters'
import { listMenuItems, type MenuItem as ApiMenuItem } from '@/api/menu'
import { menuItems as staticMenuItems, MENU_CATEGORIES } from '@/data/menuItems'
import type { MenuItem, MenuCategory } from '@/types/menu'

/** Transforme un plat API (number id) en plat public (string id). */
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

export default function Menu() {
  const { active, setActive, matches } = useFilters<MenuCategory>()
  const [cardOpen, setCardOpen] = useState(false)

  // Les données statiques servent de repli tant que l'API n'est pas disponible.
  const [items, setItems] = useState<MenuItem[]>(staticMenuItems)

  useEffect(() => {
    listMenuItems(true)
      .then((apiItems) => {
        if (apiItems.length > 0) setItems(apiItems.map(mapApiToPublic))
      })
      .catch(() => {
        /* API indisponible : on garde le menu statique. */
      })
  }, [])

  const visible = useMemo(() => items.filter((item) => matches(item.category)), [items, matches])

  return (
    <section id="menu" className="bg-cream-dark py-24 md:py-32">
      <div className="container-yard">
        <SectionHeader
          eyebrow="La Carte"
          title={
            <>
              Eat • Enjoy • <em className="text-gradient-gold not-italic">Win</em>
            </>
          }
          description="Fine dining, fast-food premium, cocktails et snacks — une carte variée pour tous les appétits, du déjeuner au dîner."
        />

        {/* Filters — now functional */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {MENU_CATEGORIES.map((cat) => (
            <FilterButton
              key={cat.value}
              label={cat.label}
              active={active === cat.value}
              onClick={() => setActive(cat.value)}
            />
          ))}
        </div>

        {/* Grid */}
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">Aucun plat dans cette catégorie pour le moment.</p>
        )}

        {/* CTA */}
        <div className="mt-14 flex flex-col items-center gap-6 text-center">
          <div className="rounded-lg bg-white px-8 py-4 shadow-soft">
            <span className="block font-accent text-xl font-semibold text-primary">
              6 000 — 16 000 FCFA
            </span>
            <span className="text-sm text-muted">prix moyen par personne</span>
          </div>
          <button type="button" onClick={() => setCardOpen(true)} className="btn btn-primary btn-lg">
            📖 Voir la Carte Complète
          </button>
          <p className="text-sm text-primary">🍽️ Formule buffet à volonté disponible · Remises Happy Hour</p>
        </div>
      </div>

      {cardOpen && <FlipBook onClose={() => setCardOpen(false)} />}
    </section>
  )
}
