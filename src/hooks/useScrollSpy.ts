import { useEffect, useState } from 'react'

/**
 * Tracks whether the page is scrolled past a threshold, plus the id of the
 * section currently in view (for active nav highlighting).
 * Ported from legacy script.js handleNavScroll.
 */
export function useScrollSpy(sectionIds: string[], offset = 200) {
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80)

      let current = ''
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - offset) {
          current = id
        }
      }
      setActiveId(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [sectionIds, offset])

  return { scrolled, activeId }
}
