export type MenuCategory =
  | 'entree'
  | 'salade'
  | 'burger'
  | 'plat'
  | 'snack'
  | 'dessert'
  | 'cocktail'
  | 'boisson'

export interface MenuItem {
  id: string
  name: string
  /** Nom / description en français */
  description: string
  price: number
  category: MenuCategory
  /** Optionnel : les plats sans photo s'affichent en carte texte */
  image?: string
  badge?: string
}

/** Entrée simple d'une carte des boissons (nom + prix, parfois prix au verre) */
export interface DrinkItem {
  name: string
  /** Appellation / précision affichée en petit */
  detail?: string
  price: number
  /** Prix au verre lorsque disponible */
  glassPrice?: number
}

export interface DrinkSection {
  id: string
  title: string
  subtitle?: string
  items: DrinkItem[]
}
