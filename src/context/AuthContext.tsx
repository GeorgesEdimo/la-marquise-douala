// Contexte d'authentification React.

import { createContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, login as apiLogin, type LoginRequest, type User } from '@/api/auth'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restaure la session si un jeton valide est déjà stocké.
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setLoading(false)
      return
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials: LoginRequest) => {
    const { access_token } = await apiLogin(credentials)
    localStorage.setItem('auth_token', access_token)
    setUser(await getCurrentUser())
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    window.location.href = '/admin/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
