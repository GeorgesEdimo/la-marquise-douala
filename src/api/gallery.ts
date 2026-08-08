// API gallery : photos/vidéos.

import { apiDelete, apiGet, apiPatch, apiPost } from './client'

export type GalleryCategory =
  | 'interieur'
  | 'terrasse'
  | 'plats'
  | 'cocktails'
  | 'evenements'

export interface GalleryImage {
  id: number
  src: string
  alt: string
  caption: string
  category: GalleryCategory
  size: string
  is_published: boolean
  sort_order: number
}

export interface GalleryImageCreatePayload {
  src: string
  alt?: string
  caption?: string
  category: GalleryCategory
  size?: string
  is_published?: boolean
  sort_order?: number
}

export interface GalleryImageUpdatePayload {
  alt?: string
  caption?: string
  category?: GalleryCategory
  size?: string
  is_published?: boolean
  sort_order?: number
}

export async function listGalleryImages(published_only = false): Promise<GalleryImage[]> {
  const query = published_only ? '?published_only=true' : ''
  return apiGet<GalleryImage[]>(`/gallery${query}`)
}

export async function getGalleryImage(id: number): Promise<GalleryImage> {
  return apiGet<GalleryImage>(`/gallery/${id}`)
}

export async function createGalleryImage(
  payload: GalleryImageCreatePayload
): Promise<GalleryImage> {
  return apiPost<GalleryImage>('/gallery', payload)
}

export async function updateGalleryImage(
  id: number,
  payload: GalleryImageUpdatePayload
): Promise<GalleryImage> {
  return apiPatch<GalleryImage>(`/gallery/${id}`, payload)
}

export async function deleteGalleryImage(id: number): Promise<void> {
  return apiDelete(`/gallery/${id}`)
}
