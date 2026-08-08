/** Page de gestion des comptes back-office (réservée au super administrateur). */

import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { createUser, deleteUser, listUsers, updateUser, type UserCreateRequest, type UserUpdateRequest } from '@/api/users'
import { ROLE_LABELS, type User, type UserRole } from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import { ModalShell, inputClass } from '@/components/ModalKit'

/** Formulaire vide pour la création. */
const EMPTY_FORM: UserCreateRequest = {
  email: '',
  full_name: '',
  password: '',
  role: 'manager',
  is_active: true,
}

type FormState = UserCreateRequest

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'super_admin', label: 'Super administrateur' },
  { value: 'owner', label: 'Propriétaire' },
  { value: 'manager', label: 'Gestionnaire' },
  { value: 'admin', label: 'Administrateur (hérité)' },
  { value: 'staff', label: 'Personnel (hérité)' },
]

export default function Users() {
  const { user: currentUser } = useAuth()
  const isSelf = (u: User) => u.id === currentUser?.id
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<User | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  // Garde-fou client : seuls les super_admin accèdent à la gestion des comptes.
  if (currentUser && currentUser.role !== 'super_admin') {
    return <Navigate to="/admin" replace />
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await listUsers()
      setUsers(data)
    } catch {
      setError('Impossible de charger la liste des utilisateurs.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenNew = () => {
    setForm(EMPTY_FORM)
    setEditing('new')
    setError('')
  }

  const handleOpenEdit = (user: User) => {
    setForm({
      email: user.email,
      full_name: user.full_name,
      password: '',
      role: user.role,
      is_active: user.is_active,
    })
    setEditing(user)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (editing === 'new') {
        await createUser(form)
      } else if (editing !== null) {
        // Pour l'édition, on ne renvoie que les champs modifiés.
        const payload: UserUpdateRequest = {
          full_name: form.full_name,
          role: form.role,
          is_active: form.is_active,
        }
        if (form.password) payload.password = form.password
        await updateUser(editing.id, payload)
      }
      setEditing(null)
      loadUsers()
    } catch {
      setError("L'enregistrement a échoué. Vérifiez l'email et le mot de passe.")
      setSaving(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Supprimer le compte « ${user.full_name} » (${user.email}) ?`)) return
    try {
      await deleteUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">Utilisateurs</h1>
          <p className="mt-1 text-sm text-muted">Gestion des comptes back-office</p>
        </div>
        <button type="button" onClick={handleOpenNew} className="btn btn-gold">
          + Ajouter un compte
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <div className="rounded-lg border border-primary/10 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Rôle</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Statut</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  Aucun compte pour l'instant.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-cream/30">
                  <td className="px-4 py-4 font-medium text-primary">{user.full_name}</td>
                  <td className="px-4 py-4 text-sm text-muted">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent">
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                      {user.is_active ? '● Actif' : '● Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modale création / édition */}
      {editing && (
        <ModalShell onClose={() => setEditing(null)} titleId="user-modal-title" wide>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <span className="eyebrow">{editing === 'new' ? 'Création' : 'Modification'}</span>
              <h2 id="user-modal-title" className="mt-3 font-heading text-3xl text-primary">
                {editing === 'new' ? 'Nouveau compte' : `Modifier « ${editing.full_name} »`}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Fermer"
              className="text-3xl leading-none text-muted transition-colors hover:text-primary"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-primary">Nom complet</span>
                <input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className={inputClass}
                  placeholder="Ex. Marie Dupont"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-primary">Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                  placeholder="marie@lamarquise-douala.com"
                  disabled={editing !== 'new'}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-primary">
                {editing === 'new' ? 'Mot de passe' : 'Nouveau mot de passe (laisser vide pour conserver)'}
              </span>
              <input
                type="password"
                { ...(editing === 'new' ? { required: true } : {}) }
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass}
                minLength={8}
                placeholder={editing === 'new' ? '8 caractères minimum' : '••••••••'}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-primary">Rôle</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className={inputClass}
                  disabled={editing !== 'new' && isSelf(editing)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {editing !== 'new' && isSelf(editing) && (
                  <p className="mt-1 text-xs text-muted">Votre propre rôle ne peut pas être modifié.</p>
                )}
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  disabled={editing !== 'new' && isSelf(editing)}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-primary/30 text-accent focus:ring-accent disabled:cursor-not-allowed"
                />
                <span className="text-sm font-medium text-primary">Compte actif</span>
              </label>
            </div>

            {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="btn btn-gold disabled:opacity-60">
                {saving ? 'Enregistrement…' : editing === 'new' ? 'Créer le compte' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  )
}