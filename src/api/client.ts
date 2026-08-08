// Client API fetch wrapper avec gestion JWT et erreurs.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('auth_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Déconnexion automatique sur 401
  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/admin/login'
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new ApiError(
      error.detail || 'Request failed',
      response.status,
      error
    )
  }

  return response
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint)
  return response.json()
}

export async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
  return response.json()
}

export async function apiPatch<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function apiDelete(endpoint: string): Promise<void> {
  await fetchWithAuth(endpoint, { method: 'DELETE' })
}
