/** Page des fiches clients — consolidation par téléphone (fidélisation). */

import { useEffect, useMemo, useState } from 'react'
import { listCustomers, type Customer } from '@/api/customers'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = () => {
    setLoading(true)
    listCustomers()
      .then(setCustomers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email ?? '').toLowerCase().includes(q)
    )
  }, [customers, search])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">Clients</h1>
          <p className="mt-2 text-muted">
            {customers.length} clients — consolidés par numéro de téléphone
          </p>
        </div>
        <div className="w-full max-w-xs">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Rechercher (nom, téléphone, email)"
            className="w-full rounded-lg border border-primary/20 bg-white px-4 py-2.5 text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-primary/10 bg-primary/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Nom</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Téléphone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Email</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-primary">Commandes</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary">Total dépensé</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-primary/5">
                    <td className="px-6 py-4 font-medium text-primary">{customer.full_name}</td>
                    <td className="px-6 py-4 text-sm text-muted">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm text-muted">{customer.email || '—'}</td>
                    <td className="px-6 py-4 text-center text-sm text-muted">
                      {customer.total_orders}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-primary">
                      {customer.total_spent.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelected(customer)}
                        className="text-sm font-medium text-accent hover:text-accent-dark"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détails */}
      {selected && (
        <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function CustomerDetailModal({
  customer,
  onClose,
}: {
  customer: Customer
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/60 p-4">
      <div className="glass-card w-full max-w-md p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">
              {customer.full_name}
            </h2>
            <p className="mt-1 text-sm text-muted">{customer.phone}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-muted hover:text-primary">
            ×
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-primary/5 px-4 py-3">
              <p className="text-xs font-medium text-muted">Commandes</p>
              <p className="mt-1 font-heading text-2xl font-bold text-primary">
                {customer.total_orders}
              </p>
            </div>
            <div className="rounded-lg bg-primary/5 px-4 py-3">
              <p className="text-xs font-medium text-muted">Total dépensé</p>
              <p className="mt-1 font-heading text-2xl font-bold text-primary">
                {customer.total_spent.toLocaleString()} FCFA
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-primary">Email</h3>
            <p className="text-muted">{customer.email || 'Non renseigné'}</p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-primary">Notes internes</h3>
            <p className="text-muted">{customer.notes || 'Aucune note'}</p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-primary">Client depuis</h3>
            <p className="text-muted">
              {new Date(customer.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}