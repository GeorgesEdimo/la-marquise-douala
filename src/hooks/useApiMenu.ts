// Charge le menu depuis l'API pour obtenir les vrais menu_item_id du panier.
// Les cartes publiques viennent de data/menuItems (statique) : on les relie par nom.

import { useEffect, useState } from 'react'
import { listMenuItems, type MenuItem as ApiMenuItem } from '@/api/menu'

const DIACRITICS = /[̀-ͯ]/g

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/[^a-z0-9]/g, '')
}

let cache: ApiMenuItem[] | null = null

export function useApiMenu() {
  const [items, setItems] = useState<ApiMenuItem[]>(cache ?? [])
  const [loading, setLoading] = useState(cache === null)

  useEffect(() => {
    if (cache !== null) return

    let active = true
    listMenuItems(true)
      .then((data) => {
        cache = data
        if (active) setItems(data)
      })
      .catch(() => {
        cache = []
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  /** Retrouve l'entrée API correspondant à un nom de plat, sinon undefined. */
  const findByName = (name: string): ApiMenuItem | undefined => {
    const target = normalize(name)
    return items.find((item) => normalize(item.name) === target)
  }

  return { items, loading, findByName }
}
