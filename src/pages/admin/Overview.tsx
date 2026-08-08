import { useEffect, useState } from 'react'
import { getStatsOverview, type StatsOverview } from '@/api/stats'

export default function Overview() {
  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStatsOverview()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Impossible de charger les statistiques
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-primary">Vue d'ensemble</h1>
        <p className="mt-2 text-muted">Tableau de bord — La Marquise</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="CA du jour"
          value={`${stats.revenue_today.toLocaleString()} FCFA`}
          icon="💰"
          color="gold"
        />
        <StatCard
          title="Nouvelles commandes"
          value={stats.orders_new}
          icon="🛎️"
          color="blue"
        />
        <StatCard
          title="En préparation"
          value={stats.orders_preparing}
          icon="👨‍🍳"
          color="orange"
        />
        <StatCard
          title="Prêtes"
          value={stats.orders_ready}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Réservations à venir"
          value={stats.reservations_upcoming}
          icon="📅"
          color="purple"
        />
        <StatCard
          title="Événements (acompte)"
          value={stats.events_pending_deposit}
          icon="🎉"
          color="pink"
        />
      </div>

      <div className="mt-8 glass-card p-6">
        <h2 className="mb-4 font-heading text-2xl font-semibold text-primary">
          Actions rapides
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/admin/orders"
            className="block rounded-lg border border-primary/10 bg-white p-4 transition-all hover:border-accent hover:shadow-soft"
          >
            <div className="text-2xl">🛎️</div>
            <h3 className="mt-2 font-medium text-primary">Gérer les commandes</h3>
            <p className="mt-1 text-sm text-muted">
              {stats.orders_new + stats.orders_preparing} en cours
            </p>
          </a>
          <a
            href="/admin/reservations"
            className="block rounded-lg border border-primary/10 bg-white p-4 transition-all hover:border-accent hover:shadow-soft"
          >
            <div className="text-2xl">📅</div>
            <h3 className="mt-2 font-medium text-primary">Réservations</h3>
            <p className="mt-1 text-sm text-muted">
              {stats.reservations_upcoming} à venir
            </p>
          </a>
          <a
            href="/admin/events"
            className="block rounded-lg border border-primary/10 bg-white p-4 transition-all hover:border-accent hover:shadow-soft"
          >
            <div className="text-2xl">🎉</div>
            <h3 className="mt-2 font-medium text-primary">Événements</h3>
            <p className="mt-1 text-sm text-muted">
              {stats.events_pending_deposit} en attente d'acompte
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: 'gold' | 'blue' | 'orange' | 'green' | 'purple' | 'pink'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    gold: 'from-accent/10 to-accent/5 border-accent/20',
    blue: 'from-blue-50 to-blue-25 border-blue-200',
    orange: 'from-orange-50 to-orange-25 border-orange-200',
    green: 'from-green-50 to-green-25 border-green-200',
    purple: 'from-purple-50 to-purple-25 border-purple-200',
    pink: 'from-pink-50 to-pink-25 border-pink-200',
  }

  return (
    <div
      className={`rounded-lg border bg-gradient-to-br p-6 ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 font-heading text-3xl font-bold text-primary">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}
