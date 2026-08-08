// API users : gestion des comptes back-office (super admin uniquement).

import { apiDelete, apiGet, apiPatch, apiPost } from './client'
import type { User, UserRole } from './auth'

/* ---------- Types ---------- */

export interface UserCreateRequest {
  email: string
  full_name: string
  password: string
  role?: UserRole
  is_active?: boolean
}

export interface UserUpdateRequest {
  full_name?: string
  password?: string
  role?: UserRole
  is_active?: boolean
}

/* ---------- Endpoints ---------- */

/** Profil du compte connecté — tous les rôles. */
export async function getMe(): Promise<User> {
  return apiGet<User>('/users/me')
}

/** Liste des comptes back-office — super admin uniquement. */
export async function listUsers(): Promise<User[]> {
  return apiGet<User[]>('/users')
}

/** Crée un compte back-office. */
export async function createUser(data: UserCreateRequest): Promise<User> {
  return apiPost<User>('/users', data)
}

/** Met à jour un compte (nom, mot de passe, rôle, activation). */
export async function updateUser(userId: number, data: UserUpdateRequest): Promise<User> {
  return apiPatch<User>(`/users/${userId}`, data)
}

/** Supprime un compte. */
export async function deleteUser(userId: number): Promise<void> {
  return apiDelete(`/users/${userId}`)
}
