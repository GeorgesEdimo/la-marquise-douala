import type { MenuItem } from '@/types/menu'
import { formatPrice } from '@/data/menuItems'
import { useApiMenu } from '@/hooks/useApiMenu'
import { useCart } from '@/hooks/useCart'

interface MenuCardProps {
  item: MenuItem
}

export default function MenuCard({ item }: MenuCardProps) {
  const { findByName } = useApiMenu()
  const { add } = useCart()

  const apiItem = findByName(item.name)

  const handleAdd = () => {
    if (!apiItem) return
    add({ menuItemId: apiItem.id, name: apiItem.name, price: apiItem.price })
  }

  return (
    <article className="group relative overflow-hidden rounded-md border border-accent/15 bg-white transition-all duration-300 ease-out-quart hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-card">
      {/* Fine ligne dorée supérieure */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-105"
        />
        {item.badge && (
          <span className="absolute left-0 top-4 rounded-r-full bg-primary-dark/85 px-4 py-1.5 font-accent text-[10px] font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
            {item.badge}
          </span>
        )}
        {/* Coin ornemental */}
        <span className="pointer-events-none absolute bottom-2 right-3 font-heading text-lg italic text-cream/0 transition-colors duration-300 group-hover:text-cream/70">
          La Marquise
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-xl font-bold leading-snug text-primary">{item.name}</h3>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{item.description}</p>

        <div className="mt-5 flex items-center justify-between border-t border-dashed border-accent/25 pt-4">
          <span className="font-accent text-base font-bold text-accent-dark">
            {formatPrice(item.price)}
          </span>
          {apiItem && (
            <button
              type="button"
              onClick={handleAdd}
              className="btn btn-gold btn-sm"
              aria-label={`Ajouter ${item.name} au panier`}
            >
              + Ajouter
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
