import type { GalleryImage } from '@/types/gallery'

interface LightboxProps {
  images: GalleryImage[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

/** Accessible modal lightbox with prev/next. Keyboard handled in useLightbox. */
export default function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const image = images[index]
  if (!image) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={image.caption}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-cream transition-colors hover:bg-white/20"
        aria-label="Fermer"
        onClick={onClose}
      >
        &times;
      </button>

      <button
        type="button"
        className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-cream transition-colors hover:bg-white/20 md:left-8"
        aria-label="Image précédente"
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
      >
        &#10094;
      </button>

      <figure className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-[80vh] w-auto rounded-md object-contain shadow-soft-lg"
        />
        <figcaption className="mt-4 text-center font-heading text-xl italic text-cream">
          {image.caption}
        </figcaption>
      </figure>

      <button
        type="button"
        className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-cream transition-colors hover:bg-white/20 md:right-8"
        aria-label="Image suivante"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
      >
        &#10095;
      </button>
    </div>
  )
}
