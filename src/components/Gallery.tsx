import { useEffect, useMemo, useState } from 'react'
import SectionHeader from './SectionHeader'
import FilterButton from './FilterButton'
import Lightbox from './Lightbox'
import { useFilters } from '@/hooks/useFilters'
import { useLightbox } from '@/hooks/useLightbox'
import { galleryImages, GALLERY_CATEGORIES } from '@/data/galleryItems'
import { listGalleryImages } from '@/api/gallery'
import { CONTACT } from '@/data/hours'
import type { GalleryImage, GalleryCategory } from '@/types/gallery'

export default function Gallery() {
  const { active, setActive, matches } = useFilters<GalleryCategory>()
  const [images, setImages] = useState<GalleryImage[]>(galleryImages)

  useEffect(() => {
    listGalleryImages(true)
      .then((published) => {
        if (published.length === 0) return
        setImages(
          published.map((img) => ({
            id: String(img.id),
            src: img.src,
            alt: img.alt,
            caption: img.caption,
            category: img.category,
            size: img.size as GalleryImage['size'],
          }))
        )
      })
      .catch(() => {
        /* API indisponible : on garde la galerie statique. */
      })
  }, [])

  const visible = useMemo(() => images.filter((img) => matches(img.category)), [images, matches])
  const lightbox = useLightbox(visible.length)

  return (
    <section id="gallery" className="bg-cream py-24 md:py-32">
      <div className="container-yard">
        <SectionHeader
          eyebrow="Galerie"
          title={
            <>
              Moments <em className="text-gradient-gold not-italic">Inoubliables</em>
            </>
          }
        />

        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {GALLERY_CATEGORIES.map((cat) => (
            <FilterButton key={cat.value} label={cat.label} active={active === cat.value} onClick={() => setActive(cat.value)} />
          ))}
        </div>

        <div className="grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((img, i) => (
            <button
              type="button"
              key={img.id}
              onClick={() => lightbox.open(i)}
              aria-label={`Ouvrir : ${img.caption}`}
              className={[
                'group relative overflow-hidden rounded-md shadow-soft',
                img.size === 'wide' ? 'col-span-2' : '',
                img.size === 'tall' ? 'row-span-2' : '',
              ].join(' ')}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                <span className="font-heading text-base italic text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {img.caption}
                </span>
                <span className="text-[10px] font-accent uppercase tracking-[0.2em] text-cream/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  La Marquise
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href={CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline border-primary text-primary hover:bg-primary hover:text-cream"
          >
            📸 Suivez-nous sur Instagram
          </a>
        </div>
      </div>

      {lightbox.isOpen && lightbox.index !== null && (
        <Lightbox images={visible} index={lightbox.index} onClose={lightbox.close} onPrev={lightbox.prev} onNext={lightbox.next} />
      )}
    </section>
  )
}
