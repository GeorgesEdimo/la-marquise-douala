// API stats : KPIs dashboard.

import { apiGet } from './client'

export interface StatsOverview {
  revenue_today: number
  orders_new: number
  orders_preparing: number
  orders_ready: number
  reservations_upcoming: number
  events_pending_deposit: number
}

export async function getStatsOverview(): Promise<StatsOverview> {
  return apiGet<StatsOverview>('/stats/overview')
}
