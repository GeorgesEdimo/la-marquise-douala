// API feedback : soumission publique + consultation dashboard.

import { apiGet, apiPost } from './client'

export interface FeedbackCreatePayload {
  rating: number | null
  comment: string
}

export interface Feedback {
  id: number
  reference: string
  kind: string
  customer_name: string
  customer_phone: string
  rating: number | null
  comment: string
  created_at: string
}

/** Soumet un retour client (public, sans auth). */
export async function submitFeedback(
  reference: string,
  payload: FeedbackCreatePayload
): Promise<Feedback> {
  return apiPost<Feedback>(`/feedback/${reference}`, payload)
}

/** Consulte le retour client pour une référence (public, pour la page reçu). */
export async function getFeedback(reference: string): Promise<Feedback> {
  return apiGet<Feedback>(`/feedback/${reference}`)
}

/** Liste tous les retours clients (dashboard). */
export async function listFeedbacks(): Promise<Feedback[]> {
  return apiGet<Feedback[]>('/feedback')
}
