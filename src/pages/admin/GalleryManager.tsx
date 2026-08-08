import { useEffect, useState } from 'react'
import {
  createGalleryImage,
  deleteGalleryImage,
  listGalleryImages,
  updateGalleryImage,
  type GalleryCategory,
  type GalleryImage,
} from '@/api/gallery'

const CATEGORIES: { value: GalleryCategory; label: string }[] = [
  { value: 'interieur', label: 'Intérieur' },
  { value: 'terrasse', label: 'Terrasse' },
  { value: 'plats', label: 'Plats' },
  { value: 'cocktails', label: 'Cocktails' },
  { value: 'evenements', label: 'Événements' },
]

const SIZES = [
  { value: 'default', label: 'Normale' },
  { value: 'wide', label: 'Large' },
  { value: 'tall', label: 'Haute' },
]

const EMPTY_FORM = {
  src: '',
  alt: '',
  caption: '',
  category: 'interieur' as GalleryCategory,
  size: 'default',
  is_published: true,
  sort_order: 0,
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<GalleryImage | 'new' | null>(null)

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = () => {
    setLoading(true)
    listGalleryImages()
      .then(setImages)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleTogglePublished = async (image: GalleryImage) => {
    setImages((prev) =>
      prev.map((i) => (i.id === image.id ? { ...i, is_published: !i.is_published } : i))
    )
    try {
      await updateGalleryImage(image.id, { is_published: !image.is_published })
    } catch {
      loadGallery()
      alert('La modification a échoué.')
    }
  }

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm('Supprimer ce média de la galerie ?')) return
    try {
      await deleteGalleryImage(image.id)
      setImages((prev) => prev.filter((i) => i.id !== image.id))
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
          <h1 className="font-heading text-4xl font-bold text-primary">Gestion de la Galerie</h1>
          <p className="mt-2 text-muted">{images.length} médias au total</p>
        </div>
        <button type="button" onClick={() => setEditing('new')} className="btn btn-gold">
          + Ajouter un média
        </button>
      </div>

      {images.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted">
            Aucun média pour l'instant. Ajoutez vos premières photos avec le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="glass-card overflow-hidden">
              <div className="aspect-square">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget
                    el.style.display = 'none'
                    const parent = el.parentElement
                    if (parent && !parent.querySelector('.img-error')) {
                      const msg = document.createElement('div')
                      msg.className = 'img-error flex h-full w-full items-center justify-center bg-red-50 p-4 text-center text-xs text-red-500'
                      msg.textContent = `Image introuvable : ${image.src}`
                      parent.appendChild(msg)
                    }
                  }}
                />
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium capitalize text-accent">
                    {image.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTogglePublished(image)}
                    aria-label={image.is_published ? 'Dépublier' : 'Publier'}
                    className={`h-3 w-3 rounded-full transition-colors ${
                      image.is_published ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </div>
                {image.caption && <p className="text-sm text-muted">{image.caption}</p>}

                <div className="mt-3 flex gap-3 border-t border-primary/10 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditing(image)}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <GalleryImageForm
          image={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            loadGallery()
          }}
        />
      )}
    </div>
  )
}

function GalleryImageForm({
  image,
  onClose,
  onSaved,
}: {
  image: GalleryImage | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState(
    image
      ? {
          src: image.src,
          alt: image.alt,
          caption: image.caption,
          category: image.category,
          size: image.size,
          is_published: image.is_published,
          sort_order: image.sort_order,
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (image) {
        await updateGalleryImage(image.id, {
          alt: form.alt,
          caption: form.caption,
          category: form.category,
          size: form.size,
          is_published: form.is_published,
          sort_order: Number(form.sort_order),
        })
      } else {
        await createGalleryImage({ ...form, sort_order: Number(form.sort_order) })
      }
      onSaved()
    } catch {
      setError("L'enregistrement a échoué. Vérifiez le chemin de l'image.")
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
            {image ? 'Modifier le média' : 'Nouveau média'}
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
          {!image && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-primary">
                Chemin de l'image
              </span>
              <input
                required
                value={form.src}
                onChange={(e) => setForm({ ...form, src: e.target.value })}
                className={adminInput}
                placeholder="/images/interieur-0.webp"
              />
              <span className="mt-1 block text-xs text-muted">
                Déposez le fichier dans le dossier public/ puis indiquez son chemin.
              </span>
            </label>
          )}

          {form.src && (
            <img
              src={form.src}
              alt="Aperçu"
              className="h-40 w-full rounded-md object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-primary">
              Texte alternatif (accessibilité)
            </span>
            <input
              value={form.alt}
              onChange={(e) => setForm({ ...form, alt: e.target.value })}
              className={adminInput}
              placeholder="Terrasse au coucher du soleil"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-primary">Légende</span>
            <input
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className={adminInput}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-primary">Catégorie</span>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as GalleryCategory })
                }
                className={adminInput}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-primary">
                Taille dans la mosaïque
              </span>
              <select
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className={adminInput}
              >
                {SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              />
              <span className="text-sm text-primary">Publié sur le site</span>
            </label>

            <label className="flex items-center gap-2">
              <span className="text-sm text-primary">Ordre</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="w-20 rounded-md border border-primary/20 bg-white px-3 py-1.5 text-primary"
              />
            </label>
          </div>

          {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-gold flex-1 disabled:opacity-60"
            >
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
