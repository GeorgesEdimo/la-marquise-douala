import { useEffect, useState } from 'react'

/**
 * Cycles through slideshow indices at a fixed interval.
 * Ported from legacy script.js hero slideshow.
 */
export function useSlideshow(length: number, intervalMs = 5000): number {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (length <= 1) return
    const id = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [length, intervalMs])

  return current
}
