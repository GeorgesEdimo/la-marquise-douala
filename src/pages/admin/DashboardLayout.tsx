import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  return (
    <div className="flex min-h-screen bg-cream-dark">
      <aside className="fixed left-0 top-0 z-20 h-full w-64 border-r border-accent/10 bg-primary-dark text-cream">
        <div className="flex h-full flex-col">
          <div className="border-b border-cream/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40">
                <span className="font-heading text-sm font-bold text-accent">LM</span>
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold text-gold">La Marquise</h1>
                <p className="text-[11px] uppercase tracking-luxe text-cream/50">Dashboard Admin</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {[
              { to: '/admin', label: '📊 Vue d\'ensemble', end: true },
              { to: '/admin/orders', label: '🛎️ Commandes' },
              { to: '/admin/reservations', label: '📅 Réservations' },
              { to: '/admin/events', label: '🎉 Événements' },
              { to: '/admin/menu', label: '🍽️ Menu' },
              { to: '/admin/gallery', label: '📷 Galerie' },
              { to: '/admin/feedback', label: '⭐ Retours clients' },
              { to: '/admin/customers', label: '👤 Clients' },
              ...(isSuperAdmin ? [{ to: '/admin/users', label: '👥 Utilisateurs' }] : []),
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : undefined}
                className={({ isActive }) =>
                  `block rounded-md px-4 py-2.5 font-medium transition-colors ${
                    isActive ? 'bg-accent text-primary-dark' : 'text-cream/80 hover:bg-primary hover:text-cream'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-cream/10 p-4">
            <div className="mb-3 rounded-md bg-primary p-4">
              <p className="text-sm font-medium text-cream">{user?.full_name}</p>
              <p className="text-xs text-cream/60">{user?.email}</p>
            </div>
            <button onClick={logout} className="w-full rounded-md bg-cream/10 px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-cream/20">
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
