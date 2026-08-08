import { useCallback, useEffect, useState } from 'react'

/**
 * Generic category filter with an `all` bucket.
 * This is the logic missing from the legacy site — filter buttons existed in
 * markup but were never wired up.
 */
export function useFilters<T extends string>(initial: T | 'all' = 'all') {
  const [active, setActive] = useState<T | 'all'>(initial)

  const matches = useCallback(
    (category: T) => active === 'all' || active === category,
    [active]
  )

  return { active, setActive, matches }
}

/**
 * IntersectionObserver-based reveal — adds a boolean when the element enters
 * the viewport. Replaces the legacy `.reveal`/`.visible` class toggling.
 */
export function useReveal<T extends HTMLElement>() {
  const [ref, setRef] = useState<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref || visible) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, visible])

  return { ref: setRef, visible }
}
