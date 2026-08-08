export type GalleryCategory =
  | 'interieur'
  | 'terrasse'
  | 'plats'
  | 'cocktails'
  | 'evenements'

export interface GalleryImage {
  id: string
  src: string
  alt: string
  caption: string
  category: GalleryCategory
  /** grid emphasis for masonry layout */
  size?: 'wide' | 'tall' | 'default'
}
