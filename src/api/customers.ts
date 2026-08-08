// API customers : fiche client (fidélisation).

import { apiGet } from './client'

export interface Customer {
  id: number
  phone: string
  full_name: string
  email: string | null
  notes: string
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export async function listCustomers(): Promise<Customer[]> {
  return apiGet<Customer[]>('/customers')
}

export async function getCustomer(id: number): Promise<Customer> {
  return apiGet<Customer>(`/customers/${id}`)
}
