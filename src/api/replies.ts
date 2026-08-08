// API replies : répondre au client depuis le dashboard.

import { apiPost } from './client'

export interface ReplyRequest {
  message: string
  append_to_notes?: boolean
}

export interface ReplyResponse {
  reference: string
  customer_phone: string
  whatsapp_url: string | null
  sent: boolean
  error: string
}

type SubjectKind = 'order' | 'reservation' | 'event'

export async function replyToCustomer(
  kind: SubjectKind,
  itemId: number,
  payload: ReplyRequest
): Promise<ReplyResponse> {
  return apiPost<ReplyResponse>(`/replies/${kind}/${itemId}`, payload)
}