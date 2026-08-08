import { useEffect, useState } from 'react'
import {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  updateMenuItem,
  type MenuCategory,
  type MenuItem,
} from '@/api/menu'

const CATEGORIES: { value: MenuCategory; label: string }[] = [
  { value: 'entree', label: 'Entrée' },
  { value: 'salade', label: 'Salade' },
  { value: 'burger', label: 'Burger' },
  { value: 'plat', label: 'Plat' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'cocktail', label: 'Cocktail' },
  { value: 'boisson', label: 'Boisson' },
]

/** Formulaire vide pour la création. */
const EMPTY_FORM = {
  slug: '',
  name: '',
  description: '',
  price: 0,
  category: 'plat' as MenuCategory,
  image: '',
  badge: '',
  is_available: true,
  is_dish_of_day: false,
  sort_order: 0,
}

type FormState = typeof EMPTY_FORM

const DIACRITICS = /[̀-ͯ]/g

/** Génère un slug lisible à partir du nom (identique à la convention du front public). */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<MenuItem | 'new' | null>(null)

  useEffect(() => {
    loadMenu()
  }, [])

  const loadMenu = () => {
    setLoading(true)
    listMenuItems()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleToggle = async (item: MenuItem, field: 'is_available' | 'is_dish_of_day') => {
    // Mise à jour optimiste : la ligne réagit immédiatement au clic.
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, [field]: !i[field] } : i))
    )
    try {
      await updateMenuItem(item.id, { [field]: !item[field] })
    } catch {
      loadMenu()
      alert('La modification a échoué.')
    }
  }

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Supprimer « ${item.name} » du menu ?`)) return
    try {
      await deleteMenuItem(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch {
      alert('La suppression a échoué.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">Gestion du Menu</h1>
          <p className="mt-2 text-muted">{items.length} plats au total</p>
        </div>
        <button type="button" onClick={() => setEditing('new')} className="btn btn-gold">
          + Ajouter un plat
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-primary/10 bg-primary/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Plat</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Catégorie
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Prix</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Disponible
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                  Plat du jour
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-primary/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-primary">{item.name}</div>
                        {item.badge && <span className="text-xs text-accent">{item.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm capitalize text-muted">{item.category}</td>
                  <td className="px-6 py-4 font-medium text-primary">
                    {item.price.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggle(item, 'is_available')}
                      aria-label={`Basculer la disponibilité de ${item.name}`}
                      className={`inline-block h-3 w-3 rounded-full transition-colors ${
                        item.is_available ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggle(item, 'is_dish_of_day')}
                      aria-label={`Basculer plat du jour pour ${item.name}`}
                      className="text-sm transition-opacity hover:opacity-70"
                    >
                      {item.is_dish_of_day ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(item)}
                      className="mr-3 text-sm font-medium text-accent hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <MenuItemForm
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            loadMenu()
          }}
        />
      )}
    </div>
  )
}

function MenuItemForm({
  item,
  onClose,
  onSaved,
}: {
  item: MenuItem | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(
    item
      ? {
          slug: item.slug,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image ?? '',
          badge: item.badge ?? '',
          is_available: item.is_available,
          is_dish_of_day: item.is_dish_of_day,
          sort_order: item.sort_order,
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      image: form.image || undefined,
      badge: form.badge || undefined,
      is_available: form.is_available,
      is_dish_of_day: form.is_dish_of_day,
      sort_order: Number(form.sort_order),
    }

    try {
      if (item) {
        await updateMenuItem(item.id, payload)
      } else {
        await createMenuItem({ ...payload, slug: form.slug || slugify(form.name) })
      }
      onSaved()
    } catch {
      setError("L'enregistrement a échoué. Vérifiez les champs et réessayez.")
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/60 p-4"
      onClick={onClose}
    >
      <div
        className="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <h2 className="font-heading text-2xl font-bold text-primary">
            {item ? 'Modifier le plat' : 'Nouveau plat'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-2xl leading-none text-muted hover:text-primary"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-primary">Nom</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={adminInput}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-primary">Description</span>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={adminInput}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-primary">Prix (FCFA)</span>
              <input
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className={adminInput}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-primary">Catégorie</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as MenuCategory })}
                className={adminInput}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-primary">
              Image (chemin public)
            </span>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className={adminInput}
              placeholder="/medias/menu_photos/menu_photo01.jpg"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-primary">
                Badge (facultatif)
              </span>
              <input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className={adminInput}
                placeholder="Signature, Bestseller…"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-primary">Ordre</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className={adminInput}
              />
            </label>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
              />
              <span className="text-sm text-primary">Disponible</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_dish_of_day}
                onChange={(e) => setForm({ ...form, is_dish_of_day: e.target.checked })}
              />
              <span className="text-sm text-primary">Plat du jour</span>
            </label>
          </div>

          {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn btn-gold flex-1 disabled:opacity-60">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-outline text-primary">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const adminInput =
  'w-full rounded-md border border-primary/20 bg-white px-4 py-2.5 text-primary transition-colors focus:border-accent focus:outline-none'
