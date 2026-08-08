import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

type ServerStatus = 'checking' | 'online' | 'offline'

function ServerIndicator() {
  const [status, setStatus] = useState<ServerStatus>('checking')

  useEffect(() => {
    fetch(`${API_BASE}/health`, { method: 'GET', mode: 'cors' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'))
  }, [])

  const config = {
    checking: { color: 'bg-yellow-400', pulse: true, label: 'Vérification…' },
    online: { color: 'bg-green-500', pulse: false, label: 'Serveur en ligne ✓' },
    offline: { color: 'bg-red-500', pulse: true, label: 'Serveur hors ligne ✗' },
  }[status]

  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <span className={`inline-block h-2 w-2 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
      <span>{config.label}</span>
      <span className="text-muted/60">({API_BASE})</span>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    localStorage.removeItem('auth_token')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ username: email, password })
      navigate('/admin')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('injoignable') || msg.includes('contacter')) {
        setError('Impossible de contacter le serveur. Vérifiez que le backend tourne (uvicorn) puis réessayez.')
      } else if (msg.includes('invalides') || msg.includes('Invalid') || msg.includes('incorrect')) {
        setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.')
      } else {
        setError('Erreur de connexion. Réessayez.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light px-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-10">
          {/* Monogramme */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-white/5">
              <span className="font-heading text-3xl font-bold text-accent">LM</span>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-bold text-primary">La Marquise</h1>
            <p className="mt-2 font-accent text-[11px] uppercase tracking-noblesse text-muted">
              Dashboard Administration
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-luxe text-primary">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-primary/20 bg-white px-4 py-3 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="admin@lamarquise-douala.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-luxe text-primary">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-primary/20 bg-white px-4 py-3 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn btn-gold btn-lg w-full disabled:opacity-50">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className="pt-1">
              <ServerIndicator />
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-cream/50">
          La Marquise Restaurant © 2026 — Eat • Enjoy • Win
        </p>
      </div>
    </div>
  )
}
