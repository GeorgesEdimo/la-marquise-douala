import { useCallback, useEffect, useState } from 'react'

/**
 * Lightbox controller: open with an index, navigate prev/next (wrapping),
 * close on Escape, navigate with arrow keys. Locks body scroll while open.
 * Ported from legacy script.js lightbox.
 */
export function useLightbox(total: number) {
  const [index, setIndex] = useState<number | null>(null)
  const isOpen = index !== null

  const open = useCallback((i: number) => setIndex(i), [])
  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + total) % total)),
    [total]
  )
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % total)),
    [total]
  )

  useEffect(() => {
    if (!isOpen) return

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, close, prev, next])

  return { index, isOpen, open, close, prev, next }
}
