// API menu : plats, cocktails, boissons.

import { apiDelete, apiGet, apiPatch, apiPost } from './client'

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
  id: number
  slug: string
  name: string
  description: string
  price: number
  category: MenuCategory
  image: string | null
  badge: string | null
  is_available: boolean
  is_dish_of_day: boolean
  sort_order: number
}

export interface MenuItemCreatePayload {
  slug: string
  name: string
  description?: string
  price: number
  category: MenuCategory
  image?: string
  badge?: string
  is_available?: boolean
  is_dish_of_day?: boolean
  sort_order?: number
}

export interface MenuItemUpdatePayload {
  name?: string
  description?: string
  price?: number
  category?: MenuCategory
  image?: string
  badge?: string
  is_available?: boolean
  is_dish_of_day?: boolean
  sort_order?: number
}

export async function listMenuItems(available_only = false): Promise<MenuItem[]> {
  const query = available_only ? '?available_only=true' : ''
  return apiGet<MenuItem[]>(`/menu${query}`)
}

export async function getMenuItem(id: number): Promise<MenuItem> {
  return apiGet<MenuItem>(`/menu/${id}`)
}

export async function createMenuItem(payload: MenuItemCreatePayload): Promise<MenuItem> {
  return apiPost<MenuItem>('/menu', payload)
}

export async function updateMenuItem(
  id: number,
  payload: MenuItemUpdatePayload
): Promise<MenuItem> {
  return apiPatch<MenuItem>(`/menu/${id}`, payload)
}

export async function deleteMenuItem(id: number): Promise<void> {
  return apiDelete(`/menu/${id}`)
}
