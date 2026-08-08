// API receipts : envoi de reçus au client + consultation du reçu public.

import { apiGet, apiPost } from './client'

export type ReceiptStage = 'created' | 'confirmed' | 'completed'
export type SubjectKind = 'order' | 'reservation' | 'event'

export interface SendReceiptResponse {
  kind: SubjectKind
  stage: ReceiptStage
  reference: string
  message_preview: string
  whatsapp_url: string | null
  receipt_url: string
  qr_base64: string
}

export interface ReceiptDetail {
  kind: SubjectKind
  reference: string
  customer_name: string
  status: string
  items_summary: string
  total: string
  date_info: string
  qr_base64: string
}

/** Envoie un reçu au client (activation manuelle depuis le dashboard). */
export async function sendReceipt(
  kind: SubjectKind,
  itemId: number,
  stage: ReceiptStage
): Promise<SendReceiptResponse> {
  return apiPost<SendReceiptResponse>(`/receipts/${kind}/${itemId}/${stage}`)
}

/** Récupère les détails d'un reçu par référence (page publique). */
export async function getReceiptDetail(reference: string): Promise<ReceiptDetail> {
  return apiGet<ReceiptDetail>(`/receipts/${reference}`)
}
