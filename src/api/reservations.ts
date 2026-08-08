// API reservations : réservations de table.

import { apiGet, apiPatch, apiPost } from './client'

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface Reservation {
  id: number
  reference: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  reservation_date: string
  reservation_time: string
  party_size: number
  table_number: string | null
  special_requests: string
  internal_notes: string
  status: ReservationStatus
  confirmed_at: string | null
  cancelled_reason: string
  created_at: string
  updated_at: string
}

export interface ReservationCreatePayload {
  customer_name: string
  customer_phone: string
  customer_email?: string
  reservation_date: string
  reservation_time: string
  party_size: number
  special_requests?: string
}

export interface ReservationUpdatePayload {
  status?: ReservationStatus
  table_number?: string
  internal_notes?: string
}

export async function listReservations(filters?: {
  date_from?: string
  date_to?: string
  status?: ReservationStatus
}): Promise<Reservation[]> {
  const params = new URLSearchParams()
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.status) params.append('status', filters.status)

  const query = params.toString()
  return apiGet<Reservation[]>(`/reservations${query ? `?${query}` : ''}`)
}

export async function getReservation(id: number): Promise<Reservation> {
  return apiGet<Reservation>(`/reservations/${id}`)
}

export interface ReservationCreateResponse {
  reservation: Reservation
  whatsapp_url: string | null
}

export async function createReservation(
  payload: ReservationCreatePayload
): Promise<ReservationCreateResponse> {
  return apiPost<ReservationCreateResponse>('/reservations', payload)
}

export async function updateReservation(
  id: number,
  payload: ReservationUpdatePayload
): Promise<Reservation> {
  return apiPatch<Reservation>(`/reservations/${id}`, payload)
}
