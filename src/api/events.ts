// API events : réservations d'événement.

import { apiGet, apiPatch, apiPost } from './client'

export type EventStatus =
  | 'quote'
  | 'pending_deposit'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
export type PaymentMethod = 'cash' | 'mobile_money' | 'card' | 'transfer'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'

export interface EventBooking {
  id: number
  reference: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  event_type: string
  event_date: string
  start_time: string
  end_time: string | null
  guest_count: number
  location: string
  details: string
  internal_notes: string
  space: string
  decoration_theme: string
  decoration_colors: string
  catering_formula: string
  options: string[]
  dietary_notes: string
  budget_estimate: number
  quote_amount: number
  deposit_amount: number
  deposit_paid: number
  balance_due: number
  payment_method: PaymentMethod | null
  payment_status: PaymentStatus
  status: EventStatus
  quote_sent_at: string | null
  confirmed_at: string | null
  cancelled_reason: string
  created_at: string
  updated_at: string
}

export interface EventBookingCreatePayload {
  customer_name: string
  customer_phone: string
  customer_email?: string
  event_type: string
  event_date: string
  start_time: string
  end_time?: string
  guest_count: number
  location?: string
  details?: string
  space?: string
  decoration_theme?: string
  decoration_colors?: string
  catering_formula?: string
  options?: string[]
  dietary_notes?: string
  budget_estimate?: number
}

export interface EventBookingUpdatePayload {
  quote_amount?: number
  deposit_amount?: number
  deposit_paid?: number
  payment_method?: PaymentMethod
  payment_status?: PaymentStatus
  status?: EventStatus
  internal_notes?: string
}

export async function listEvents(filters?: {
  date_from?: string
  date_to?: string
  status?: EventStatus
}): Promise<EventBooking[]> {
  const params = new URLSearchParams()
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.status) params.append('status', filters.status)

  const query = params.toString()
  return apiGet<EventBooking[]>(`/events${query ? `?${query}` : ''}`)
}

export async function getEvent(id: number): Promise<EventBooking> {
  return apiGet<EventBooking>(`/events/${id}`)
}

export interface EventBookingCreateResponse {
  event: EventBooking
  whatsapp_url: string | null
}

export async function createEvent(
  payload: EventBookingCreatePayload
): Promise<EventBookingCreateResponse> {
  return apiPost<EventBookingCreateResponse>('/events', payload)
}

export async function updateEvent(
  id: number,
  payload: EventBookingUpdatePayload
): Promise<EventBooking> {
  return apiPatch<EventBooking>(`/events/${id}`, payload)
}
