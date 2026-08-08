// API orders : commandes (sur place, à emporter, livraison).

import { apiGet, apiPatch, apiPost } from './client'

export type OrderType = 'dine_in' | 'takeaway' | 'delivery'
export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'completed'
  | 'cancelled'
export type PaymentMethod = 'cash' | 'mobile_money' | 'card' | 'transfer'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'

export interface OrderItem {
  id: number
  menu_item_id: number | null
  name: string
  unit_price: number
  quantity: number
  notes: string
  line_total: number
}

export interface Order {
  id: number
  reference: string
  customer_name: string
  customer_phone: string
  order_type: OrderType
  status: OrderStatus
  delivery_address: string
  delivery_district: string
  delivery_fee: number
  courier_name: string
  table_number: string | null
  subtotal: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  customer_notes: string
  internal_notes: string
  whatsapp_sent: boolean
  whatsapp_error: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderCreatePayload {
  customer_name: string
  customer_phone: string
  order_type: OrderType
  delivery_address?: string
  delivery_district?: string
  table_number?: string
  customer_notes?: string
  payment_method?: PaymentMethod
  items: { menu_item_id: number; quantity: number; notes?: string }[]
}

export interface OrderCreateResponse {
  order: Order
  whatsapp_url: string | null
}

export interface OrderUpdatePayload {
  status?: OrderStatus
  courier_name?: string
  payment_status?: PaymentStatus
  internal_notes?: string
}

export async function listOrders(filters?: {
  date_from?: string
  date_to?: string
  status?: OrderStatus
  order_type?: OrderType
}): Promise<Order[]> {
  const params = new URLSearchParams()
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.order_type) params.append('order_type', filters.order_type)

  const query = params.toString()
  return apiGet<Order[]>(`/orders${query ? `?${query}` : ''}`)
}

export async function getOrder(id: number): Promise<Order> {
  return apiGet<Order>(`/orders/${id}`)
}

export async function createOrder(
  payload: OrderCreatePayload
): Promise<OrderCreateResponse> {
  return apiPost<OrderCreateResponse>('/orders', payload)
}

export async function updateOrder(
  id: number,
  payload: OrderUpdatePayload
): Promise<Order> {
  return apiPatch<Order>(`/orders/${id}`, payload)
}
