// API auth : login, user info.

import { apiGet, ApiError } from './client'

export interface LoginRequest {
  username: string // email
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

/** Rôles du back-office, du plus au moins privilégié. */
export type UserRole = 'super_admin' | 'owner' | 'manager' | 'admin' | 'staff'

/** Libellés français et icônes des rôles pour l'affichage dashboard. */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super administrateur',
  owner: 'Propriétaire',
  manager: 'Gestionnaire',
  admin: 'Administrateur',
  staff: 'Personnel',
}

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
}

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  // OAuth2 form urlencoded
  const formData = new URLSearchParams()
  formData.append('username', credentials.username)
  formData.append('password', credentials.password)

  let response: Response
  try {
    response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      }
    )
  } catch {
    // Serveur injoignable (hors ligne, CORS, etc.)
    throw new ApiError('Serveur injoignable', 0)
  }

  if (!response.ok) {
    throw new ApiError('Identifiants invalides', response.status)
  }

  return response.json()
}

export async function getCurrentUser(): Promise<User> {
  return apiGet<User>('/auth/me')
}
